const mongoose = require('mongoose');

const BotLogsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  commandLogId: { type: String },
  noPrefixLogId: { type: String },
  blacklistLogId: { type: String },
  pingLogId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BotLogs', BotLogsSchema);
