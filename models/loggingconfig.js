const mongoose = require('mongoose');

const LoggingConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  categoryId: { type: String },
  channels: {
    channellog: { type: String },
    memberlog: { type: String },
    messagelog: { type: String },
    modlog: { type: String },
    rolelog: { type: String },
    vclog: { type: String }
  },
  webhooks: {
    channellog: { type: String },
    memberlog: { type: String },
    messagelog: { type: String },
    modlog: { type: String },
    rolelog: { type: String },
    vclog: { type: String }
  },
  enabledLogs: {
    channellog: { type: Boolean, default: false },
    memberlog: { type: Boolean, default: false },
    messagelog: { type: Boolean, default: false },
    modlog: { type: Boolean, default: false },
    rolelog: { type: Boolean, default: false },
    vclog: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoggingConfig', LoggingConfigSchema);
