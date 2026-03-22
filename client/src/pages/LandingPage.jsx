import React from 'react';

export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="badge"><span className="badge-dot" />AI-Powered Interview Platform</div>
      <h1 className="hero-title">
        Ace Every<br />
        <span className="line2">Interview</span>
      </h1>
      <p className="hero-sub">
        Upload your resume. Pick your target role. Get personalized DSA, system design & HR questions — with AI evaluation and real-time feedback.
      </p>
      <div className="cta-row">
        <button className="btn-primary" onClick={onStart}>
          Start Preparation →
        </button>
        <button className="btn-secondary" onClick={onStart}>
          📄 Upload Resume
        </button>
      </div>
      <div className="features-grid">
        {[
          { icon: "🎯", title: "Resume Intelligence", desc: "Parses your skills & maps gaps to target role" },
          { icon: "🔁", title: "Adaptive Difficulty", desc: "Harder when you nail it, easier when you don't" },
          { icon: "🤖", title: "AI Evaluation", desc: "Code checked, answers scored, feedback given instantly" },
          { icon: "📉", title: "Weakness Detection", desc: "Tracks weak topics and suggests what to study next" },
          { icon: "⏱️", title: "Mock Mode", desc: "Real timer, real pressure, real interview simulation" },
        ].map(f => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
