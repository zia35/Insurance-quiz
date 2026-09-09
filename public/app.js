// Quiz Portal Application
const API_BASE = 'http://localhost:5000/api';

let currentState = {
    screen: 'login',
    sessionId: null,
    participantName: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    attempts: {},
    score: null,
    passed: false
};

// ==================== Login Screen ====================
const loginForm = document.getElementById('loginForm');
const nameInput = document.getElementById('nameInput');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();

    if (!name) {
        showError(loginError, 'Please enter your name');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            currentState.sessionId = data.sessionId;
            currentState.participantName = data.name;
            await loadQuizQuestions();
            showScreen('quiz');
            document.getElementById('participantName').textContent = data.name;
        } else {
            showError(loginError, data.error || 'Login failed');
        }
    } catch (error) {
        showError(loginError, 'Connection error. Please try again.');
        console.error('Login error:', error);
    }
});

// ==================== Quiz Screen ====================
async function loadQuizQuestions() {
    try {
        const response = await fetch(`${API_BASE}/quiz/questions`);
        const data = await response.json();
        currentState.questions = data.questions;
        displayQuestion();
    } catch (error) {
        console.error('Failed to load questions:', error);
        showError(document.getElementById('quizError'), 'Failed to load quiz questions');
    }
}

function displayQuestion() {
    const question = currentState.questions[currentState.currentQuestionIndex];
    if (!question) return;

    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const nextBtn = document.getElementById('nextBtn');

    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    feedbackContainer.classList.remove('show', 'feedback-correct', 'feedback-incorrect');
    nextBtn.disabled = true;

    // Display options
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.addEventListener('click', () => selectOption(index, question.id));
        optionsContainer.appendChild(optionDiv);
    });

    // Update progress
    const progress = ((currentState.currentQuestionIndex + 1) / currentState.questions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Question ${currentState.currentQuestionIndex + 1} of ${currentState.questions.length}`;
}

async function selectOption(optionIndex, questionId) {
    try {
        const response = await fetch(`${API_BASE}/quiz/submit-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentState.sessionId,
                questionId: questionId,
                selectedOptionIndex: optionIndex
            })
        });

        const data = await response.json();

        if (response.ok) {
            showFeedback(optionIndex, data.correct, data.correctAnswer, data.attempts, data.maxAttempts);
            
            if (data.correct) {
                currentState.answers[questionId] = {
                    selectedOptionIndex: optionIndex,
                    correct: true,
                    attempts: data.attempts
                };
                document.getElementById('nextBtn').disabled = false;
            } else if (data.attempts >= data.maxAttempts) {
                document.getElementById('nextBtn').disabled = false;
                document.getElementById('nextBtn').textContent = 'Skip to Next';
            }
        } else {
            showError(document.getElementById('quizError'), data.error || 'Failed to submit answer');
        }
    } catch (error) {
        console.error('Answer submission error:', error);
        showError(document.getElementById('quizError'), 'Connection error. Please try again.');
    }
}

function showFeedback(selectedIndex, isCorrect, correctAnswer, attempts, maxAttempts) {
    const options = document.querySelectorAll('.option');
    const feedbackContainer = document.getElementById('feedbackContainer');

    // Highlight selected option
    options[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

    // Show feedback message
    feedbackContainer.classList.add('show');
    feedbackContainer.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');

    if (isCorrect) {
        feedbackContainer.innerHTML = `<strong>✓ Correct!</strong><p>The answer is: ${correctAnswer}</p>`;
    } else {
        feedbackContainer.innerHTML = `
            <strong>✗ Incorrect</strong>
            <p>The correct answer is: ${correctAnswer}</p>
            <div class="attempt-info">Attempts used: ${attempts} of ${maxAttempts}</div>
        `;
    }
}

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentState.currentQuestionIndex < currentState.questions.length - 1) {
        currentState.currentQuestionIndex++;
        document.getElementById('nextBtn').textContent = 'Next Question';
        displayQuestion();
    } else {
        submitQuiz();
    }
});

document.getElementById('skipBtn').addEventListener('click', () => {
    if (currentState.currentQuestionIndex < currentState.questions.length - 1) {
        currentState.currentQuestionIndex++;
        document.getElementById('nextBtn').textContent = 'Next Question';
        displayQuestion();
    } else {
        submitQuiz();
    }
});

// ==================== Results Screen ====================
async function submitQuiz() {
    try {
        const response = await fetch(`${API_BASE}/results/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentState.sessionId,
                name: currentState.participantName,
                answers: currentState.answers
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentState.score = data.score;
            currentState.passed = data.passed;
            currentState.resultId = data.resultId;
            currentState.shareUrl = data.shareUrl;
            displayResults(data);
            showScreen('results');
        }
    } catch (error) {
        console.error('Quiz submission error:', error);
    }
}

function displayResults(data) {
    const resultTitle = document.getElementById('resultTitle');
    const scorePercentage = document.getElementById('scorePercentage');
    const scoreText = document.getElementById('scoreText');
    const detailedResults = document.getElementById('detailedResults');

    // Title and score
    resultTitle.textContent = data.passed ? '🎉 Congratulations!' : 'Quiz Complete';
    scorePercentage.textContent = `${data.score}%`;
    scoreText.textContent = `You got ${data.correctCount} out of ${data.totalQuestions} correct`;

    if (data.passed) {
        scorePercentage.parentElement.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    }

    // Detailed results
    detailedResults.innerHTML = '';
    data.detailedResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.correct ? 'passed' : 'failed'}`;
        resultItem.innerHTML = `
            <h4>Question ${result.questionId}: ${result.question}</h4>
            <p><strong>Your Answer:</strong> ${currentState.questions[result.questionId - 1]?.options[result.userAnswerIndex] || 'Not answered'}</p>
            <span class="result-badge ${result.correct ? 'badge-correct' : 'badge-incorrect'}">
                ${result.correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
            <div class="attempt-info">Attempts: ${result.attempts}</div>
        `;
        detailedResults.appendChild(resultItem);
    });
}

document.getElementById('shareBtn').addEventListener('click', () => {
    const shareContainer = document.getElementById('shareContainer');
    const shareUrl = document.getElementById('shareUrl');
    shareContainer.style.display = shareContainer.style.display === 'none' ? 'block' : 'none';
    if (currentState.shareUrl) {
        shareUrl.value = currentState.shareUrl;
    }
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    document.execCommand('copy');
    alert('Share URL copied to clipboard!');
});

document.getElementById('retakeBtn').addEventListener('click', () => {
    location.reload();
});

// ==================== Utility Functions ====================
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenName + 'Screen').classList.add('active');
    currentState.screen = screenName;
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}
