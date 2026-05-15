const mongoose = require('mongoose');

const DisabledCommandsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    commandName: { type: String, required: true },
    disabledAt: { type: Date, default: Date.now }
});

DisabledCommandsSchema.index({ guildId: 1, commandName: 1 }, { unique: true });

module.exports = mongoose.model('DisabledCommands', DisabledCommandsSchema);
