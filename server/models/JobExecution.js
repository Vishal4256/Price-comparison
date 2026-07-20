const mongoose = require('mongoose');

const JobExecutionSchema = new mongoose.Schema({
  jobName: { type: String, required: true, index: true },
  
  startedAt: { type: Date, required: true },
  finishedAt: { type: Date },
  durationMs: { type: Number },
  
  status: { type: String, enum: ['RUNNING', 'COMPLETED', 'FAILED'], default: 'RUNNING' },
  
  processedItems: { type: Number, default: 0 },
  errors: { type: Number, default: 0 },
  
  errorMessage: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// TTL index to automatically purge old job logs after 30 days
JobExecutionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('JobExecution', JobExecutionSchema);
