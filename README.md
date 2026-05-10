# 🧠 Prep IQ — AI-Powered Interview Simulator

> An adaptive, full-stack mock interview platform that turns your resume into a personalized interview experience — powered by Claude 3.5 Sonnet.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square&logo=react)
![AI](https://img.shields.io/badge/AI-Claude%203.5%20Sonnet-blueviolet?style=flat-square)
![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2019-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)

---

## ✨ Features

- **📄 Resume Parsing** — Upload your resume (PDF/text); Claude extracts your skills, experience level, and projects automatically.
- **🎯 Role & Company Targeting** — Select a target role (SDE, ML Engineer, Frontend, Backend, Full Stack, Data Scientist) and optionally specify a company to mimic its specific interview style (e.g., Amazon's leadership principles, Google's system design focus).
- **🤖 AI-Generated Questions** — Generates 6 tailored questions per session: 3 DSA/Coding, 2 System Design, and 1 HR — calibrated to your skills and chosen difficulty.
- **⌨️ In-Browser Monaco IDE** — DSA questions are answered inside an embedded Monaco Editor (VS Code's engine) with JavaScript execution via sandboxed Web Workers, complete with a 3-second timeout to prevent infinite loops.
- **⏱️ Per-Question Timer** — A 2-minute countdown per question. Time expiry auto-locks the answer and marks it as skipped.
- **🔍 AI Evaluation & Feedback** — Each answer is evaluated by Claude for score (0–10), verdict, missing concepts, and a model ideal answer. DSA answers are rigorously dry-run against test cases.
- **📊 Results Dashboard** — Session-end analytics with per-question breakdowns, overall score, and skill gap analysis.
- **📈 Skill Gap Analysis** — Before the interview, Claude identifies your strong skills vs. skills missing for your target role, with a recommendation.
- **🔐 Authentication** — JWT-based signup/login with bcrypt password hashing. Interview history is persisted per user.
- **📜 Interview History** — Logged-in users can review past sessions from their Profile page.

---

## 🏗️ Architecture

```
prep-iq/
├── client/                  # React 19 + Vite frontend
│   └── src/
│       ├── pages/           # LandingPage, AuthPage, UploadPage, RolePage,
│       │                    # InterviewPage, DashboardPage, ProfilePage
│       ├── components/      # NavBar, Button, Card
│       ├── context/         # AuthContext (JWT state management)
│       └── services/        # api.js (Axios API calls)
│
└── server/                  # Node.js + Express 5 backend
    ├── routes/              # authRoutes, interviewRoutes, historyRoutes, userRoutes
    ├── models/              # User.js, History.js (Mongoose schemas)
    ├── services/            # aiService.js (Claude API integration)
    ├── middleware/          # JWT auth guard, error handling
    └── server.js            # Entry point, CORS, MongoDB connection
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Recharts |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Styling | Vanilla CSS (glassmorphic dark theme) |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose 9 |
| AI | Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`) |
| Auth | JWT + bcryptjs |
| File Uploads | Multer |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prep-iq.git
cd prep-iq
```

### 2. Configure the server environment

Create a `.env` file inside the `server/` directory using the provided template:

```bash
cp server/.env.example server/.env
```

Then fill in your values:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/prep_ai
JWT_SECRET=your_strong_random_secret_here
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000                        # Optional, defaults to 5000
CLIENT_URL=http://localhost:5173  # Optional, for custom CORS origins
```

> **Note:** The server falls back to mock responses when `ANTHROPIC_API_KEY` is not set — useful for UI development without burning API credits.

### 3. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 4. Run the application

In one terminal, start the **backend**:

```bash
cd server
npm start          # Production: node server.js
# or
npm run dev        # Development: node --watch server.js (auto-restarts)
```

In another terminal, start the **frontend**:

```bash
cd client
npm run dev        # Starts Vite dev server at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create a new user account |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `POST` | `/api/interview/parse-resume` | Yes | Parse uploaded resume via Claude |
| `POST` | `/api/interview/generate` | Yes | Generate interview questions |
| `POST` | `/api/interview/evaluate` | Yes | Evaluate a single answer |
| `POST` | `/api/interview/gap-analysis` | Yes | Run skill gap analysis |
| `GET` | `/api/history` | Yes | Fetch user's past sessions |
| `POST` | `/api/history` | Yes | Save a completed session |
| `GET` | `/api/user/profile` | Yes | Get current user profile |
| `PUT` | `/api/user/profile` | Yes | Update user profile |

> Protected routes require an `Authorization: Bearer <token>` header.

---

## 🛡️ Security Notes

- Passwords are hashed with **bcryptjs** before storage — never stored in plaintext.
- JWT tokens are verified server-side on every protected route.
- CORS is locked to a whitelist of known origins (`localhost:5173`, `localhost:3000`, and `CLIENT_URL`).
- DSA code submitted by users is executed inside a **sandboxed Web Worker** with a 3-second hard timeout — user code never touches the server.
- Claude prompts include explicit **prompt injection guards** in the system message to prevent evaluation manipulation.

---

## 🗺️ User Flow

```
Landing Page → Auth (Sign Up / Login)
    → Upload Resume (PDF / paste text)
        → Role & Company Selection + Difficulty
            → [Claude] Gap Analysis + Question Generation
                → Interview Session (6 Questions, 2-min timer each)
                    → [Monaco IDE for DSA | Textarea for others]
                        → [Claude] Real-time Evaluation per Answer
                            → Results Dashboard → Profile / History
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

ISC © Prep IQ Contributors
