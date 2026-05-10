const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    context: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  title: { type: String, default: 'New Chat' }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
