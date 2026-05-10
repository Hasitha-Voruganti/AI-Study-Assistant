const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');
const User = require('../models/User');
const { generateFlashcards } = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorMiddleware');

const createFlashcards = asyncHandler(async (req, res) => {
  const { documentId, numCards } = req.body;
  if (!documentId) return res.status(400).json({ success: false, message: 'Document ID required' });

  const doc = await Document.findOne({ _id: documentId, user: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  if (!doc.extractedText || doc.extractedText.trim().length < 50)
    return res.status(400).json({ success: false, message: 'Document has no readable text. Please re-upload.' });

  const num   = Math.min(Math.max(parseInt(numCards) || 10, 5), 20);
  const cards = await generateFlashcards(doc.extractedText.substring(0, 3500), doc.topic, num);
  if (!cards || cards.length === 0)
    return res.status(500).json({ success: false, message: 'AI could not generate flashcards. Try again.' });

  const flashcardSet = await Flashcard.create({
    user: req.user._id, document: documentId,
    subject: doc.subject, topic: doc.topic,
    title: `${doc.topic} Flashcards`,
    cards: cards.map(c => ({ front: c.front, back: c.back, status: 'new' })),
    totalCards: cards.length
  });

  const user = await User.findById(req.user._id);
  user.stats.totalFlashcards = (user.stats.totalFlashcards || 0) + cards.length;
  await user.save();

  res.status(201).json({ success: true, flashcardSet });
});

const updateCardStatus = asyncHandler(async (req, res) => {
  const { cardIndex, status } = req.body;
  const flashcardSet = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!flashcardSet) return res.status(404).json({ success: false, message: 'Flashcard set not found' });

  if (flashcardSet.cards[cardIndex]) {
    flashcardSet.cards[cardIndex].status = status;
    flashcardSet.cards[cardIndex].reviewCount += 1;
    flashcardSet.cards[cardIndex].lastReviewed = new Date();
    flashcardSet.masteredCount = flashcardSet.cards.filter(c => c.status === 'mastered').length;
    await flashcardSet.save();

    const user = await User.findById(req.user._id);
    const allSets = await Flashcard.find({ user: req.user._id });
    user.stats.masteredFlashcards = allSets.reduce((sum, s) => sum + s.masteredCount, 0);
    await user.save();
  }

  res.json({ success: true, flashcardSet });
});

const getFlashcards = asyncHandler(async (req, res) => {
  const flashcards = await Flashcard.find({ user: req.user._id }).populate('document', 'title').sort('-createdAt');
  res.json({ success: true, flashcards });
});

const getFlashcardSet = asyncHandler(async (req, res) => {
  const set = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!set) return res.status(404).json({ success: false, message: 'Flashcard set not found' });
  res.json({ success: true, flashcardSet: set });
});

module.exports = { createFlashcards, updateCardStatus, getFlashcards, getFlashcardSet };
