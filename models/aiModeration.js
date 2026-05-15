const mongoose = require('mongoose');

const AIModerationSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  threshold: { type: Number, default: 0.7 }, // 0-1 confidence threshold
  policies: [{
    name: String,
    pattern: String,
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    action: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' },
    duration: Number // in milliseconds
  }],
  contextMemory: {
    enabled: { type: Boolean, default: true },
    maxUsers: { type: Number, default: 100 },
    retention: { type: Number, default: 86400000 } // 24 hours
  },
  raidDetection: { type: Boolean, default: true },
  raidThreshold: { type: Number, default: 5 }, // members joined in 10 seconds
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIModeration', AIModerationSchema);
