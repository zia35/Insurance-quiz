const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for quiz sessions
const quizSessions = {};
const quizResults = {};

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const resultsRoutes = require('./routes/results');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultsRoutes);

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quiz Portal Server running on http://localhost:${PORT}`);
});

module.exports = { quizSessions, quizResults };
