const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const quizSessions = {};

/**
 * POST /api/auth/login
 * Login participant with their name
 * Request: { name: string }
 * Response: { sessionId: string, name: string, timestamp: string }
 */
router.post('/login', (req, res) => {
  const { name } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Please provide a valid name' });
  }

  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  // Store session
  quizSessions[sessionId] = {
    sessionId,
    name: name.trim(),
    loginTime: timestamp,
    answers: {},
    attempts: {},
    startTime: null,
    endTime: null,
    score: null
  };

  res.status(200).json({
    success: true,
    sessionId,
    name: name.trim(),
    timestamp,
    message: `Welcome ${name.trim()}! Your session has been created.`
  });
});

/**
 * GET /api/auth/session/:sessionId
 * Verify session is valid
 */
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (!quizSessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = quizSessions[sessionId];
  res.status(200).json({
    success: true,
    sessionId,
    name: session.name,
    loginTime: session.loginTime
  });
});

module.exports = router;
