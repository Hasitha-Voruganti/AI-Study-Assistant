const Document = require('../models/Document');
const { extractTextFromPDF, chunkText } = require('../services/pdfService');
const { asyncHandler } = require('../middleware/errorMiddleware');

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No PDF file uploaded' });

  const { title, subject, topic, tags } = req.body;
  if (!title || !subject || !topic) {
    return res.status(400).json({ success: false, message: 'Title, subject and topic are required' });
  }

  const { text, pageCount } = await extractTextFromPDF(req.file.buffer);
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Ensure it is not scanned/image-only.' });
  }

  const chunks = chunkText(text);
  const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];

  const doc = await Document.create({
    user: req.user._id,
    title,
    subject,
    topic,
    tags: parsedTags,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    extractedText: text,
    chunks,
    pageCount,
    isProcessed: true
  });

  res.status(201).json({
    success: true,
    message: 'PDF uploaded and processed successfully',
    document: {
      id: doc._id, title: doc.title, subject: doc.subject, topic: doc.topic,
      tags: doc.tags, pageCount: doc.pageCount, chunksCount: chunks.length,
      fileSize: doc.fileSize, uploadedAt: doc.uploadedAt
    }
  });
});

const getDocuments = asyncHandler(async (req, res) => {
  const { subject, search } = req.query;
  const filter = { user: req.user._id };
  if (subject) filter.subject = subject;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { topic: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } }
  ];

  const documents = await Document.find(filter)
    .select('-extractedText -chunks')
    .sort('-createdAt');

  res.json({ success: true, count: documents.length, documents });
});

const getDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('-extractedText -chunks');
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, document: doc });
});

const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, message: 'Document deleted' });
});

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
