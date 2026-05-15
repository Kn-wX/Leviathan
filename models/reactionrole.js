const mongoose = require('mongoose');

const ReactionRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  reactions: [{
    emoji: { type: String, required: true },
    roleId: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

ReactionRoleSchema.index({ guildId: 1, messageId: 1 }, { unique: true });

module.exports = mongoose.model('ReactionRole', ReactionRoleSchema);
