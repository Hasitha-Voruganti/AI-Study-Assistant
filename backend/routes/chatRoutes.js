const express = require('express');
const router = express.Router();
const { chat, getChatHistory, getAllChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', chat);
router.get('/', getAllChats);
router.get('/:documentId', getChatHistory);

module.exports = router;
