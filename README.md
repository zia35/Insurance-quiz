# Insurance Quiz Portal

An interactive quiz application for participants to test their knowledge of insurance concepts. Features participant login, multi-attempt questions, automatic scoring, and results sharing.

## Features

✅ **Participant Login** - Simple name-based login system  
✅ **Interactive Quiz** - 5 insurance knowledge questions  
✅ **4 Attempts Per Question** - Participants get 4 chances to answer each question  
✅ **Real-time Feedback** - Instant feedback on correct/incorrect answers  
✅ **Automatic Scoring** - Calculates score with 85% passing threshold  
✅ **Detailed Results** - Shows all answers with attempt counts  
✅ **Results Sharing** - Generate shareable URLs for quiz results  
✅ **Responsive Design** - Works on desktop and mobile devices  

## Project Structure

```
.
├── server.js                 # Express server entry point
├── package.json             # Project dependencies
├── .env                     # Environment configuration
├── routes/
│   ├── auth.js             # Login endpoint
│   ├── quiz.js             # Quiz questions and answer submission
│   └── results.js          # Results calculation and sharing
└── public/
    ├── index.html          # Main HTML page
    ├── app.js              # Frontend application logic
    └── styles.css          # Styling
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zia35/Insurance-quiz.git
cd Insurance-quiz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file (already included):
```bash
PORT=5000
NODE_ENV=development
PASSING_SCORE=85
MAX_ATTEMPTS=4
```

### Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:5000`

## Usage

### 1. Login
- Enter your full name and click "Start Quiz"
- A unique session ID is created for you

### 2. Take the Quiz
- Read each question carefully
- Select your answer from the options
- Get immediate feedback (correct/incorrect)
- You have 4 attempts per question
- Click "Next Question" to proceed to the next question
- Use "Skip Question" to move forward without answering

### 3. View Results
- After completing all questions, your score is automatically calculated
- Results show:
  - Overall percentage score
  - Pass/Fail status (85% required to pass)
  - Detailed breakdown of each question
  - Number of attempts used

### 4. Share Results
- Click "Share Results" to generate a shareable URL
- Copy the link and send to others
- Others can view your results without taking the quiz

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with participant name
- `GET /api/auth/session/:sessionId` - Verify session

### Quiz
- `GET /api/quiz/questions` - Get all quiz questions
- `POST /api/quiz/submit-answer` - Submit an answer
- `GET /api/quiz/progress/:sessionId` - Get quiz progress

### Results
- `POST /api/results/submit` - Submit completed quiz
- `GET /api/results/:resultId` - Retrieve results
- `POST /api/results/share` - Generate share link

## Configuration

Edit `.env` to customize:
- `PORT` - Server port (default: 5000)
- `PASSING_SCORE` - Required percentage to pass (default: 85)
- `MAX_ATTEMPTS` - Number of attempts per question (default: 4)

## Questions Included

1. What is the primary purpose of health insurance?
2. What does 'deductible' mean in insurance?
3. What is a 'premium'?
4. What does 'co-insurance' refer to?
5. What is a 'copay'?

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Admin panel for question management
- [ ] Time-based quiz sessions
- [ ] Email notifications for results
- [ ] Analytics and reporting
- [ ] Multiple quiz categories
- [ ] Leaderboard system
- [ ] Question randomization

## License

MIT License

## Support

For issues or questions, please open a GitHub issue.
