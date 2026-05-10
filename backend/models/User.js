const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalFlashcards: { type: Number, default: 0 },
    masteredFlashcards: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    lastStudied: { type: Date }
  },
  weakTopics: [{ topic: String, score: Number, updatedAt: Date }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
