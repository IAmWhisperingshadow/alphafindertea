import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { fetchFreshTeaTokens } from "./services/teaTokenFetcher.js";
import { filterSafeTokens, analyzeTeaContract } from "./services/teaScamChecker.js";
import { analyzeTeaTokens } from "./services/teaAiAnalyzer.js";
import { formatTeaTokenMessage, formatTeaAnalyzeMessage } from "./utils/teaFormatters.js";
import { addToWatchlist, getWatchlistStats } from "./services/watchlistService.js";

dotenv.config();

const instanceId = Math.random().toString(36).substring(7);
console.log(`🫖 Alpha Finders Bot instance ID: ${instanceId}`);

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Per-user state management
const userStates = new Map();

function initializeUserState(userId) {
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      isProcessing: false,
      currentOperation: null,
      currentTokens: []
    });
  }
  return userStates.get(userId);
}

function getUserState(userId) {
  return userStates.get(userId) || initializeUserState(userId);
}

// Create main menu keyboard
function createMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🫖 Fresh TEA Tokens', callback_data: 'fresh_tea_tokens' },
        { text: '🔍 Analyze Token', callback_data: 'analyze_prompt' }
      ],
      [
        { text: '📈 TEA Market Overview', callback_data: 'tea_overview' },
        { text: '⭐ My Watchlist', callback_data: 'view_watchlist' }
      ],
      [
        { text: '⚙️ Settings', callback_data: 'settings' },
        { text: '❓ Help', callback_data: 'help' }
      ],
      [
        { text: '🛑 Stop Operations', callback_data: 'stop_operation' }
      ]
    ]
  };
}

// Create token action keyboard for TEA tokens
function createTeaTokenActionKeyboard(token) {
  const contractAddress = token.contractAddress || token;
  
  // TEA Protocol specific URLs
  const velodromeUrl = `https://velodrome.finance/swap?from=eth&to=${contractAddress}`;
  const dexscreenerUrl = `https://dexscreener.com/optimism/${contractAddress}`;
  const explorerUrl = `https://optimistic.etherscan.io/address/${contractAddress}`;
  
  return {
    inline_keyboard: [
      [
        { text: '🔄 Trade on Velodrome', url: velodromeUrl },
        { text: '📈 DexScreener', url: dexscreenerUrl }
      ],
      [
        { text: '🔍 Explorer', url: explorerUrl },
        { text: '⭐ Add to Watchlist', callback_data: `watchlist_${contractAddress}` }
      ],
      [
        { text: '🛡️ Deep Analysis', callback_data: `deep_analyze_${contractAddress}` }
      ]
    ]
  };
}

// ================== Start Command ==================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Trader';
  
  initializeUserState(userId);
  
  const welcomeMessage = `
🫖 *Welcome to Alpha Finders* 🫖

Hello ${userName}! 👋

I'm your TEA Protocol token discovery bot - finding alpha on TEA's network!

🚀 *Fresh Token Discovery*
- Real-time new token detection on TEA Protocol
- Built on Optimism Superchain
- Velodrome DEX integration
- Advanced scam filtering
- AI-powered risk assessment

🛡️ *Security Analysis*
- Smart contract verification
- Honeypot detection
- Liquidity analysis
- Trading activity verification
- teaRank eligibility check

📊 *TEA Protocol Intelligence*
- Live market data from DexScreener
- Velodrome liquidity tracking
- Real-time blockchain monitoring
- Project registration status

⭐ *Personal Features*
- Token watchlist management
- Deep analysis reports
- Real-time price tracking
- Professional risk scoring

Choose an option below to start finding alpha on TEA Protocol:`;

  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: createMainMenuKeyboard()
  });
});

// ================== Stop Command ==================
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userState = getUserState(userId);
  
  if (userState.isProcessing) {
    userState.isProcessing = false;
    userState.currentOperation = null;
    
    const message = `🛑 *Operation Stopped*\n\nYour current operation has been cancelled.`;
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: createMainMenuKeyboard()
    });
  } else {
    await bot.sendMessage(chatId, "ℹ️ No operations are currently running.", {
      reply_markup: createMainMenuKeyboard()
    });
  }
});

