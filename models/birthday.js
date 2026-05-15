const mongoose = require('mongoose');

const BirthdaySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  year: { type: Number },
  channelId: { type: String },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

BirthdaySchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Birthday', BirthdaySchema);
