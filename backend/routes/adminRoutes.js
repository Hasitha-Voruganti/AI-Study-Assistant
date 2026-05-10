const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Document = require('../models/Document');
const Quiz = require('../models/Quiz');

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/documents', protect, adminOnly, async (req, res) => {
  try {
    const documents = await Document.find({})
      .select('-extractedText -chunks')
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, documents });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/documents/:id', protect, adminOnly, async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalDocuments, totalQuizzes] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Document.countDocuments(),
      Quiz.countDocuments({ isCompleted: true })
    ]);
    const recentUsers = await User.find({ role: 'student' }).select('name email createdAt stats').sort('-createdAt').limit(5);
    const recentDocs  = await Document.find({}).select('-extractedText -chunks').populate('user', 'name email').sort('-createdAt').limit(5);
    const topStudents = await User.find({ role: 'student' }).select('name email stats').sort('-stats.averageScore').limit(5);
    res.json({ success: true, stats: { totalUsers, totalDocuments, totalQuizzes }, recentUsers, recentDocs, topStudents });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
