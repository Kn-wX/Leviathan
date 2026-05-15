const mongoose = require('mongoose');

const ServerAnalyticsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  memberCount: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 },
  commandCount: { type: Number, default: 0 },
  newMembers: { type: Number, default: 0 },
  leftMembers: { type: Number, default: 0 }
});

ServerAnalyticsSchema.index({ guildId: 1, date: 1 });

module.exports = mongoose.model('ServerAnalytics', ServerAnalyticsSchema);
