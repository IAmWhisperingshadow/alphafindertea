import axios from "axios";
import Web3 from "web3";

// Initialize Web3 for Optimism
const OPTIMISM_RPC = process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io";
const web3 = new Web3(OPTIMISM_RPC);

/**
 * Filter safe tokens from a list
 * Removes obvious scams and risky tokens
 */
export async function filterSafeTokens(tokens) {
  console.log(`🛡️ Filtering ${tokens.length} tokens for safety...`);
  
  const safeTokens = [];
  
  for (const token of tokens) {
    try {
      // Basic checks
      if (!token.contractAddress || !token.liquidity?.usd) {
        continue;
      }
      
      // Minimum liquidity filter ($100)
      if (token.liquidity.usd < 100) {
        console.log(`⚠️ ${token.symbol}: Low liquidity ($${token.liquidity.usd})`);
        continue;
      }
      
      // Check for suspicious patterns
      const isSuspicious = checkSuspiciousPatterns(token);
      if (isSuspicious) {
        console.log(`⚠️ ${token.symbol}: Suspicious patterns detected`);
        continue;
      }
      
      // Quick honeypot check
      const honeypotResult = await quickHoneypotCheck(token.contractAddress);
      if (honeypotResult.isHoneypot) {
        console.log(`⚠️ ${token.symbol}: Honeypot detected`);
        continue;
      }
      
      // Add safety score
      token.safetyScore = calculateSafetyScore(token, honeypotResult);
      
      safeTokens.push(token);
      
    } catch (error) {
      console.error(`❌ Error checking ${token.symbol}:`, error.message);
    }
  }
  
  console.log(`✅ ${safeTokens.length} safe tokens found`);
  return safeTokens;
}

/**
 * Deep analysis of a TEA Protocol contract
 */
export async function analyzeTeaContract(contractAddress) {
  console.log(`🔍 Analyzing contract: ${contractAddress}`);
  
  try {
    const analysis = {
      contractAddress,
      isValid: false,
      isHoneypot: false,
      canBuy: true,
      canSell: true,
      hasLiquidity: false,
      liquidityLocked: false,
      ownershipRenounced: false,
      hasMintFunction: false,
      hasBlacklist: false,
      buyTax: 0,
      sellTax: 0,
      riskLevel: "UNKNOWN",
      riskScore: 0,
      warnings: [],
      recommendations: [],
      teaRankEligible: false
    };
    
    // Validate address
    if (!web3.utils.isAddress(contractAddress)) {
      analysis.warnings.push("Invalid contract address");
      return analysis;
    }
    
    analysis.isValid = true;
    
    // Get contract code
    const code = await web3.eth.getCode(contractAddress);
    if (code === "0x" || code === "0x0") {
      analysis.warnings.push("No contract code found - not a valid token");
      return analysis;
    }
    
    // Honeypot check
    const honeypotResult = await detailedHoneypotCheck(contractAddress);
    Object.assign(analysis, honeypotResult);
    
    // Contract analysis
    const contractAnalysis = await analyzeContractCode(contractAddress, code);
    Object.assign(analysis, contractAnalysis);
    
    // Liquidity analysis
    const liquidityAnalysis = await analyzeLiquidity(contractAddress);
    Object.assign(analysis, liquidityAnalysis);
    
    // TEA Protocol specific checks
    const teaAnalysis = await checkTeaRankEligibility(contractAddress);
    analysis.teaRankEligible = teaAnalysis.eligible;
    if (teaAnalysis.reasons) {
      analysis.recommendations.push(...teaAnalysis.reasons);
    }
    
    // Calculate final risk score
    analysis.riskScore = calculateRiskScore(analysis);
    analysis.riskLevel = getRiskLevel(analysis.riskScore);
    
    // Generate recommendations
    if (analysis.warnings.length === 0) {
      analysis.recommendations.push("No major red flags detected");
    }
    
    if (analysis.liquidityLocked) {
      analysis.recommendations.push("Liquidity is locked - positive sign");
    }
    
    if (analysis.teaRankEligible) {
      analysis.recommendations.push("Potentially eligible for teaRank rewards");
    }
    
    console.log(`✅ Analysis complete. Risk: ${analysis.riskLevel}`);
    return analysis;
    
  } catch (error) {
    console.error("❌ Analysis error:", error.message);
    return {
      contractAddress,
      isValid: false,
      error: error.message,
      riskLevel: "UNKNOWN",
      warnings: ["Failed to analyze contract"]
    };
  }
}