// ================== Fresh TEA Tokens Handler ==================
async function handleFreshTeaTokens(chatId, userId) {
  const userState = getUserState(userId);
  
  if (userState.isProcessing) {
    return bot.sendMessage(chatId, "⚠️ You have another operation in progress. Use /stop to cancel it first.", {
      reply_markup: createMainMenuKeyboard()
    });
  }

  userState.isProcessing = true;
  userState.currentOperation = "fetching_tea_tokens";

  const statusMessage = await bot.sendMessage(chatId, `
🔄 *Fetching Fresh TEA Protocol Tokens...*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Step 1: Scanning TEA blockchain...
⏳ Step 2: Fetching from Velodrome & DexScreener...
⏳ Step 3: Running security analysis...
⏳ Step 4: AI risk assessment...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This may take 30-60 seconds...`, { 
    parse_mode: 'Markdown' 
  });

  try {
    // Step 1: Fetch TEA tokens
    if (!userState.isProcessing) return;
    await bot.editMessageText("🔄 *Fetching Fresh TEA Protocol Tokens...*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Step 1: TEA blockchain scanned\n⏳ Step 2: Fetching from Velodrome & DexScreener...\n⏳ Step 3: Running security analysis...\n⏳ Step 4: AI risk assessment...\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown'
    });

    let tokens = await fetchFreshTeaTokens();
    if (!userState.isProcessing) return;

    // Step 2: Security analysis
    await bot.editMessageText("🔄 *Fetching Fresh TEA Protocol Tokens...*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Step 1: TEA blockchain scanned\n✅ Step 2: Data fetched successfully\n⏳ Step 3: Running security analysis...\n⏳ Step 4: AI risk assessment...\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown'
    });

    tokens = await filterSafeTokens(tokens);
    if (!userState.isProcessing) return;

    // Step 3: AI Analysis
    await bot.editMessageText("🔄 *Fetching Fresh TEA Protocol Tokens...*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Step 1: TEA blockchain scanned\n✅ Step 2: Data fetched successfully\n✅ Step 3: Security analysis complete\n⏳ Step 4: AI risk assessment...\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown'
    });

    tokens = await analyzeTeaTokens(tokens);
    if (!userState.isProcessing) return;

    await bot.deleteMessage(chatId, statusMessage.message_id);

    if (tokens.length === 0) {
      userState.isProcessing = false;
      userState.currentOperation = null;
      return bot.sendMessage(chatId, "❌ No safe tokens found on TEA Protocol in the last 24h.", {
        reply_markup: createMainMenuKeyboard()
      });
    }

    await bot.sendMessage(chatId, `
🎉 *Fresh TEA Token Analysis Complete!*

Found ${tokens.length} promising tokens on TEA Protocol:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, { 
      parse_mode: 'Markdown' 
    });

    userState.currentTokens = tokens;
    
    for (let i = 0; i < tokens.length && userState.isProcessing; i++) {
      try {
        const tokenMessage = formatTeaTokenMessage(tokens[i], i);
        const keyboard = createTeaTokenActionKeyboard(tokens[i]);
        
        await bot.sendMessage(chatId, tokenMessage, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          reply_markup: keyboard
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (formatError) {
        console.error("Format error:", formatError.message);
      }
    }

    if (userState.isProcessing) {
      await bot.sendMessage(chatId, "✅ *Analysis Complete!*\n\nUse the buttons above to interact with tokens.", {
        parse_mode: 'Markdown',
        reply_markup: createMainMenuKeyboard()
      });
    }

  } catch (err) {
    console.error(err);
    await bot.deleteMessage(chatId, statusMessage.message_id).catch(() => {});
    bot.sendMessage(chatId, "⚠️ Error fetching tokens. Try again later.", {
      reply_markup: createMainMenuKeyboard()
    });
  } finally {
    userState.isProcessing = false;
    userState.currentOperation = null;
  }
}

// ================== Analyze Handler ==================
async function handleAnalyze(chatId, contractAddress, userId) {
  if (!contractAddress) {
    return bot.sendMessage(chatId, "❌ Please provide a valid contract address.", {
      reply_markup: createMainMenuKeyboard()
    });
  }

  const userState = getUserState(userId);
  if (userState.isProcessing) {
    return bot.sendMessage(chatId, "⚠️ You have another operation in progress. Use /stop to cancel it first.", {
      reply_markup: createMainMenuKeyboard()
    });
  }

  userState.isProcessing = true;
  userState.currentOperation = "analyzing_tea_contract";

  const statusMessage = await bot.sendMessage(chatId, `
🔍 *Analyzing TEA Protocol Contract...*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Contract: \`${contractAddress}\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Checking honeypot status...
⏳ Analyzing contract code...
⏳ Verifying teaRank eligibility...
⏳ Calculating risk score...

This may take 15-30 seconds...`, { 
    parse_mode: 'Markdown' 
  });

  try {
    const result = await analyzeTeaContract(contractAddress);
    
    if (!userState.isProcessing) return;

    await bot.deleteMessage(chatId, statusMessage.message_id);

    const analysisMessage = formatTeaAnalyzeMessage(result);
    const keyboard = createTeaTokenActionKeyboard({ contractAddress });

    await bot.sendMessage(chatId, analysisMessage, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: keyboard
    });

  } catch (err) {
    console.error(err);
    await bot.deleteMessage(chatId, statusMessage.message_id).catch(() => {});
    bot.sendMessage(chatId, "⚠️ Failed to analyze contract. Make sure the address is correct.", {
      reply_markup: createMainMenuKeyboard()
    });
  } finally {
    userState.isProcessing = false;
    userState.currentOperation = null;
  }
}

