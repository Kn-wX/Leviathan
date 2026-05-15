const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  hubChannelId: { type: String, required: true },
  categoryId: { type: String, required: true },
  interfaceChannelId: { type: String, required: true },
  abandonedCategoryId: { type: String, default: null },
  tempVoiceChannels: [{
    channelId: { type: String, required: true },
    ownerId: { type: String, required: true }
  }],
  blockedUsers: [{
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    expiresAt: { type: Date, default: null }
  }]
});

module.exports = mongoose.model('GuildjtcConfig', GuildConfigSchema);
