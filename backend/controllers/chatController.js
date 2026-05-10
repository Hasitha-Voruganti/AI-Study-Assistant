const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const { answerQuestion } = require('../services/aiService');
const { findRelevantChunks } = require('../services/pdfService');
const { asyncHandler } = require('../middleware/errorMiddleware');

const chat = asyncHandler(async (req, res) => {
  const { documentId, question, mode, chatId } = req.body;
  if (!documentId || !question)
    return res.status(400).json({ success: false, message: 'Document ID and question are required' });

  const doc = await Document.findOne({ _id: documentId, user: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  if (!doc.extractedText || doc.extractedText.trim().length < 10)
    return res.status(400).json({ success: false, message: 'Document has no readable text. Please re-upload the PDF.' });

  // Convert Mongoose subdocuments to plain objects
  const plainChunks = doc.chunks.map(c => ({
    content: c.content || c._doc?.content || '',
    index: c.index
  })).filter(c => c.content.trim().length > 0);

  let relevantChunks = findRelevantChunks(plainChunks, question, 4);

  if (!relevantChunks.length) {
    relevantChunks = plainChunks.slice(0, 3).map(c => c.content);
  }
  if (!relevantChunks.length) {
    const sliceSize = 800;
    relevantChunks = [
      doc.extractedText.substring(0, sliceSize),
      doc.extractedText.substring(sliceSize, sliceSize * 2),
      doc.extractedText.substring(sliceSize * 2, sliceSize * 3)
    ].filter(s => s.trim().length > 0);
  }

  const answer = await answerQuestion(question, relevantChunks, mode || 'default');
  const contextSnippet = relevantChunks[0] ? relevantChunks[0].substring(0, 200) + '...' : '';

  let chatSession;
  if (chatId) chatSession = await ChatHistory.findById(chatId);
  if (!chatSession) {
    chatSession = new ChatHistory({
      user: req.user._id,
      document: documentId,
      title: question.substring(0, 50),
      messages: []
    });
  }

  chatSession.messages.push({ role: 'user', content: question });
  chatSession.messages.push({ role: 'assistant', content: answer, context: contextSnippet });
  await chatSession.save();

  res.json({ success: true, answer, contextSnippet, chatId: chatSession._id });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const chats = await ChatHistory.find({ user: req.user._id, document: req.params.documentId })
    .sort('-updatedAt').limit(10);
  res.json({ success: true, chats });
});

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await ChatHistory.find({ user: req.user._id })
    .populate('document', 'title subject').sort('-updatedAt').limit(20);
  res.json({ success: true, chats });
});

module.exports = { chat, getChatHistory, getAllChats };
