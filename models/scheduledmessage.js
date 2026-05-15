const mongoose = require('mongoose');

const ScheduledMessageSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  message: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  recurring: {
    enabled: { type: Boolean, default: false },
    interval: { type: String, enum: ['daily', 'weekly', 'monthly'] }
  },
  sent: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

ScheduledMessageSchema.index({ scheduledTime: 1, sent: 1 });

module.exports = mongoose.model('ScheduledMessage', ScheduledMessageSchema);
