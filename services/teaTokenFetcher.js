import axios from "axios";

// TEA Protocol is built on Optimism Superchain
const TEA_CHAIN_ID = 10; // Optimism mainnet
const OPTIMISM_RPC = process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io";

/**
 * Fetch fresh tokens from TEA Protocol network (last 24 hours)
 * TEA is on Optimism, so we monitor Optimism chain
 */
export async function fetchFreshTeaTokens() {
  console.log("🫖 Fetching fresh TEA Protocol tokens...");
  
  try {
    const tokens = [];
    
    // Fetch from DexScreener (Optimism network)
    const dexTokens = await fetchFromDexScreener();
    tokens.push(...dexTokens);
    
    // Fetch from Velodrome (TEA's primary DEX)
    const veloTokens = await fetchFromVelodrome();
    tokens.push(...veloTokens);
    
    // Remove duplicates based on contract address
    const uniqueTokens = removeDuplicates(tokens);
    
    // Filter for tokens created in last 24 hours
    const freshTokens = filterByAge(uniqueTokens, 24);
    
    console.log(`✅ Found ${freshTokens.length} fresh TEA Protocol tokens`);
    return freshTokens;
    
  } catch (error) {
    console.error("❌ Error fetching TEA tokens:", error.message);
    return [];
  }
}

/**
 * Fetch tokens from DexScreener API (Optimism chain)
 */
async function fetchFromDexScreener() {
  try {
    console.log("📊 Fetching from DexScreener (Optimism)...");
    
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/optimism`,
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'AlphaFinders/1.0'
        }
      }
    );
    
    if (!response.data || !response.data.pairs) {
      return [];
    }
    
    const tokens = response.data.pairs
      .filter(pair => {
        // Filter for recent tokens with some liquidity
        const pairAge = getPairAge(pair);
        return pairAge <= 24 && pair.liquidity?.usd >= 100;
      })
      .map(pair => ({
        contractAddress: pair.baseToken.address,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        chainId: "optimism",
        network: "optimism",
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
        priceUsd: pair.priceUsd,
        liquidity: {
          usd: pair.liquidity?.usd || 0,
          base: pair.liquidity?.base || 0,
          quote: pair.liquidity?.quote || 0
        },
        volume: {
          h24: pair.volume?.h24 || 0,
          h6: pair.volume?.h6 || 0,
          h1: pair.volume?.h1 || 0
        },
        priceChange: {
          h24: pair.priceChange?.h24 || 0,
          h6: pair.priceChange?.h6 || 0,
          h1: pair.priceChange?.h1 || 0
        },
        txns: {
          h24: pair.txns?.h24 || { buys: 0, sells: 0 },
          h6: pair.txns?.h6 || { buys: 0, sells: 0 },
          h1: pair.txns?.h1 || { buys: 0, sells: 0 }
        },
        marketCap: pair.fdv || 0,
        pairCreatedAt: pair.pairCreatedAt,
        info: pair.info || {},
        url: pair.url,
        source: "dexscreener"
      }));
    
    console.log(`✅ DexScreener: Found ${tokens.length} tokens`);
    return tokens;
    
  } catch (error) {
    console.error("❌ DexScreener fetch error:", error.message);
    return [];
  }
}

/**
 * Fetch tokens from Velodrome DEX
 * Velodrome is the primary DEX on Optimism and TEA's partner
 */
async function fetchFromVelodrome() {
  try {
    console.log("🔄 Fetching from Velodrome DEX...");
    
    // Velodrome API endpoint
    const response = await axios.get(
      "https://api.velodrome.finance/api/v1/pairs",
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'AlphaFinders/1.0'
        }
      }
    );
    
    if (!response.data || !response.data.data) {
      return [];
    }
    
    const currentTime = Date.now() / 1000;
    
    const tokens = response.data.data
      .filter(pair => {
        // Filter for recent pairs (last 24 hours)
        const pairAge = (currentTime - pair.created) / 3600;
        return pairAge <= 24 && parseFloat(pair.tvl) >= 100;
      })
      .map(pair => ({
        contractAddress: pair.token0.address,
        symbol: pair.token0.symbol,
        name: pair.token0.name,
        chainId: "optimism",
        network: "optimism",
        dexId: "velodrome",
        pairAddress: pair.address,
        priceUsd: pair.token0.price || 0,
        liquidity: {
          usd: parseFloat(pair.tvl) || 0,
          base: parseFloat(pair.reserve0) || 0,
          quote: parseFloat(pair.reserve1) || 0
        },
        volume: {
          h24: parseFloat(pair.volumeUSD) || 0,
          h6: 0,
          h1: 0
        },
        priceChange: {
          h24: 0,
          h6: 0,
          h1: 0
        },
        txns: {
          h24: { buys: 0, sells: 0 },
          h6: { buys: 0, sells: 0 },
          h1: { buys: 0, sells: 0 }
        },
        marketCap: 0,
        pairCreatedAt: pair.created,
        info: pair,
        url: `https://velodrome.finance/liquidity/${pair.address}`,
        source: "velodrome"
      }));
    
    console.log(`✅ Velodrome: Found ${tokens.length} tokens`);
    return tokens;
    
  } catch (error) {
    console.error("❌ Velodrome fetch error:", error.message);
    return [];
  }
}

/**
 * Calculate pair age in hours
 */
function getPairAge(pair) {
  if (!pair.pairCreatedAt) return 999;
  
  const createdAt = new Date(pair.pairCreatedAt).getTime();
  const now = Date.now();
  const ageHours = (now - createdAt) / (1000 * 60 * 60);
  
  return ageHours;
}

/**
 * Remove duplicate tokens based on contract address
 */
function removeDuplicates(tokens) {
  const seen = new Set();
  return tokens.filter(token => {
    const address = token.contractAddress.toLowerCase();
    if (seen.has(address)) {
      return false;
    }
    seen.add(address);
    return true;
  });
}

/**
 * Filter tokens by age (in hours)
 */
function filterByAge(tokens, maxAgeHours) {
  return tokens.filter(token => {
    const age = getPairAge(token);
    return age <= maxAgeHours;
  });
}

/**
 * Get token details by address
 */
export async function getTeaTokenDetails(contractAddress) {
  try {
    console.log(`🔍 Fetching details for ${contractAddress}...`);
    
    // Try DexScreener first
    const dexResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
      { timeout: 10000 }
    );
    
    if (dexResponse.data && dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
      const pair = dexResponse.data.pairs[0];
      return {
        contractAddress: pair.baseToken.address,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        chainId: pair.chainId,
        priceUsd: pair.priceUsd,
        liquidity: pair.liquidity,
        volume: pair.volume,
        priceChange: pair.priceChange,
        txns: pair.txns,
        marketCap: pair.fdv,
        pairCreatedAt: pair.pairCreatedAt,
        url: pair.url
      };
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error fetching token details:", error.message);
    return null;
  }
}