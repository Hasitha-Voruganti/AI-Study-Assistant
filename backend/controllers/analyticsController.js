const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [documents, quizzes, flashcards, user] = await Promise.all([
    Document.find({ user: userId }).select('-extractedText -chunks').sort('-createdAt').limit(5),
    Quiz.find({ user: userId, isCompleted: true }).sort('-completedAt').limit(5),
    Flashcard.find({ user: userId }).sort('-createdAt').limit(3),
    User.findById(userId)
  ]);

  const totalDocs = await Document.countDocuments({ user: userId });
  const totalQuizzes = await Quiz.countDocuments({ user: userId, isCompleted: true });

  // Score trend over last 7 quizzes
  const recentQuizzes = await Quiz.find({ user: userId, isCompleted: true })
    .sort('-completedAt')
    .limit(7)
    .select('percentage topic completedAt');

  const scoreTrend = recentQuizzes.reverse().map(q => ({
    topic: q.topic,
    score: q.percentage,
    date: q.completedAt
  }));

  // Subject distribution
  const subjectDocs = await Document.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$subject', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    dashboard: {
      stats: user.stats,
      totalDocs,
      totalQuizzes,
      weakTopics: user.weakTopics.slice(0, 5),
      recentDocuments: documents,
      recentQuizzes: quizzes,
      recentFlashcards: flashcards,
      scoreTrend,
      subjectDistribution: subjectDocs
    }
  });
});

module.exports = { getDashboard };
