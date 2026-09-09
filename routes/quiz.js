const express = require('express');
const router = express.Router();

// Quiz questions database
const quizQuestions = [
  {
    id: 1,
    question: "What is the primary purpose of health insurance?",
    options: [
      "To cover medical expenses and healthcare costs",
      "To replace lost income",
      "To provide life coverage",
      "To cover property damage"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "What does 'deductible' mean in insurance?",
    options: [
      "The maximum amount the insurer will pay",
      "The amount you must pay before insurance coverage begins",
      "The monthly cost of insurance",
      "The penalty for canceling insurance"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is a 'premium'?",
    options: [
      "A reward for staying insured",
      "The amount you pay regularly for insurance coverage",
      "The total amount covered by insurance",
      "A discount on insurance"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "What does 'co-insurance' refer to?",
    options: [
      "Insurance provided by two companies",
      "The percentage of costs you share with the insurer after meeting your deductible",
      "Additional insurance coverage",
      "A type of life insurance"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What is a 'copay'?",
    options: [
      "A flat fee you pay for a specific service",
      "A percentage of the total bill",
      "The annual cost of insurance",
      "A discount from the provider"
    ],
    correctAnswer: 0
  }
];

const quizSessions = {}; // Reference to sessions from auth

/**
 * GET /api/quiz/questions
 * Get all quiz questions (without correct answers)
 */
router.get('/questions', (req, res) => {
  const questionsForDisplay = quizQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.status(200).json({
    success: true,
    totalQuestions: questionsForDisplay.length,
    questions: questionsForDisplay
  });
});

/**
 * POST /api/quiz/submit-answer
 * Submit an answer for a question
 * Request: { sessionId, questionId, selectedOptionIndex }
 * Response: { correct: boolean, correctAnswer: string, attempts: number }
 */
router.post('/submit-answer', (req, res) => {
  const { sessionId, questionId, selectedOptionIndex } = req.body;

  // Validation
  if (!sessionId || !questionId || selectedOptionIndex === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if session exists (you would need to pass this from auth)
  // For now, we'll create a simple check
  const question = quizQuestions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = selectedOptionIndex === question.correctAnswer;
  const attemptKey = `q${questionId}`;

  // Initialize session if needed
  if (!quizSessions[sessionId]) {
    quizSessions[sessionId] = {
      answers: {},
      attempts: {},
      score: null
    };
  }

  // Track attempts
  if (!quizSessions[sessionId].attempts[attemptKey]) {
    quizSessions[sessionId].attempts[attemptKey] = 0;
  }

  quizSessions[sessionId].attempts[attemptKey]++;
  const attempts = quizSessions[sessionId].attempts[attemptKey];

  // Check if max attempts reached
  const maxAttempts = parseInt(process.env.MAX_ATTEMPTS) || 4;
  if (attempts > maxAttempts) {
    return res.status(400).json({
      error: `Maximum attempts (${maxAttempts}) reached for this question`,
      attempts
    });
  }

  // Store answer if correct
  if (isCorrect) {
    quizSessions[sessionId].answers[questionId] = {
      selectedOptionIndex,
      correct: true,
      attempts
    };
  }

  res.status(200).json({
    success: true,
    correct: isCorrect,
    correctAnswer: question.options[question.correctAnswer],
    selectedAnswer: question.options[selectedOptionIndex],
    attempts,
    maxAttempts,
    message: isCorrect ? 'Correct! Moving to next question.' : `Incorrect. You have ${maxAttempts - attempts} attempts remaining.`
  });
});

/**
 * GET /api/quiz/progress/:sessionId
 * Get quiz progress for a participant
 */
router.get('/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (!quizSessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = quizSessions[sessionId];
  const totalQuestions = quizQuestions.length;
  const answeredCorrectly = Object.keys(session.answers).length;

  res.status(200).json({
    success: true,
    totalQuestions,
    answeredCorrectly,
    progress: Math.round((answeredCorrectly / totalQuestions) * 100),
    answers: session.answers
  });
});

module.exports = router;