/**
 * Quick honeypot check for filtering
 */
async function quickHoneypotCheck(contractAddress) {
  try {
    // Simple pattern-based check
    const code = await web3.eth.getCode(contractAddress);
    
    const suspiciousPatterns = [
      'selfdestruct',
      'delegatecall',
      'suicide'
    ];
    
    const codeString = code.toLowerCase();
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
      codeString.includes(pattern)
    );
    
    return {
      isHoneypot: hasSuspiciousPattern,
      canBuy: !hasSuspiciousPattern,
      canSell: !hasSuspiciousPattern
    };
    
  } catch (error) {
    return {
      isHoneypot: false,
      canBuy: true,
      canSell: true
    };
  }
}

/**
 * Detailed honeypot check
 */
async function detailedHoneypotCheck(contractAddress) {
  try {
    // Try honeypot.is API
    const response = await axios.get(
      `https://api.honeypot.is/v2/IsHoneypot`,
      {
        params: {
          address: contractAddress,
          chainID: 10 // Optimism
        },
        timeout: 10000
      }
    );
    
    if (response.data) {
      return {
        isHoneypot: response.data.isHoneypot || false,
        canBuy: !response.data.isHoneypot,
        canSell: !response.data.isHoneypot,
        buyTax: response.data.buyTax || 0,
        sellTax: response.data.sellTax || 0
      };
    }
  } catch (error) {
    console.log("⚠️ Honeypot API unavailable, using local check");
  }
  
  // Fallback to local check
  return quickHoneypotCheck(contractAddress);
}

/**
 * Analyze contract bytecode
 */
async function analyzeContractCode(contractAddress, code) {
  const codeString = code.toLowerCase();
  
  const analysis = {
    hasMintFunction: false,
    hasBlacklist: false,
    hasOwner: false,
    ownershipRenounced: false,
    warnings: []
  };
  
  // Check for mint function
  if (codeString.includes('mint(') || codeString.includes('_mint')) {
    analysis.hasMintFunction = true;
    analysis.warnings.push("Contract has mint function - supply can increase");
  }
  
  // Check for blacklist
  if (codeString.includes('blacklist') || codeString.includes('blocked')) {
    analysis.hasBlacklist = true;
    analysis.warnings.push("Contract may have blacklist functionality");
  }
  
  // Check for owner
  if (codeString.includes('owner') || codeString.includes('onlyowner')) {
    analysis.hasOwner = true;
  }
  
  // Try to check if ownership is renounced
  try {
    const contract = new web3.eth.Contract(
      [{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"}],
      contractAddress
    );
    
    const owner = await contract.methods.owner().call();
    analysis.ownershipRenounced = owner === "0x0000000000000000000000000000000000000000";
    
    if (analysis.ownershipRenounced) {
      analysis.warnings = analysis.warnings.filter(w => !w.includes("mint function"));
    }
  } catch (error) {
    // Owner function not found or error
  }
  
  return analysis;
}

/**
 * Analyze liquidity
 */
async function analyzeLiquidity(contractAddress) {
  try {
    // Fetch from DexScreener
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
      { timeout: 10000 }
    );
    
    if (response.data && response.data.pairs && response.data.pairs.length > 0) {
      const pair = response.data.pairs[0];
      
      return {
        hasLiquidity: pair.liquidity?.usd > 0,
        liquidityUsd: pair.liquidity?.usd || 0,
        liquidityLocked: false, // Would need specific API to check this
        pairAddress: pair.pairAddress
      };
    }
  } catch (error) {
    console.log("⚠️ Liquidity check failed");
  }
  
  return {
    hasLiquidity: false,
    liquidityUsd: 0,
    liquidityLocked: false
  };
}

/**
 * Check TEA Protocol teaRank eligibility
 */
async function checkTeaRankEligibility(contractAddress) {
  // TEA Protocol requires projects to:
  // 1. Be open-source
  // 2. Have a constitution file in repo
  // 3. Have dependencies tracked
  // 4. Be registered on TEA
  
  // This is a simplified check - would need TEA API integration
  const analysis = {
    eligible: false,
    reasons: []
  };
  
  try {
    // Check if contract is verified (open-source indicator)
    const response = await axios.get(
      `https://api-optimistic.etherscan.io/api`,
      {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: contractAddress,
          apikey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
        },
        timeout: 10000
      }
    );
    
    if (response.data?.result?.[0]?.SourceCode) {
      analysis.reasons.push("Contract is verified - potentially eligible for teaRank");
      analysis.eligible = true;
    } else {
      analysis.reasons.push("Contract not verified - unlikely to be teaRank eligible");
    }
    
  } catch (error) {
    analysis.reasons.push("Could not verify teaRank eligibility");
  }
  
  return analysis;
}

