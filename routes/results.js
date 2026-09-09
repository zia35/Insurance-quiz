const express = require('express');
const router = express.Router();

const quizResults = {};

// Reference to quiz questions
const quizQuestions = [
  { id: 1, question: "What is the primary purpose of health insurance?", correctAnswer: 0 },
  { id: 2, question: "What does 'deductible' mean in insurance?", correctAnswer: 1 },
  { id: 3, question: "What is a 'premium'?", correctAnswer: 1 },
  { id: 4, question: "What does 'co-insurance' refer to?", correctAnswer: 1 },
  { id: 5, question: "What is a 'copay'?", correctAnswer: 0 }
];

/**
 * POST /api/results/submit
 * Submit quiz results when participant completes the quiz
 * Request: { sessionId, name, answers }
 * Response: { resultId, score, passed, results }
 */
router.post('/submit', (req, res) => {
  const { sessionId, name, answers } = req.body;

  if (!sessionId || !name || !answers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate score
  let correctCount = 0;
  const detailedResults = [];

  quizQuestions.forEach(question => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer && userAnswer.correct;

    if (isCorrect) {
      correctCount++;
    }

    detailedResults.push({
      questionId: question.id,
      question: question.question,
      correct: isCorrect,
      userAnswerIndex: userAnswer?.selectedOptionIndex,
      attempts: userAnswer?.attempts || 0
    });
  });

  const totalQuestions = quizQuestions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passingScore = parseInt(process.env.PASSING_SCORE) || 85;
  const passed = score >= passingScore;

  const resultId = `result_${sessionId}`;
  const completedTime = new Date().toISOString();

  // Store result
  quizResults[resultId] = {
    resultId,
    sessionId,
    name,
    score,
    passed,
    correctCount,
    totalQuestions,
    completedTime,
    detailedResults
  };

  res.status(200).json({
    success: true,
    resultId,
    name,
    score,
    passed,
    correctCount,
    totalQuestions,
    passingScore,
    message: passed
      ? `Congratulations ${name}! You passed with ${score}%`
      : `Thank you for taking the quiz, ${name}. Your score is ${score}%. You need ${passingScore}% to pass.`,
    shareUrl: `${process.env.SHARE_URL || 'http://localhost:5000'}/results/${resultId}`
  });
});

/**
 * GET /api/results/:resultId
 * Get quiz results by result ID
 */
router.get('/:resultId', (req, res) => {
  const { resultId } = req.params;

  const result = quizResults[resultId];
  if (!result) {
    return res.status(404).json({ error: 'Result not found' });
  }

  res.status(200).json({
    success: true,
    result: {
      name: result.name,
      score: result.score,
      passed: result.passed,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      completedTime: result.completedTime,
      detailedResults: result.detailedResults
    }
  });
});

/**
 * POST /api/results/share
 * Generate shareable URL for results
 * Request: { resultId }
 * Response: { shareUrl, expiresIn }
 */
router.post('/share', (req, res) => {
  const { resultId } = req.body;

  const result = quizResults[resultId];
  if (!result) {
    return res.status(404).json({ error: 'Result not found' });
  }

  const shareUrl = `${process.env.SHARE_URL || 'http://localhost:5000'}/results/${resultId}`;

  res.status(200).json({
    success: true,
    shareUrl,
    name: result.name,
    score: result.score,
    message: `Share this URL to let others view your results: ${shareUrl}`
  });
});

module.exports = router;
