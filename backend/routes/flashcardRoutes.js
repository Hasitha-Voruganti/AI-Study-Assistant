const express = require('express');
const router = express.Router();
const { createFlashcards, updateCardStatus, getFlashcards, getFlashcardSet } = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', createFlashcards);
router.get('/', getFlashcards);
router.get('/:id', getFlashcardSet);
router.patch('/:id/card', updateCardStatus);

module.exports = router;