/**
 * Check for suspicious patterns in token data
 */
function checkSuspiciousPatterns(token) {
  const suspicious = [];
  
  // Check symbol
  if (token.symbol && /[^a-zA-Z0-9]/.test(token.symbol)) {
    suspicious.push("Symbol contains special characters");
  }
  
  // Check for very high tax
  if (token.buyTax > 20 || token.sellTax > 20) {
    suspicious.push("Very high trading tax");
  }
  
  // Check liquidity to market cap ratio (if available)
  if (token.marketCap && token.liquidity?.usd) {
    const ratio = token.liquidity.usd / token.marketCap;
    if (ratio < 0.01) {
      suspicious.push("Very low liquidity vs market cap");
    }
  }
  
  // Check volume (should have some trading activity)
  if (token.volume?.h24 === 0 && token.txns?.h24?.buys === 0) {
    suspicious.push("No trading activity");
  }
  
  return suspicious.length > 3; // More than 3 red flags = suspicious
}

/**
 * Calculate safety score (0-100)
 */
function calculateSafetyScore(token, honeypotResult) {
  let score = 100;
  
  // Honeypot check
  if (honeypotResult.isHoneypot) score -= 50;
  if (!honeypotResult.canSell) score -= 30;
  
  // Liquidity
  if (token.liquidity?.usd < 500) score -= 20;
  if (token.liquidity?.usd < 1000) score -= 10;
  
  // Volume
  if (token.volume?.h24 < 100) score -= 15;
  if (token.volume?.h24 < 1000) score -= 10;
  
  // Trading activity
  const totalTxns = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);
  if (totalTxns < 10) score -= 15;
  
  // Tax
  if (honeypotResult.buyTax > 10) score -= 10;
  if (honeypotResult.sellTax > 10) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate risk score (0-10, lower is safer)
 */
function calculateRiskScore(analysis) {
  let score = 0;
  
  if (analysis.isHoneypot) score += 10;
  if (!analysis.canSell) score += 8;
  if (analysis.hasMintFunction && !analysis.ownershipRenounced) score += 3;
  if (analysis.hasBlacklist) score += 3;
  if (!analysis.liquidityLocked) score += 2;
  if (analysis.buyTax > 10) score += 2;
  if (analysis.sellTax > 10) score += 2;
  if (!analysis.hasLiquidity) score += 4;
  
  // Positive factors
  if (analysis.ownershipRenounced) score -= 2;
  if (analysis.liquidityLocked) score -= 2;
  if (analysis.teaRankEligible) score -= 1;
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Get risk level from risk score
 */
function getRiskLevel(score) {
  if (score <= 3) return "SAFE";
  if (score <= 6) return "CAUTION";
  return "RISKY";
}