const mongoose = require('mongoose');

const BotStatisticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  commandsExecuted: { type: Number, default: 0 },
  messagesProcessed: { type: Number, default: 0 },
  serversCount: { type: Number, default: 0 },
  usersCount: { type: Number, default: 0 },
  uptime: { type: Number, default: 0 },
  ping: { type: Number, default: 0 }
});

BotStatisticsSchema.index({ date: 1 });

module.exports = mongoose.model('BotStatistics', BotStatisticsSchema);
