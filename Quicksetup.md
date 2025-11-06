# 🫖 Alpha Finders - Quick Setup Guide

## Complete File Structure

Create this exact folder structure:

```
alpha-finders/
│
├── index.js                      # Main bot file (already provided)
│
├── services/                     # Create this folder
│   ├── teaTokenFetcher.js       # Token fetching service 
│   ├── teaScamChecker.js        # Security analysis
│   ├── teaAiAnalyzer.js         # AI analysis 
│   └── watchlistService.js      # Watchlist management 
│
├── utils/                        # Create this folder
│   └── teaFormatters.js         # Message formatting
│
├── package.json                  # Dependencies file 
├── .env                          # Your environment variables (create this)
├── .env.example                  # Example env file 
├── README.md                     # Documentation 
└── .gitignore                    # Git ignore file 
```

## Step-by-Step Setup

### Step 1: Create Project Folder

```bash
mkdir alpha-finders
cd alpha-finders
```

### Step 2: Create package.json

Create a file named `package.json`:

```json
{
  "name": "alpha-finders",
  "version": "1.0.0",
  "description": "TEA Protocol Token Discovery Telegram Bot",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^17.2.1",
    "node-telegram-bot-api": "^0.66.0",
    "web3": "^4.16.0"
  },
  "keywords": [
    "telegram",
    "bot",
    "tea-protocol",
    "crypto",
    "optimism",
    "velodrome",
    "token-discovery"
  ],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Create Folders

```bash
mkdir services
mkdir utils
```

### Step 4: Create .env.example

Create a file named `.env.example`:

```env
# Telegram Bot Configuration
# Get your bot token from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Groq AI API Configuration  
# Get your API key from https://console.groq.com/
# This is optional but highly recommended for AI features
GROQ_API_KEY=your_groq_api_key_here

# RPC Endpoints (Optional - defaults are provided)
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# Etherscan API (Optional - for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Environment
NODE_ENV=production
```

### Step 5: Create .env (Your Actual Config)

```bash
cp .env.example .env
nano .env  # or use any text editor
```

Add your actual API keys:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPTIMISM_RPC_URL=https://mainnet.optimism.io
NODE_ENV=production
```

### Step 6: Create .gitignore

Create a file named `.gitignore`:

```
# Environment variables
.env

# Dependencies
node_modules/

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# PM2
.pm2/
```

### Step 7: Copy All Service Files

Copy these files into their respective folders (I've provided all of them above):

**In root directory:**
- `index.js` - Main bot file

**In `services/` folder:**
- `teaTokenFetcher.js` - Token fetching
- `teaScamChecker.js` - Security checks
- `teaAiAnalyzer.js` - AI analysis
- `watchlistService.js` - Watchlist management

**In `utils/` folder:**
- `teaFormatters.js` - Message formatting

### Step 8: Install Dependencies

```bash
npm install
```

This will install:
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management
- `node-telegram-bot-api` - Telegram bot framework
- `web3` - Ethereum/Optimism blockchain interaction

### Step 9: Get Your Bot Token

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow instructions:
   - Bot name: `Alpha Finders`
   - Bot username: `alphafinders_bot` (or any available name)
5. Copy the token provided
6. Paste it in your `.env` file

### Step 10: Get Groq API Key (Optional)

1. Visit https://console.groq.com/
2. Sign up for free account
3. Go to "API Keys" section
4. Create new API key
5. Copy and paste in `.env` file

### Step 11: Test Run

```bash
npm start
```

You should see:
```
🫖 Alpha Finders Bot instance ID: abc123
🫖 Alpha Finders Bot is running!
✅ TEA Protocol integration active
✅ Velodrome DEX support enabled
```

### Step 12: Test Your Bot

1. Open Telegram
2. Search for your bot username
3. Send `/start`
4. You should see the welcome message with buttons!

---

## Verification Checklist

Before deploying, verify:

- [ ] All files are in correct folders
- [ ] `package.json` exists with correct dependencies
- [ ] `.env` file exists with your actual tokens
- [ ] `.gitignore` exists (if using Git)
- [ ] Bot token is valid (test with @BotFather)
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] Dependencies are installed (`npm install` completed)
- [ ] Bot starts without errors (`npm start` works)
- [ ] Bot responds to `/start` command in Telegram

---

## Common Errors and Fixes

### Error: "Cannot find module"

