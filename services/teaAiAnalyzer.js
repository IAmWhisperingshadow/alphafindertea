import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Analyze tokens using AI
 * Provides investment recommendations and risk assessment
 */
export async function analyzeTeaTokens(tokens) {
  console.log(`🤖 AI analyzing ${tokens.length} tokens...`);
  
  const analyzedTokens = [];
  
  for (const token of tokens) {
    try {
      // Calculate degen score
      const degenScore = calculateDegenScore(token);
      
      // Get AI recommendation if Groq API is available
      let aiRecommendation = null;
      if (GROQ_API_KEY) {
        aiRecommendation = await getAiRecommendation(token);
      }
      
      token.degenScore = degenScore;
      token.aiRecommendation = aiRecommendation;
      token.investmentPotential = getInvestmentPotential(degenScore);
      
      analyzedTokens.push(token);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${token.symbol}:`, error.message);
      // Still include the token even if AI fails
      token.degenScore = calculateDegenScore(token);
      token.investmentPotential = getInvestmentPotential(token.degenScore);
      analyzedTokens.push(token);
    }
  }
  
  // Sort by degen score (highest first)
  analyzedTokens.sort((a, b) => b.degenScore - a.degenScore);
  
  console.log(`✅ AI analysis complete`);
  return analyzedTokens;
}

/**
 * Calculate degen score (1-10)
 * Higher score = better investment potential
 */
function calculateDegenScore(token) {
  let score = 5; // Start at neutral
  
  // Age factor (newer = higher score for fresh discoveries)
  const age = getTokenAgeHours(token);
  if (age < 1) score += 3;        // Less than 1 hour old
  else if (age < 6) score += 2;   // Less than 6 hours old
  else if (age < 12) score += 1;  // Less than 12 hours old
  
  // Liquidity factor
  const liquidityUsd = token.liquidity?.usd || 0;
  if (liquidityUsd > 10000) score += 1.5;
  else if (liquidityUsd > 5000) score += 1;
  else if (liquidityUsd > 1000) score += 0.5;
  else if (liquidityUsd < 500) score -= 1;
  
  // Volume factor
  const volume24h = token.volume?.h24 || 0;
  if (volume24h > 50000) score += 1.5;
  else if (volume24h > 10000) score += 1;
  else if (volume24h > 1000) score += 0.5;
  else if (volume24h < 100) score -= 1;
  
  // Price change factor
  const priceChange24h = token.priceChange?.h24 || 0;
  if (priceChange24h > 50) score += 1;
  else if (priceChange24h > 20) score += 0.5;
  else if (priceChange24h < -20) score -= 0.5;
  else if (priceChange24h < -50) score -= 1;
  
  // Transaction activity factor
  const txns24h = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);
  if (txns24h > 100) score += 1;
  else if (txns24h > 50) score += 0.5;
  else if (txns24h < 10) score -= 1;
  
  // Buy/Sell ratio (more buys = positive)
  const buys = token.txns?.h24?.buys || 0;
  const sells = token.txns?.h24?.sells || 0;
  if (buys > sells * 1.5) score += 1;
  else if (buys < sells * 0.5) score -= 1;
  
  // Safety score factor
  if (token.safetyScore) {
    if (token.safetyScore > 80) score += 1;
    else if (token.safetyScore > 60) score += 0.5;
    else if (token.safetyScore < 40) score -= 1;
    else if (token.safetyScore < 20) score -= 2;
  }
  
  // Volume to Liquidity ratio (healthy trading activity)
  if (liquidityUsd > 0) {
    const volumeToLiquidityRatio = volume24h / liquidityUsd;
    if (volumeToLiquidityRatio > 1) score += 0.5;  // High trading activity
    else if (volumeToLiquidityRatio > 0.5) score += 0.25;
  }
  
  // Market cap factor (if available)
  if (token.marketCap) {
    if (token.marketCap < 100000) score += 0.5; // Low cap = higher potential
    else if (token.marketCap > 10000000) score -= 0.5; // Already established
  }
  
  // Normalize to 1-10 scale
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

/**
 * Get AI recommendation using Groq
 */
async function getAiRecommendation(token) {
  if (!GROQ_API_KEY) {
    return null;
  }
  
  try {
    const prompt = `Analyze this TEA Protocol token and provide a brief investment recommendation (max 2 sentences):

Token: ${token.symbol} (${token.name})
Chain: Optimism (TEA Protocol)
Age: ${getTokenAgeHours(token)} hours
Price: $${token.priceUsd || 0}
Liquidity: $${token.liquidity?.usd || 0}
Volume 24h: $${token.volume?.h24 || 0}
Price Change 24h: ${token.priceChange?.h24 || 0}%
Transactions 24h: ${(token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0)}
Safety Score: ${token.safetyScore || 'N/A'}

Provide a concise recommendation focusing on risk/reward.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a cryptocurrency investment analyst specializing in TEA Protocol tokens. Provide brief, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    
    return response.data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error("❌ AI recommendation error:", error.message);
    return null;
  }
}

/**
 * Get token age in hours
 */
function getTokenAgeHours(token) {
  if (!token.pairCreatedAt) return 999;
  
  const createdAt = new Date(token.pairCreatedAt).getTime();
  const now = Date.now();
  const ageHours = (now - createdAt) / (1000 * 60 * 60);
  
  return ageHours;
}

/**
 * Get investment potential label from degen score
 */
function getInvestmentPotential(score) {
  if (score >= 8) return "🔥 VERY HIGH";
  if (score >= 6.5) return "🚀 HIGH";
  if (score >= 5) return "⚡ MODERATE";
  if (score >= 3) return "⚠️ LOW";
  return "🛑 VERY LOW";
}

/**
 * Analyze single token for deep analysis
 */
export async function analyzeSingleToken(token) {
  console.log(`🤖 Deep analyzing ${token.symbol}...`);
  
  const degenScore = calculateDegenScore(token);
  const investmentPotential = getInvestmentPotential(degenScore);
  
  let aiInsights = null;
  if (GROQ_API_KEY) {
    aiInsights = await getDetailedAiAnalysis(token);
  }
  
  return {
    degenScore,
    investmentPotential,
    aiInsights,
    metrics: {
      ageHours: getTokenAgeHours(token),
      volumeToLiquidity: token.liquidity?.usd > 0 
        ? (token.volume?.h24 || 0) / token.liquidity.usd 
        : 0,
      buyPressure: calculateBuyPressure(token),
      momentum: calculateMomentum(token)
    }
  };
}

/**
 * Get detailed AI analysis
 */
async function getDetailedAiAnalysis(token) {
  if (!GROQ_API_KEY) {
    return null;
  }
  
  try {
    const prompt = `Provide a detailed analysis of this TEA Protocol token:

Token: ${token.symbol} (${token.name})
Contract: ${token.contractAddress}
Chain: Optimism (TEA Protocol)
Age: ${getTokenAgeHours(token)} hours
Current Price: $${token.priceUsd || 0}
Liquidity: $${token.liquidity?.usd || 0}
Volume 24h: $${token.volume?.h24 || 0}
Market Cap: $${token.marketCap || 'N/A'}
Price Change 24h: ${token.priceChange?.h24 || 0}%
Buy/Sell Ratio: ${token.txns?.h24?.buys || 0}/${token.txns?.h24?.sells || 0}
Safety Score: ${token.safetyScore || 'N/A'}

Analyze:
1. Risk factors (2-3 points)
2. Opportunity factors (2-3 points)
3. Final recommendation (1 sentence)

Be concise and actionable.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert cryptocurrency analyst for TEA Protocol. Provide structured, concise analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );
    
    return response.data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error("❌ Detailed AI analysis error:", error.message);
    return null;
  }
}

/**
 * Calculate buy pressure (0-100)
 */
function calculateBuyPressure(token) {
  const buys = token.txns?.h24?.buys || 0;
  const sells = token.txns?.h24?.sells || 0;
  const total = buys + sells;
  
  if (total === 0) return 50;
  
  return Math.round((buys / total) * 100);
}

/**
 * Calculate momentum score (0-100)
 */
function calculateMomentum(token) {
  let momentum = 50;
  
  // Price change momentum
  const priceChange = token.priceChange?.h24 || 0;
  momentum += priceChange * 0.5; // Price change affects momentum
  
  // Volume momentum
  const volume24h = token.volume?.h24 || 0;
  if (volume24h > 10000) momentum += 10;
  else if (volume24h > 1000) momentum += 5;
  
  // Transaction momentum
  const txns = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);
  if (txns > 100) momentum += 10;
  else if (txns > 50) momentum += 5;
  
  // Buy pressure momentum
  const buyPressure = calculateBuyPressure(token);
  if (buyPressure > 60) momentum += 10;
  else if (buyPressure < 40) momentum -= 10;
  
  return Math.max(0, Math.min(100, Math.round(momentum)));
}