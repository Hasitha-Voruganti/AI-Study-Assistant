const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/documents',  require('./routes/documentRoutes'));
app.use('/api/quiz',       require('./routes/quizRoutes'));
app.use('/api/flashcards', require('./routes/flashcardRoutes'));
app.use('/api/chat',       require('./routes/chatRoutes'));
app.use('/api/analytics',  require('./routes/analyticsRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'AI Study Assistant API running' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
