const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  winners: { type: Number, required: true },
  participants: [{ type: String }],
  bannedUsers: [{ type: String }],
  bannedRoles: [{ type: String }],
  endTime: { type: Date, required: true },
  createdBy: { type: String, required: true },
  ended: { type: Boolean, default: false },
  selectedWinners: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Giveaway', GiveawaySchema);