// ================== Callback Query Handler ==================
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;

  try {
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.log(`⚠️ Failed to answer callback query: ${error.message}`);
    if (error.message.includes('query is too old')) {
      try {
        await bot.sendMessage(chatId, "⏰ *Button Expired*\n\nThis button has expired. Please use /start to get a fresh menu.", {
          parse_mode: 'Markdown',
          reply_markup: createMainMenuKeyboard()
        });
      } catch (sendError) {}
    }
    return;
  }

  try {
    switch (data) {
      case 'fresh_tea_tokens':
        initializeUserState(userId);
        await handleFreshTeaTokens(chatId, userId);
        break;
        
      case 'analyze_prompt':
        await bot.sendMessage(chatId, "🔍 *Token Analysis*\n\nPlease send me a TEA Protocol contract address to analyze:\n\nExample: `0x1234...5678`", {
          parse_mode: 'Markdown',
          reply_markup: createMainMenuKeyboard()
        });
        break;
        
      case 'view_watchlist':
        const watchlistUserId = userId.toString();
        const stats = getWatchlistStats(watchlistUserId);
        
        if (stats.count === 0) {
          await bot.sendMessage(chatId, `⭐ *Your Watchlist*\n\n📋 You have no tokens in your watchlist.\n\nUse the "Add to Watchlist" button on any token to start tracking!`, {
            parse_mode: 'Markdown',
            reply_markup: createMainMenuKeyboard()
          });
        } else {
          let message = `⭐ *Your TEA Watchlist* (${stats.count} tokens)\n\n`;
          
          stats.tokens.forEach((token, index) => {
            message += `${index + 1}. ${token.symbol}\n   \`${token.contractAddress}\`\n\n`;
          });
          
          message += `💡 Send any contract address for detailed analysis.`;
          
          await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: createMainMenuKeyboard()
          });
        }
        break;
        
      case 'tea_overview':
        await bot.sendMessage(chatId, `📊 *TEA Protocol Market Overview*

🫖 *About TEA Protocol:*
- Layer 2 blockchain built on Optimism Superchain
- Focus on open-source developer rewards
- Proof of Contribution algorithm
- teaRank-based reward distribution

🔄 *Primary DEX:*
- Velodrome Finance (Leading Optimism DEX)
- Deep liquidity pools
- Optimized for TEA ecosystem

🔍 *Alpha Finders Coverage:*
- Real-time token discovery on TEA
- Advanced scam filtering
- AI-powered risk assessment
- Trading activity verification
- teaRank eligibility tracking

📈 *Data Sources:*
- TEA Protocol blockchain events
- Velodrome DEX data
- DexScreener market data
- AI risk scoring

💡 *Tip:* Use "🫖 Fresh TEA Tokens" to discover new opportunities on TEA Protocol!`, {
          parse_mode: 'Markdown',
          reply_markup: createMainMenuKeyboard()
        });
        break;
        
      case 'settings':
        await bot.sendMessage(chatId, `⚙️ *Alpha Finders Settings*

🔧 *Current Configuration:*
- Network: TEA Protocol (Optimism Superchain)
- Primary DEX: Velodrome Finance
- Scam filtering: Advanced analysis
- AI analysis: Risk assessment enabled
- Data sources: Blockchain + DexScreener

🛡️ *Security Features:*
- Honeypot detection
- Contract verification
- Liquidity analysis
- Trading activity verification
- teaRank eligibility check

📊 *Filtering Options:*
- Age limit: Last 24 hours
- Liquidity: Minimum $100
- Token limit: Up to 50 tokens per request

💡 *Tip:* The bot is optimized for TEA Protocol alpha discovery!`, {
          parse_mode: 'Markdown',
          reply_markup: createMainMenuKeyboard()
        });
        break;
        
      case 'stop_operation':
        const stopUserState = getUserState(userId);
        
        if (stopUserState.isProcessing) {
          stopUserState.isProcessing = false;
          stopUserState.currentOperation = null;
          const message = `🛑 *Operation Stopped*\n\nYour current operation has been cancelled.`;
          await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: createMainMenuKeyboard()
          });
        } else {
          await bot.sendMessage(chatId, "ℹ️ No operations running.", {
            reply_markup: createMainMenuKeyboard()
          });
        }
        break;
        
      case 'help':
        const helpMessage = `
🆘 *Alpha Finders Help*

*Main Features:*
- Fresh TEA token discovery (last 24h)
- Deep contract analysis
- Personal watchlist tracking
- AI-powered risk assessment

*How to Use:*
1. Click "🫖 Fresh TEA Tokens" to discover new tokens
2. Use "🛡️ Deep Analysis" for detailed security reports
3. Add tokens to "⭐ My Watchlist" for tracking
4. Check "📊 TEA Market Overview" for insights

*TEA Protocol Specific:*
🫖 Built for TEA Protocol ecosystem
🔄 Velodrome DEX integration
📊 teaRank eligibility tracking
🛡️ Advanced security analysis

*Risk Levels:*
🟢 SAFE - Low risk, good fundamentals
🟡 CAUTION - Medium risk, be careful
🔴 RISKY - High risk, avoid

*Commands:*
- /start - Show main menu
- /stop - Stop current operation
- Send contract address to analyze

Need more help? Visit tea.xyz`;
        
        await bot.sendMessage(chatId, helpMessage, {
          parse_mode: 'Markdown',
          reply_markup: createMainMenuKeyboard()
        });
        break;
        
      default:
        if (data.startsWith('deep_analyze_')) {
          const contractAddr = data.replace('deep_analyze_', '');
          initializeUserState(userId);
          await handleAnalyze(chatId, contractAddr, userId);
        } else if (data.startsWith('watchlist_')) {
          const contractAddr = data.replace('watchlist_', '');
          const userState = getUserState(userId);
          const tokenData = userState.currentTokens?.find(t => t.contractAddress?.toLowerCase() === contractAddr.toLowerCase());
          
          if (tokenData) {
            const result = addToWatchlist(userId.toString(), tokenData);
            await bot.sendMessage(chatId, `⭐ *Watchlist*\n\n${result.success ? '✅' : '⚠️'} ${result.message}`, {
              parse_mode: 'Markdown',
              reply_markup: createMainMenuKeyboard()
            });
          }
        }
        break;
    }
  } catch (error) {
    console.error('Callback error:', error);
    await bot.sendMessage(chatId, "⚠️ An error occurred. Please try again.", {
      reply_markup: createMainMenuKeyboard()
    });
  }
});

// ================== Default message handler ==================
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;
  
  if (!text || text.startsWith("/")) return;
  
  // Check if it's an EVM address (TEA is on Optimism)
  if (text.match(/^0x[a-fA-F0-9]{40}$/)) {
    initializeUserState(userId);
    handleAnalyze(chatId, text, userId);
    return;
  }
  
  bot.sendMessage(chatId, `
👋 *Welcome to Alpha Finders!*

Finding alpha on TEA Protocol 🫖

🚀 Use the buttons below for all features
🛑 Use /stop to halt operations
❓ Use /start for the main menu

Or send me a TEA Protocol contract address!`, {
    parse_mode: "Markdown",
    reply_markup: createMainMenuKeyboard()
  });
});

console.log("🫖 Alpha Finders Bot is running!");
console.log("✅ TEA Protocol integration active");
console.log("✅ Velodrome DEX support enabled");

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});