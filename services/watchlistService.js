// In-memory watchlist storage
// For production, you would want to use a database
const watchlists = new Map(); // userId -> array of tokens

/**
 * Add token to user's watchlist
 */
export function addToWatchlist(userId, token) {
  if (!userId || !token || !token.contractAddress) {
    return {
      success: false,
      message: "Invalid token or user ID"
    };
  }
  
  // Get or create user's watchlist
  if (!watchlists.has(userId)) {
    watchlists.set(userId, []);
  }
  
  const userWatchlist = watchlists.get(userId);
  
  // Check if token already in watchlist
  const exists = userWatchlist.some(
    t => t.contractAddress.toLowerCase() === token.contractAddress.toLowerCase()
  );
  
  if (exists) {
    return {
      success: false,
      message: `${token.symbol} is already in your watchlist!`
    };
  }
  
  // Add token to watchlist
  userWatchlist.push({
    contractAddress: token.contractAddress,
    symbol: token.symbol,
    name: token.name,
    chainId: token.chainId || 'optimism',
    addedAt: Date.now(),
    priceAtAdd: token.priceUsd || 0
  });
  
  console.log(`✅ Added ${token.symbol} to watchlist for user ${userId}`);
  
  return {
    success: true,
    message: `${token.symbol} added to your watchlist!`
  };
}

/**
 * Remove token from user's watchlist
 */
export function removeFromWatchlist(userId, contractAddress) {
  if (!userId || !contractAddress) {
    return {
      success: false,
      message: "Invalid contract address or user ID"
    };
  }
  
  if (!watchlists.has(userId)) {
    return {
      success: false,
      message: "You don't have any tokens in your watchlist"
    };
  }
  
  const userWatchlist = watchlists.get(userId);
  const initialLength = userWatchlist.length;
  
  // Remove token
  const newWatchlist = userWatchlist.filter(
    t => t.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
  );
  
  if (newWatchlist.length === initialLength) {
    return {
      success: false,
      message: "Token not found in your watchlist"
    };
  }
  
  watchlists.set(userId, newWatchlist);
  
  console.log(`✅ Removed token from watchlist for user ${userId}`);
  
  return {
    success: true,
    message: "Token removed from your watchlist"
  };
}

/**
 * Get user's watchlist
 */
export function getWatchlist(userId) {
  if (!userId) {
    return [];
  }
  
  return watchlists.get(userId) || [];
}

/**
 * Check if token is in user's watchlist
 */
export function isInWatchlist(userId, contractAddress) {
  if (!userId || !contractAddress) {
    return false;
  }
  
  const userWatchlist = getWatchlist(userId);
  return userWatchlist.some(
    t => t.contractAddress.toLowerCase() === contractAddress.toLowerCase()
  );
}

/**
 * Get watchlist statistics for user
 */
export function getWatchlistStats(userId) {
  const userWatchlist = getWatchlist(userId);
  
  return {
    count: userWatchlist.length,
    tokens: userWatchlist,
    oldestToken: userWatchlist.length > 0 
      ? userWatchlist.reduce((oldest, current) => 
          current.addedAt < oldest.addedAt ? current : oldest
        )
      : null,
    newestToken: userWatchlist.length > 0
      ? userWatchlist.reduce((newest, current) =>
          current.addedAt > newest.addedAt ? current : newest
        )
      : null
  };
}

/**
 * Clear user's entire watchlist
 */
export function clearWatchlist(userId) {
  if (!userId) {
    return {
      success: false,
      message: "Invalid user ID"
    };
  }
  
  const count = getWatchlist(userId).length;
  watchlists.delete(userId);
  
  console.log(`✅ Cleared watchlist for user ${userId}`);
  
  return {
    success: true,
    message: `Removed ${count} tokens from your watchlist`
  };
}