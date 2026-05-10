const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const User = require('../models/User');
const { generateQuiz } = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorMiddleware');

const createQuiz = asyncHandler(async (req, res) => {
  const { documentId, difficulty, numQuestions } = req.body;
  if (!documentId) return res.status(400).json({ success: false, message: 'Document ID required' });

  const doc = await Document.findOne({ _id: documentId, user: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  if (!doc.extractedText || doc.extractedText.trim().length < 50)
    return res.status(400).json({ success: false, message: 'Document has no readable text. Please re-upload.' });

  const diff   = ['easy', 'medium', 'hard', 'mixed'].includes(difficulty) ? difficulty : 'mixed';
  const num    = Math.min(Math.max(parseInt(numQuestions) || 5, 3), 10);
  const aIDiff = diff === 'mixed' ? 'medium' : diff;

  const questions = await generateQuiz(doc.extractedText.substring(0, 3500), aIDiff, num, doc.topic);
  if (!questions || questions.length === 0)
    return res.status(500).json({ success: false, message: 'AI could not generate quiz. Try again.' });

  const quiz = await Quiz.create({
    user: req.user._id, document: documentId,
    title: `${doc.topic} Quiz`, subject: doc.subject, topic: doc.topic,
    difficulty: diff,
    questions: questions.map(q => ({ ...q, userAnswer: null, isCorrect: null })),
    totalQuestions: questions.length
  });

  res.status(201).json({ success: true, quiz });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  if (quiz.isCompleted) return res.status(400).json({ success: false, message: 'Quiz already submitted' });

  let score = 0;
  quiz.questions = quiz.questions.map((q, i) => {
    const userAns = answers[i] !== undefined ? answers[i] : null;
    const correct = userAns === q.correctAnswer;
    if (correct) score++;
    return { ...q.toObject(), userAnswer: userAns, isCorrect: correct };
  });

  quiz.score = score;
  quiz.percentage = Math.round((score / quiz.totalQuestions) * 100);
  quiz.timeTaken = timeTaken || 0;
  quiz.isCompleted = true;
  quiz.completedAt = new Date();
  await quiz.save();

  const user = await User.findById(req.user._id);
  const allQuizzes = await Quiz.find({ user: req.user._id, isCompleted: true });
  const avgScore = allQuizzes.reduce((sum, q) => sum + q.percentage, 0) / allQuizzes.length;
  user.stats.totalQuizzes = allQuizzes.length;
  user.stats.averageScore = Math.round(avgScore);
  user.stats.lastStudied = new Date();

  if (quiz.percentage < 60) {
    const existing = user.weakTopics.find(w => w.topic === quiz.topic);
    if (existing) { existing.score = quiz.percentage; existing.updatedAt = new Date(); }
    else user.weakTopics.push({ topic: quiz.topic, score: quiz.percentage, updatedAt: new Date() });
  } else {
    user.weakTopics = user.weakTopics.filter(w => w.topic !== quiz.topic);
  }
  await user.save();

  res.json({ success: true, quiz, message: `Quiz submitted! Score: ${score}/${quiz.totalQuestions} (${quiz.percentage}%)` });
});

const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id }).populate('document', 'title').sort('-createdAt').limit(20);
  res.json({ success: true, quizzes });
});

const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  res.json({ success: true, quiz });
});

module.exports = { createQuiz, submitQuiz, getQuizzes, getQuiz };
