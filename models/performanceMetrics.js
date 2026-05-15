const mongoose = require('mongoose');

const PerformanceMetricsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  metrics: {
    commandsRun: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // ms
    messagesProcessed: { type: Number, default: 0 },
    moderationActions: { type: Number, default: 0 },
    aiAnalysisTime: { type: Number, default: 0 }, // ms
    flaggedMessages: { type: Number, default: 0 },
    raidDetections: { type: Number, default: 0 },
    cpuUsage: { type: Number, default: 0 }, // percentage
    memoryUsage: { type: Number, default: 0 }, // MB
    ping: { type: Number, default: 0 } // ms
  },
  topCommands: [{
    name: String,
    count: Number,
    avgTime: Number
  }],
  errors: { type: Number, default: 0 },
  warnings: { type: Number, default: 0 }
});

PerformanceMetricsSchema.index({ guildId: 1, timestamp: -1 });

module.exports = mongoose.model('PerformanceMetrics', PerformanceMetricsSchema);
