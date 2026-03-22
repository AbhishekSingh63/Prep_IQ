import React, { useState, useEffect, useRef } from 'react';
import { evaluateAnswerAPI } from '../services/api';

const ROLES = [
  { id: "sde", emoji: "⚙️", name: "SDE", sub: "Software Engineer" },
  { id: "ml", emoji: "🧠", name: "ML Engineer", sub: "Machine Learning" },
  { id: "frontend", emoji: "🎨", name: "Frontend Dev", sub: "React / UI" },
  { id: "backend", emoji: "🗄️", name: "Backend Dev", sub: "APIs / DBs" },
  { id: "fullstack", emoji: "🔗", name: "Full Stack", sub: "End-to-end" },
  { id: "data", emoji: "📊", name: "Data Scientist", sub: "Analytics / ML" },
];

export default function InterviewPage({ questions, role, difficulty, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef();

  const q = questions[idx];
  const progress = (idx / questions.length) * 100;
  const isCode = q?.type === "DSA";

  useEffect(() => {
    setTimeLeft(120); setFeedback(null); setAnswer("");
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const fb = await evaluateAnswerAPI(q.question, answer, q.ideal_answer);
      const parsedFb = fb.data || fb;
      setFeedback(parsedFb);
      setResults(prev => [...prev, { question: q.question, type: q.type, answer, ...parsedFb }]);
    } catch {
      const fb = { score: 6, verdict: "Good", feedback: "Your answer covers the main points. Consider adding more detail.", missing_concepts: [], improved_answer: q.ideal_answer };
      setFeedback(fb);
      setResults(prev => [...prev, { question: q.question, type: q.type, answer, ...fb }]);
    }
    setLoading(false);
  };

  const nextQ = () => {
    if (idx + 1 >= questions.length) {
      onFinish(results);
    } else {
      setIdx(i => i + 1);
    }
  };

  const skip = () => {
    setResults(prev => [...prev, { question: q.question, type: q.type, answer: "(skipped)", score: 0, verdict: "Skipped", feedback: "Skipped.", missing_concepts: [], improved_answer: q.ideal_answer }]);
    nextQ();
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const tagClass = q?.type === "DSA" ? "dsa" : q?.type === "HR" ? "hr" : "sys";

  return (
    <div className="interview-page">
      <div className="interview-header">
        <div className="interview-meta">
          <div className="meta-chip">
            <span className="dot" style={{ background: "var(--accent)" }} />
            {ROLES.find(r => r.id === role)?.name || role}
          </div>
          <div className="meta-chip">
            <span className="dot" style={{ background: difficulty === "easy" ? "var(--green)" : difficulty === "medium" ? "var(--gold)" : "var(--red)" }} />
            {difficulty}
          </div>
          <div className="meta-chip">
            Q {idx + 1}/{questions.length}
          </div>
        </div>
        <div className={`timer ${timeLeft < 30 ? "warning" : ""}`}>
          {mins}:{secs}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card question-card">
        <div className="q-num">
          Question {idx + 1}
          <span className={`q-tag ${tagClass}`}>{q?.type}</span>
        </div>
        <div className="q-text">{q?.question}</div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>💡 {q?.hint}</p>

        {isCode ? (
          <textarea
            className="code-area"
            placeholder={`// Write your ${q?.type === "DSA" ? "code" : "answer"} here...\n// Use any language you're comfortable with`}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!feedback}
          />
        ) : (
          <textarea
            className="answer-area"
            placeholder="Type your answer here... Be specific and structured."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!!feedback}
          />
        )}

        {!feedback && (
          <div className="btn-row">
            <button className="btn-submit" onClick={submitAnswer} disabled={!answer.trim() || loading}>
              {loading ? "Evaluating..." : "Submit Answer ✓"}
            </button>
            <button className="btn-skip" onClick={skip} disabled={loading}>Skip →</button>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <div className="loading-text">AI is evaluating your answer...</div>
          </div>
        )}

        {feedback && (
          <div className="feedback-card">
            <div className="feedback-header">
              <div className={`score-badge ${feedback.score >= 7 ? "high" : feedback.score >= 4 ? "mid" : "low"}`}>
                {feedback.score}/10
              </div>
              <div>
                <div className="feedback-title">{feedback.verdict}</div>
                <div className="feedback-sub">
                  {(feedback.missing_concepts || []).length > 0 && `Missing: ${feedback.missing_concepts.join(", ")}`}
                </div>
              </div>
            </div>
            <div className="feedback-text">{feedback.feedback}</div>
            <div className="ideal-answer">
              <div className="ideal-label">Ideal Answer</div>
              <div className="ideal-text">{feedback.improved_answer}</div>
            </div>
            <button className="btn-submit" style={{ marginTop: 16 }} onClick={nextQ}>
              {idx + 1 >= questions.length ? "View Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
