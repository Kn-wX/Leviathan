const mongoose = require('mongoose');

const UserContextSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: String,
  conversationHistory: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    aiResponse: String,
    toxicityScore: Number,
    spamScore: Number,
    context: String
  }],
  preferences: {
    personality: { type: String, default: 'neutral' },
    language: { type: String, default: 'en' },
    responseStyle: { type: String, enum: ['formal', 'casual', 'friendly'], default: 'friendly' }
  },
  warningHistory: [{
    timestamp: Date,
    reason: String,
    severity: String
  }],
  trustScore: { type: Number, default: 1.0 }, // 0-1, higher is more trustworthy
  lastInteraction: Date,
  totalInteractions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserContextSchema.index({ guildId: 1, userId: 1 });

module.exports = mongoose.model('UserContext', UserContextSchema);