**Problem:** Missing dependencies or wrong import paths

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check import paths in files
# Make sure all files use .js extension in imports
import { xyz } from './services/file.js'  ✅
import { xyz } from './services/file'     ❌
```

### Error: "Unauthorized" or "Invalid token"

**Problem:** Wrong bot token in .env

**Fix:**
```bash
# Check .env file
cat .env | grep TELEGRAM_BOT_TOKEN

# Make sure no extra spaces or quotes
TELEGRAM_BOT_TOKEN=123456:ABC     ✅
TELEGRAM_BOT_TOKEN="123456:ABC"   ❌
TELEGRAM_BOT_TOKEN= 123456:ABC    ❌
```

### Error: "Address required"

**Problem:** RPC URL issue

**Fix:**
```env
# Add this to .env if not present
OPTIMISM_RPC_URL=https://mainnet.optimism.io
```

### Bot doesn't respond

**Problem:** Polling conflict or bot not running

**Fix:**
```bash
# Stop all node processes
pkill -f node

# Restart bot
npm start

# Or check if already running
ps aux | grep node
```

---

## Running in Background (Production)

### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name alpha-finders

# View logs
pm2 logs alpha-finders

# Restart bot
pm2 restart alpha-finders

# Stop bot
pm2 stop alpha-finders

# Auto-restart on system reboot
pm2 startup
pm2 save
```

### Option 2: Using nohup (Simple)

```bash
# Start in background
nohup npm start > bot.log 2>&1 &

# View logs
tail -f bot.log

# Stop bot
ps aux | grep node
kill <process_id>
```

### Option 3: Using systemd (Linux)

Create `/etc/systemd/system/alpha-finders.service`:

```ini
[Unit]
Description=Alpha Finders Telegram Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/alpha-finders
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=alpha-finders

[Install]
WantedBy=multi-user.target
```

Then:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start alpha-finders

# Enable on boot
sudo systemctl enable alpha-finders

# Check status
sudo systemctl status alpha-finders

# View logs
sudo journalctl -u alpha-finders -f
```

---

## File Sizes Reference

Approximate file sizes for verification:

```
index.js              ~15 KB
services/
  teaTokenFetcher.js   ~8 KB
  teaScamChecker.js    ~12 KB
  teaAiAnalyzer.js     ~9 KB
  watchlistService.js  ~3 KB
utils/
  teaFormatters.js     ~5 KB
package.json          ~0.5 KB
.env                  ~0.2 KB
README.md            ~30 KB
```

---

## Next Steps After Setup

1. **Test All Features**
   - Click "Fresh TEA Tokens" button
   - Send a contract address to analyze
   - Add tokens to watchlist
   - Check all buttons work

2. **Monitor Performance**
   - Watch logs for errors
   - Check API rate limits
   - Monitor memory usage

3. **Deploy to Production**
   - Choose hosting platform (Railway, Heroku, VPS)
   - Set up monitoring
   - Configure auto-restart

4. **Customize (Optional)**
   - Adjust filtering thresholds in `teaScamChecker.js`
   - Modify AI prompts in `teaAiAnalyzer.js`
   - Change button layouts in `index.js`
   - Add your branding

---

## Support Resources

- **Node.js Documentation:** https://nodejs.org/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Web3.js Guide:** https://web3js.readthedocs.io
- **TEA Protocol:** https://tea.xyz
- **Velodrome Finance:** https://velodrome.finance

---

## Quick Commands Reference

```bash
# Setup
npm install                    # Install dependencies
npm start                      # Run bot
npm run dev                    # Run with auto-reload

# PM2 Management
pm2 start index.js            # Start with PM2
pm2 logs                      # View logs
pm2 restart alpha-finders     # Restart
pm2 stop alpha-finders        # Stop

# Debugging
node --version                # Check Node version
npm list                      # List installed packages
pm2 status                    # Check PM2 status
tail -f bot.log              # View logs (nohup)
```

---

## Success! 🎉

If you've followed all steps and the bot responds to `/start`, congratulations! Your Alpha Finders bot is ready to discover alpha on TEA Protocol.

**Need Help?**
- Check the full documentation (README.md)
- Review error messages in logs
- Test each component individually
- Verify API keys are correct

**Ready to Deploy?**
- See "Deployment" section in main documentation
- Choose your hosting platform
- Set up monitoring
- Share with TEA Protocol community!

---

**Built for TEA Protocol Developer Reward System** 🫖