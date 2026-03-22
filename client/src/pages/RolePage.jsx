import React, { useState } from 'react';
import { analyzeGapAPI, generateQuestionsAPI } from '../services/api';

const ROLES = [
  { id: "sde", emoji: "⚙️", name: "SDE", sub: "Software Engineer" },
  { id: "ml", emoji: "🧠", name: "ML Engineer", sub: "Machine Learning" },
  { id: "frontend", emoji: "🎨", name: "Frontend Dev", sub: "React / UI" },
  { id: "backend", emoji: "🗄️", name: "Backend Dev", sub: "APIs / DBs" },
  { id: "fullstack", emoji: "🔗", name: "Full Stack", sub: "End-to-end" },
  { id: "data", emoji: "📊", name: "Data Scientist", sub: "Analytics / ML" },
];

export default function RolePage({ resumeData, onNext }) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState(null);

  const analyzeGap = async (selectedRole) => {
    setRole(selectedRole);
    setLoading(true);
    try {
      const gap = await analyzeGapAPI(resumeData.skills || [], selectedRole);
      setGapAnalysis(gap.data || gap);
    } catch {
      setGapAnalysis({ strong_skills: resumeData.skills?.slice(0, 3) || [], weak_skills: ["System Design", "DSA"], recommendation: "Focus on DSA and system design fundamentals." });
    }
    setLoading(false);
  };

  const generateQuestions = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const questions = await generateQuestionsAPI(resumeData.skills || [], role, difficulty, company);
      onNext(role, difficulty, questions.data || questions, gapAnalysis, company);
    } catch (err) {
      console.error(err);
      const fallback = [
        { id: 1, type: "DSA", question: "Implement a function to find two numbers in an array that sum to a target value.", hint: "Think about hash maps for O(n) complexity.", ideal_answer: "Use a hash map to store visited numbers." },
        { id: 4, type: "System Design", question: "Design a URL shortener like bit.ly. Discuss API, database, and scalability.", hint: "Think about base62 encoding, caching, and load distribution.", ideal_answer: "Use base62 encoding for short keys, store in a distributed DB (Cassandra)." },
        { id: 6, type: "HR", question: "Tell me about a time you disagreed with a technical decision. How did you handle it?", hint: "Use STAR format. Show communication and adaptability.", ideal_answer: "Describe the situation, your concern, how you communicated it constructively, listened to others, and the outcome." },
      ];
      onNext(role, difficulty, fallback, gapAnalysis, company);
    }
    setLoading(false);
  };

  return (
    <div className="role-page">
      <div className="role-container">
        <div className="card">
          <div className="card-title">Select Target Role</div>
          <div className="card-sub">
            {resumeData.name && `Hey ${resumeData.name} · `}
            {resumeData.skills?.length} skills detected · {resumeData.experience_years}y experience
          </div>

          <div className="section-label">Target Role</div>
          <div className="role-grid">
            {ROLES.map(r => (
              <div
                key={r.id}
                className={`role-card ${role === r.id ? "selected" : ""}`}
                onClick={() => analyzeGap(r.id)}
              >
                <div className="role-emoji">{r.emoji}</div>
                <div className="role-name">{r.name}</div>
                <div className="role-sub">{r.sub}</div>
              </div>
            ))}
          </div>

          {loading && !gapAnalysis && (
            <div className="loading"><div className="spinner" /><div className="loading-text">Mapping skill gaps...</div></div>
          )}

          {gapAnalysis && (
            <div className="gap-card" style={{ marginTop: 8 }}>
              <div className="gap-title">⚡ Skill Gap Analysis</div>
              <div className="gap-chips">
                {(gapAnalysis.strong_skills || []).map(s => <span key={s} className="gap-chip strong">✓ {s}</span>)}
                {(gapAnalysis.weak_skills || []).map(s => <span key={s} className="gap-chip weak">↑ {s}</span>)}
              </div>
              {gapAnalysis.recommendation && (
                <p style={{ marginTop: 12, fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
                  💡 {gapAnalysis.recommendation}
                </p>
              )}
            </div>
          )}

          <div className="section-label" style={{ marginTop: 20 }}>Difficulty Level</div>
          <div className="difficulty-row">
            {["easy", "medium", "hard"].map(d => (
              <button key={d} className={`diff-btn ${d} ${difficulty === d ? "selected" : ""}`} onClick={() => setDifficulty(d)}>
                {d === "easy" ? "🟢 Easy" : d === "medium" ? "🟡 Medium" : "🔴 Hard"}
              </button>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: 20 }}>Target Company (Optional)</div>
          <div style={{ padding: "0 8px 16px" }}>
            <input 
              type="text" 
              placeholder="e.g. Google, Amazon, Meta, Startup" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: "14px"
              }}
            />
          </div>

          {loading && gapAnalysis ? (
            <div className="loading"><div className="spinner" /><div className="loading-text">Generating your personalized questions...</div></div>
          ) : (
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={generateQuestions}
              disabled={!role || loading}
            >
              Generate Interview Questions →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
