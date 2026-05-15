const mongoose = require('mongoose');

const SpamBlacklistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  reason: { type: String },
  messageCount: { type: Number, default: 0 },
  lastMessageTime: { type: Date, default: Date.now },
  blacklisted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpamBlacklist', SpamBlacklistSchema);
