<div align="center">

# 🤖 Leviathan Discord Bot

<!-- Add your bot banner here -->
<!-- ![Bot Banner](assets/bot-banner.png) -->

*An all-in-one Discord bot with moderation, security, games, AI chat, and more!*

</div>

---

## ✨ What is Leviathan?

Leviathan is a comprehensive Discord bot that brings everything you need to one place. From server moderation and music streaming to interactive games and AI chatbot features - it's your server's all-in-one solution.

**Features include:** Moderation tools, Security Setup, Interactive games (Chess, Connect4, Wordle, etc.), AI chat integration, Ticket system, Welcome messages, Logging system, and much more!

## 🚀 Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/swagchintu09/Leviathan
   cd Leviathan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your bot**
   - Create a `.env` file
   - Add your Discord bot token: `BOT_TOKEN=your_token_here
 TOKEN=your_token_here`
   - Add other API keys as needed (OpenAI, Spotify, etc.)

4. **Run the bot**
   ```bash
   node shards.js or npm run start
   ```

## ⚙️ Configuration

### Changing Bot Prefix
Edit the prefix in your `config.json` file:
```env
BOT_PREFIX=&
```
Or use the command: `&prefix <new_prefix>` (Admin only)

### Adding API Keys
Add these to your `.env` file for full functionality:
```env
DISCORD_TOKEN=your_bot_token
BOT_PREFIX=!
OPENAI_API_KEY=your_openai_key (for AI chat)
GROQ_API_KEY=your_groqapi_key (also for AI chat
```

### Setting Up Permissions
Make sure your bot has these permissions:
- Send Messages, Embed Links, Manage Messages
- Manage Roles (for moderation)
- Connect & Speak (for music)
- Add Reactions (for games)

## ⚙️ Configuration Guide

### 🔑 Owner ID (No Prefix Commands)
Edit `config.json`:
```python
"OWNER_IDS" = [your_user_id_here, another_id]
```

### ⚡ Bot Prefix 
Edit `BOT_PREFIX` in `config.json` file and restart bot to apply to all guilds:
```config.json
BOT_PREFIX=&
```

### 📁 File Organization
- **Logs** -> Create a logs folder or the bot wont start

## 🏆 Credits

<div align="center">

### 👨‍💻 Development Team

**Developer:** Knowx  
**Discord:** `root.exe`  

</div>
