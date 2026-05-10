const express = require('express');
const router = express.Router();
const { createQuiz, submitQuiz, getQuizzes, getQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', createQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);

module.exports = router;
