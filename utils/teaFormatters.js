/**
 * Format token message for Telegram
 */
export function formatTeaTokenMessage(token, index) {
  const age = getTokenAge(token);
  const riskEmoji = getRiskEmoji(token);
  const potentialEmoji = token.investmentPotential || "⚡ MODERATE";
  
  let message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${riskEmoji} *Token #${index + 1}* ${riskEmoji}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🫖 *${token.symbol}* | ${token.name || 'N/A'}
🔗 \`${token.contractAddress}\`

⏰ *Age:* ${age}
🌐 *Chain:* TEA Protocol (Optimism)
💱 *DEX:* ${token.dexId || 'Velodrome'}

💰 *Price:* $${formatNumber(token.priceUsd || 0)}
📊 *Market Cap:* $${formatNumber(token.marketCap || 0)}
💧 *Liquidity:* $${formatNumber(token.liquidity?.usd || 0)}

📈 *Volume 24h:* $${formatNumber(token.volume?.h24 || 0)}
📉 *Price Change 24h:* ${formatPriceChange(token.priceChange?.h24 || 0)}

🔄 *Transactions 24h:*
   • Buys: ${token.txns?.h24?.buys || 0}
   • Sells: ${token.txns?.h24?.sells || 0}
   • Total: ${(token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0)}

🎯 *Degen Score:* ${token.degenScore || 'N/A'}/10
🚀 *Potential:* ${potentialEmoji}
🛡️ *Safety:* ${token.safetyScore || 'N/A'}/100
`;

  // Add AI recommendation if available
  if (token.aiRecommendation) {
    message += `\n🤖 *AI Analysis:*\n_${token.aiRecommendation}_\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return message;
}

/**
 * Format deep analysis message
 */
export function formatTeaAnalyzeMessage(analysis) {
  const riskColor = getRiskColor(analysis.riskLevel);
  
  let message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *DEEP CONTRACT ANALYSIS* 🔍
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 *Contract:* \`${analysis.contractAddress}\`
🌐 *Chain:* TEA Protocol (Optimism)

${riskColor} *Risk Level:* ${analysis.riskLevel}
📊 *Risk Score:* ${analysis.riskScore}/10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *SECURITY ANALYSIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.isHoneypot ? '🚨' : '✅'} *Honeypot:* ${analysis.isHoneypot ? 'YES - AVOID!' : 'No'}
${analysis.canBuy ? '✅' : '❌'} *Can Buy:* ${analysis.canBuy ? 'Yes' : 'No'}
${analysis.canSell ? '✅' : '❌'} *Can Sell:* ${analysis.canSell ? 'Yes' : 'No'}

💵 *Buy Tax:* ${analysis.buyTax}%
💵 *Sell Tax:* ${analysis.sellTax}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *CONTRACT FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.hasMintFunction ? '⚠️' : '✅'} *Mint Function:* ${analysis.hasMintFunction ? 'Yes' : 'No'}
${analysis.hasBlacklist ? '⚠️' : '✅'} *Blacklist:* ${analysis.hasBlacklist ? 'Yes' : 'No'}
${analysis.ownershipRenounced ? '✅' : '⚠️'} *Ownership:* ${analysis.ownershipRenounced ? 'Renounced' : 'Active'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💧 *LIQUIDITY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.hasLiquidity ? '✅' : '❌'} *Has Liquidity:* ${analysis.hasLiquidity ? 'Yes' : 'No'}
${analysis.liquidityLocked ? '✅' : '⚠️'} *Liquidity Locked:* ${analysis.liquidityLocked ? 'Yes' : 'Unknown'}
${analysis.liquidityUsd ? `💰 *Amount:* $${formatNumber(analysis.liquidityUsd)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🫖 *TEA PROTOCOL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.teaRankEligible ? '✅' : '❌'} *teaRank Eligible:* ${analysis.teaRankEligible ? 'Potentially Yes' : 'No'}
`;

  // Add warnings
  if (analysis.warnings && analysis.warnings.length > 0) {
    message += `\n⚠️ *WARNINGS:*\n`;
    analysis.warnings.forEach(warning => {
      message += `   • ${warning}\n`;
    });
  }

  // Add recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    message += `\n💡 *RECOMMENDATIONS:*\n`;
    analysis.recommendations.forEach(rec => {
      message += `   • ${rec}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  return message;
}

/**
 * Get token age string
 */
function getTokenAge(token) {
  if (!token.pairCreatedAt) return 'Unknown';
  
  const createdAt = new Date(token.pairCreatedAt).getTime();
  const now = Date.now();
  const diffMs = now - createdAt;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
}

/**
 * Get risk emoji based on token data
 */
function getRiskEmoji(token) {
  const safetyScore = token.safetyScore || 50;
  
  if (safetyScore >= 80) return '🟢';
  if (safetyScore >= 60) return '🟡';
  if (safetyScore >= 40) return '🟠';
  return '🔴';
}

/**
 * Get risk color emoji
 */
function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'SAFE':
      return '🟢';
    case 'CAUTION':
      return '🟡';
    case 'RISKY':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Format number with commas and decimals
 */
function formatNumber(num) {
  if (num === 0 || num === null || num === undefined) return '0';
  
  if (num < 0.01) {
    return num.toExponential(2);
  }
  
  if (num < 1) {
    return num.toFixed(4);
  }
  
  if (num < 1000) {
    return num.toFixed(2);
  }
  
  if (num < 1000000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  
  if (num < 1000000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  
  return (num / 1000000000).toFixed(2) + 'B';
}

/**
 * Format price change with color
 */
function formatPriceChange(change) {
  if (change === 0 || change === null || change === undefined) {
    return '0%';
  }
  
  const emoji = change > 0 ? '📈' : '📉';
  const sign = change > 0 ? '+' : '';
  return `${emoji} ${sign}${change.toFixed(2)}%`;
}