const mongoose = require('mongoose');

const ContentFilterSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  filters: {
    urls: { type: Boolean, default: false },
    invites: { type: Boolean, default: false },
    toxicity: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },
    customWords: [{ type: String }]
  },
  action: { type: String, enum: ['delete', 'warn', 'mute'], default: 'delete' },
  whitelist: {
    users: [{ type: String }],
    roles: [{ type: String }],
    channels: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContentFilter', ContentFilterSchema);
