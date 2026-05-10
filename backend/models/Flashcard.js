const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  subject: { type: String },
  topic: { type: String },
  cards: [{
    front: { type: String, required: true },
    back: { type: String, required: true },
    status: { type: String, enum: ['new', 'learning', 'mastered', 'needs_revision'], default: 'new' },
    reviewCount: { type: Number, default: 0 },
    lastReviewed: { type: Date }
  }],
  title: { type: String, required: true },
  totalCards: { type: Number, default: 0 },
  masteredCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
