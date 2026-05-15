const mongoose = require('mongoose');

const RestrictionSchema = new mongoose.Schema({
  botId: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, enum: ['noprefix', 'blacklist'], required: true },
  expiresAt: { type: Date, default: null },
  isLifetime: { type: Boolean, default: false },
  addedBy: { type: String, default: null },
  reasonForRestriction: { type: String, default: null }
});

RestrictionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Restriction', RestrictionSchema);
