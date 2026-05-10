import React, { useState, useEffect, useRef } from 'react';
import { evaluateAnswerAPI } from '../services/api';
import Editor from '@monaco-editor/react';

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
  // eslint-disable-next-line no-unused-vars
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [codeOutput, setCodeOutput] = useState("");
  const timerRef = useRef();
  // Use a ref to always have access to the latest results synchronously
  // (avoids stale closure when onFinish is called)
  const resultsRef = useRef([]);

  const q = questions[idx];
  const progress = (idx / questions.length) * 100;
  const isCode = q?.type === "DSA";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(120); setFeedback(null); setAnswer(""); setCodeOutput("");
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-lock: mark as skipped when timer runs out
          setResults(prev => {
            const current = questions[idx];
            if (!current) return prev;
            const alreadyAnswered = prev.some((_, i) => i === idx);
            if (alreadyAnswered) return prev;
            const skipped = { question: current.question, type: current.type, answer: "(time expired)", score: 0, verdict: "Skipped", feedback: "Time expired.", missing_concepts: [], improved_answer: current.ideal_answer };
            const updated = [...prev, skipped];
            resultsRef.current = updated;
            return updated;
          });
          setFeedback({ score: 0, verdict: "Skipped", feedback: "Time expired. You did not submit an answer in time.", missing_concepts: [], improved_answer: questions[idx]?.ideal_answer || "" });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, questions]);

  const runLocalCode = () => {
    if (!answer.trim()) return;
    setCodeOutput("Running...");
    const workerCode = `
      self.onmessage = function(e) {
        let output = "";
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ") + "\\n";
        };
        try {
          new Function(e.data)();
          self.postMessage({ success: true, output: output || "Executed successfully with no output." });
        } catch (err) {
          self.postMessage({ success: false, output: "Error: " + err.message });
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    const timeout = setTimeout(() => {
      worker.terminate();
      setCodeOutput("Error: Execution timed out (Possible infinite loop).");
    }, 3000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      setCodeOutput(e.data.output);
      worker.terminate();
    };

    worker.postMessage(answer);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const fb = await evaluateAnswerAPI(q.question, answer, q.ideal_answer, isCode, q.test_cases || []);
      const parsedFb = fb.data || fb;
      setFeedback(parsedFb);
      setResults(prev => {
        const updated = [...prev, { question: q.question, type: q.type, answer, ...parsedFb }];
        resultsRef.current = updated;
        return updated;
      });
    } catch {
      const fb = { score: 0, verdict: "Incorrect", feedback: "Could not reach the evaluation server. Please check your connection and try again.", missing_concepts: [], improved_answer: q.ideal_answer };
      setFeedback(fb);
      setResults(prev => {
        const updated = [...prev, { question: q.question, type: q.type, answer, ...fb }];
        resultsRef.current = updated;
        return updated;
      });
    }
    setLoading(false);
  };

  const nextQ = () => {
    if (idx + 1 >= questions.length) {
      onFinish(resultsRef.current);
    } else {
      setIdx(i => i + 1);
    }
  };

  const skip = () => {
    const skipped = { question: q.question, type: q.type, answer: "(skipped)", score: 0, verdict: "Skipped", feedback: "Skipped.", missing_concepts: [], improved_answer: q.ideal_answer };
    setResults(prev => {
      const updated = [...prev, skipped];
      resultsRef.current = updated;
      return updated;
    });
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={answer}
                onChange={val => setAnswer(val || "")}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-secondary" onClick={runLocalCode} disabled={!!feedback || loading} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)' }}>
                ▶ Run Code (JS)
              </button>
            </div>
            {codeOutput && (
              <div style={{ background: '#1e1e1e', color: '#00ff96', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                {codeOutput}
              </div>
            )}
          </div>
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
