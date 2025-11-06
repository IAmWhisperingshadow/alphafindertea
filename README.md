# 🫖 Alpha Finders - Complete Documentation

## Project Overview

**Alpha Finders** is a specialized Telegram bot designed to discover and analyze new tokens on TEA Protocol network. It provides real-time token discovery, advanced security analysis, and AI-powered investment recommendations specifically for the TEA Protocol ecosystem.

### Key Features
- 🫖 TEA Protocol focused (Optimism Superchain)
- 🔄 Velodrome DEX integration
- 🛡️ Advanced scam detection
- 🤖 AI-powered risk assessment
- ⭐ Personal watchlist management
- 📊 Real-time market data
- 🔍 Deep contract analysis

---

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Project Structure](#project-structure)
4. [How It Works](#how-it-works)
5. [Bot Commands](#bot-commands)
6. [API Integrations](#api-integrations)
7. [Security Features](#security-features)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Installation

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Telegram Bot Token** (from @BotFather)
- **Groq API Key** (from https://console.groq.com/) - Optional but recommended

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd alpha-finders

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file with your credentials
nano .env  # or use any text editor

# 5. Run the bot
npm start
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Telegram Bot Token
# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional but Recommended: Groq AI API Key
# Get from https://console.groq.com/
# Enables AI-powered recommendations
GROQ_API_KEY=your_groq_api_key_here

# Optional: RPC Endpoints
# Default is provided, but you can use your own
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# Optional: Etherscan API Key
# For contract verification checks
ETHERSCAN_API_KEY=your_etherscan_api_key

# Environment
NODE_ENV=production
```

### Getting API Keys

#### 1. Telegram Bot Token
1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the token provided

#### 2. Groq API Key
1. Visit https://console.groq.com/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and save it securely

---

## Project Structure

```
alpha-finders/
├── index.js                          # Main bot file
├── package.json                      # Dependencies and scripts
├── .env                              # Environment variables (create this)
├── .env.example                      # Example environment file
├── README.md                         # Project documentation
│
├── services/                         # Core services
│   ├── teaTokenFetcher.js           # Fetch tokens from TEA network
│   ├── teaScamChecker.js            # Security & scam detection
│   ├── teaAiAnalyzer.js             # AI analysis & scoring
│   └── watchlistService.js          # Watchlist management
│
└── utils/                            # Utility functions
    └── teaFormatters.js             # Message formatting for Telegram
```

---

## How It Works

### 1. Token Discovery Flow

```
User clicks "Fresh TEA Tokens"
         ↓
Step 1: Scan TEA Protocol blockchain
         ↓
Step 2: Fetch from Velodrome & DexScreener
         ↓
Step 3: Run security analysis (scam filtering)
         ↓
Step 4: AI risk assessment & scoring
         ↓
Display results with action buttons
```

### 2. Security Analysis Process

```
Contract Address Input
         ↓
Validate address format
         ↓
Fetch contract bytecode
         ↓
Honeypot detection check
         ↓
Analyze contract features:
  • Mint function
  • Blacklist
  • Ownership status
         ↓
Liquidity analysis
         ↓
teaRank eligibility check
         ↓
Calculate risk score (0-10)
         ↓
Return comprehensive analysis
```

### 3. AI Scoring System

The bot uses a multi-factor scoring system:

**Degen Score (1-10):**
- Age factor: Newer tokens get higher scores
- Liquidity: Higher liquidity = better score
- Volume: More trading activity = higher score
- Price change: Positive momentum = bonus points
- Transaction count: More txns = active token
- Buy/Sell ratio: More buys = bullish signal
- Safety score: Safer tokens get bonus points

**Risk Level:**
- 🟢 SAFE (0-3): Low risk, good fundamentals
- 🟡 CAUTION (4-6): Medium risk, proceed carefully
- 🔴 RISKY (7-10): High risk, avoid trading

---

## Bot Commands

### Main Menu Buttons

#### 🫖 Fresh TEA Tokens
- Discovers new tokens from the last 24 hours
- Filters out scams automatically
- Provides AI-powered analysis
- Shows top opportunities sorted by degen score

#### 🔍 Analyze Token
- Deep analysis of any contract address
- Honeypot detection
- Security audit
- teaRank eligibility check
- Risk assessment

#### 📈 TEA Market Overview
- Information about TEA Protocol
- Velodrome DEX details
- Bot capabilities overview

#### ⭐ My Watchlist
- View your saved tokens
- Quick access to tracked tokens
- Portfolio management

#### ⚙️ Settings
- Current bot configuration
- Security features overview
- Filtering options

#### ❓ Help
- Comprehensive help guide
- Usage instructions
- Risk level explanations

#### 🛑 Stop Operations
- Cancel running operations
- Emergency stop button

### Text Commands

```
/start        - Show main menu
/stop         - Stop current operation
<address>     - Analyze any contract address
```

---

## API Integrations

### 1. DexScreener API

**Purpose:** Fetch real-time token data

**Endpoints Used:**
- `GET /latest/dex/tokens/optimism` - Get latest tokens
- `GET /latest/dex/tokens/{address}` - Get specific token data

**Data Retrieved:**
- Price information
- Liquidity data
- Volume statistics
- Transaction counts
- Market cap

### 2. Velodrome Finance API

**Purpose:** Primary DEX data for TEA Protocol

**Endpoint:**
- `GET /api/v1/pairs` - Get trading pairs

**Data Retrieved:**
- Liquidity pools
- Trading pairs
- Volume data
- TVL (Total Value Locked)

### 3. Honeypot.is API

**Purpose:** Scam detection

**Endpoint:**
- `GET /v2/IsHoneypot?address={address}&chainID=10`

**Data Retrieved:**
- Honeypot status
- Buy/Sell ability
- Tax information

### 4. Groq AI API

**Purpose:** AI-powered analysis and recommendations

**Endpoint:**
- `POST /openai/v1/chat/completions`

**Model Used:**
- `llama-3.3-70b-versatile`

**Features:**
- Investment recommendations
- Risk analysis
- Detailed insights

### 5. Optimism Etherscan API

**Purpose:** Contract verification

**Endpoint:**
- `GET /api?module=contract&action=getsourcecode`

**Data Retrieved:**
- Contract source code
- Verification status
- Compiler information

---

## Security Features

### Multi-Layer Scam Detection

#### Level 1: Basic Filters
- ✅ Minimum liquidity requirement ($100)
- ✅ Valid contract address
- ✅ Active trading activity

#### Level 2: Pattern Analysis
- ✅ Symbol validation (no special characters)
- ✅ Tax analysis (flags high taxes)
- ✅ Liquidity to market cap ratio
- ✅ Trading volume verification

#### Level 3: Contract Analysis
- ✅ Honeypot detection
- ✅ Mint function check
- ✅ Blacklist detection
- ✅ Ownership analysis
- ✅ Renouncement verification

#### Level 4: Advanced Checks
- ✅ Liquidity lock verification
- ✅ Buy/sell ability testing
- ✅ Transfer restriction analysis
- ✅ Fee manipulation detection

### Safety Score Calculation

```javascript
Safety Score (0-100) = 100 - penalties

Penalties:
- Honeypot detected: -50 points
- Cannot sell: -30 points
- Low liquidity (<$500): -20 points
- Low volume (<$100): -15 points
- Few transactions: -15 points
- High buy tax (>10%): -10 points
- High sell tax (>10%): -10 points
```

### Risk Score Calculation

```javascript
Risk Score (0-10) = sum of risk factors

Risk Factors:
+ Honeypot: +10
+ Cannot sell: +8
+ Mint function (no renouncement): +3
+ Blacklist function: +3
+ No liquidity lock: +2
+ High buy tax: +2
+ High sell tax: +2
+ No liquidity: +4

Positive Factors:
- Ownership renounced: -2
- Liquidity locked: -2
- teaRank eligible: -1
```

---

## Deployment

### Option 1: Local Deployment

```bash
# Install dependencies
npm install

# Start the bot
npm start

# Keep running in background (Linux/Mac)
nohup npm start &

# Or use PM2
npm install -g pm2
pm2 start index.js --name alpha-finders
pm2 save
pm2 startup
```

### Option 2: Railway Deployment

1. Create account on Railway.app
2. Create new project
3. Connect GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy automatically

**Railway Configuration:**
```
Start Command: npm start
Environment: Node.js
```

### Option 3: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create alpha-finders

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set GROQ_API_KEY=your_key

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 4: VPS Deployment (Ubuntu)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
git clone <your-repo-url>
cd alpha-finders

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Install PM2
sudo npm install -g pm2

# Start bot
pm2 start index.js --name alpha-finders

# Setup auto-restart on system reboot
pm2 startup
pm2 save

# Monitor bot
pm2 status
pm2 logs alpha-finders
```

### Option 5: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  bot:
    build: .
    restart: always
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - OPTIMISM_RPC_URL=${OPTIMISM_RPC_URL}
```

Deploy:

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Troubleshooting

### Common Issues

#### 1. Bot Not Responding

**Problem:** Bot doesn't reply to messages

**Solutions:**
```bash
# Check if bot is running
pm2 status  # if using PM2
# or
ps aux | grep node

# Check logs
pm2 logs alpha-finders
# or
tail -f logs/bot.log

# Restart bot
pm2 restart alpha-finders
# or
npm start
```

#### 2. "Invalid Bot Token" Error

**Problem:** Bot fails to start with authentication error

**Solution:**
1. Verify your bot token in `.env` file
2. Make sure there are no extra spaces or quotes
3. Get a new token from @BotFather if needed

```bash
# Correct format in .env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Wrong format (don't use quotes)
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
```

#### 3. No Tokens Found

**Problem:** Bot returns "No safe tokens found"

**Possible Causes:**
- No new tokens in last 24 hours on TEA Protocol
- API rate limits reached
- DexScreener API down
- All tokens filtered out by security checks

**Solution:**
```bash
# Check API connectivity
curl https://api.dexscreener.com/latest/dex/tokens/optimism

# Adjust filtering in teaScamChecker.js if needed
# Reduce minimum liquidity or safety requirements for testing
```

#### 4. AI Recommendations Not Showing

**Problem:** Tokens display without AI analysis

**Cause:** Groq API key not set or invalid

**Solution:**
```bash
# Verify Groq API key in .env
echo $GROQ_API_KEY

# Test Groq API
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"test"}]}'
```

#### 5. High Memory Usage

**Problem:** Bot consumes too much RAM

**Solution:**
```javascript
// Add memory limits in package.json
"scripts": {
  "start": "node --max-old-space-size=512 index.js"
}
```

#### 6. Rate Limit Errors

**Problem:** "429 Too Many Requests" errors

**Solution:**
- Add delays between API calls
- Implement caching
- Use premium API keys if available

```javascript
// Add delay in service files
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

## Performance Optimization

### 1. Caching Strategy

Implement Redis for caching token data:

```javascript
// Example caching implementation
import Redis from 'redis';
const redis = Redis.createClient();

async function getCachedTokenData(address) {
  const cached = await redis.get(`token:${address}`);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchTokenData(address);
  await redis.setex(`token:${address}`, 300, JSON.stringify(data));
  return data;
}
```

### 2. Request Batching

Batch multiple token analyses:

```javascript
// Process tokens in batches of 5
const BATCH_SIZE = 5;
for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
  const batch = tokens.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(token => analyzeToken(token)));
}
```

### 3. Database Integration

For production, replace in-memory watchlist with database:

```javascript
// Example with MongoDB
import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema({
  userId: String,
  tokens: [{
    contractAddress: String,
    symbol: String,
    addedAt: Date
  }]
});

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);
```

---

## Contributing

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd alpha-finders

# Install dependencies
npm install

# Create development .env
cp .env.example .env.development

# Run in development mode with auto-reload
npm run dev
```

### Code Style

- Use ES6+ features
- Follow async/await pattern
- Add error handling for all external API calls
- Comment complex logic
- Use descriptive variable names

### Testing

```bash
# Add test framework
npm install --save-dev jest

# Create test file
// tests/tokenFetcher.test.js
import { fetchFreshTeaTokens } from '../services/teaTokenFetcher';

test('fetches TEA tokens', async () => {
  const tokens = await fetchFreshTeaTokens();
  expect(Array.isArray(tokens)).toBe(true);
});
```

---

## Future Enhancements

### Planned Features

1. **Enhanced teaRank Integration**
   - Real-time teaRank scores
   - Project dependency tracking
   - Reward calculation estimates

2. **Advanced Analytics**
   - Price prediction models
   - Portfolio tracking
   - Performance analytics
   - Historical data analysis

3. **Multi-Wallet Support**
   - Track multiple wallets
   - Portfolio aggregation
   - Transaction history

4. **Alerts System**
   - Price alerts
   - Volume spike notifications
   - New token alerts
   - Custom alert rules

5. **Social Features**
   - Share findings with community
   - Collaborative watchlists
   - User ratings and reviews

6. **Web Dashboard**
   - Visual analytics
   - Advanced charts
   - Export functionality
   - Historical performance

---

## FAQ

### Q: Does this bot automatically trade tokens?
**A:** No, Alpha Finders is purely an analysis and discovery tool. It provides information and links to DEXs, but does not execute trades.

### Q: Is the bot free to use?
**A:** Yes, the bot is free to use. You only need a Telegram account and the bot token.

### Q: What makes this specific to TEA Protocol?
**A:** The bot is optimized for TEA Protocol by:
- Focusing on Optimism Superchain (TEA's network)
- Integrating with Velodrome (TEA's partner DEX)
- Checking teaRank eligibility
- Monitoring TEA ecosystem projects

### Q: How accurate is the AI analysis?
**A:** The AI provides educated recommendations based on market data, but should not be considered financial advice. Always do your own research (DYOR).

### Q: Can I run multiple bot instances?
**A:** Yes, but each instance needs its own bot token from @BotFather.

### Q: Is my watchlist private?
**A:** Yes, watchlists are stored per-user and are not shared with others.

### Q: How often does the bot check for new tokens?
**A:** The bot checks on-demand when you click "Fresh TEA Tokens". It doesn't run continuously in the background.

### Q: Can I use this for other chains?
**A:** The current version is specifically for TEA Protocol (Optimism). You would need to modify the code to support other chains.

---

## Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **TEA Protocol**: [tea.xyz](https://tea.xyz)
- **Velodrome Finance**: [velodrome.finance](https://velodrome.finance)

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- TEA Protocol team for the innovative developer reward system
- Velodrome Finance for DEX integration
- DexScreener for market data
- Groq for AI capabilities
- The open-source community

---

**Built with ❤️ for TEA Protocol** 🫖

Version 1.0.0 | Last Updated: November 2024#   t e a p r o t o c o l a l p h a f i n d e r  
 