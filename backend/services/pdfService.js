const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return { text: data.text, pageCount: data.numpages, info: data.info };
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

const chunkText = (text, chunkSize = 1000, overlap = 100) => {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';
  let index = 0;

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push({ content: currentChunk.trim(), index });
      index++;
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  if (currentChunk.trim()) chunks.push({ content: currentChunk.trim(), index });
  return chunks;
};

const findRelevantChunks = (chunks, query, topK = 3) => {
  if (!chunks || chunks.length === 0) return [];

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = chunks.map(chunk => {
    const content = typeof chunk === 'string' ? chunk : (chunk.content || '');
    const lower = content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const regex = new RegExp(word, 'gi');
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    return { content, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.content)
    .filter(c => c && c.trim().length > 0);
};

module.exports = { extractTextFromPDF, chunkText, findRelevantChunks };
