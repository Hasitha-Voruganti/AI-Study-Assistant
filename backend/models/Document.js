const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  tags: [{ type: String }],
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  extractedText: { type: String, required: true },
  chunks: [{ content: String, index: Number }],
  pageCount: { type: Number, default: 0 },
  isProcessed: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

documentSchema.index({ user: 1, subject: 1 });
documentSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Document', documentSchema);
