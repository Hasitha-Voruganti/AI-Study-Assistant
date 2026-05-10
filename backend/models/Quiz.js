const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  userAnswer: { type: Number, default: null },
  isCorrect: { type: Boolean, default: null }
});

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  title: { type: String, required: true },
  subject: { type: String },
  topic: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  questions: [questionSchema],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
