import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHistoryAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ROLES = [
  { id: "sde", emoji: "⚙️", name: "SDE", sub: "Software Engineer" },
  { id: "ml", emoji: "🧠", name: "ML Engineer", sub: "Machine Learning" },
  { id: "frontend", emoji: "🎨", name: "Frontend Dev", sub: "React / UI" },
  { id: "backend", emoji: "🗄️", name: "Backend Dev", sub: "APIs / DBs" },
  { id: "fullstack", emoji: "🔗", name: "Full Stack", sub: "End-to-end" },
  { id: "data", emoji: "📊", name: "Data Scientist", sub: "Analytics / ML" },
];

export default function DashboardPage({ results, role, onRestart }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.token) {
      getHistoryAPI(user.token).then(setHistory).catch(console.error);
    }
  }, [user]);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length) : 0;
  const correct = results.filter(r => r.score >= 7).length;
  const skipped = results.filter(r => r.verdict === "Skipped").length;

  const conceptFreq = {};
  results.forEach(r => (r.missing_concepts || []).forEach(c => { conceptFreq[c] = (conceptFreq[c] || 0) + 1; }));
  const weaknesses = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const typeBreakdown = ["DSA", "System Design", "HR"].map(t => ({
    type: t,
    count: results.filter(r => r.type === t).length,
    avg: Math.round(results.filter(r => r.type === t).reduce((s, r) => s + (r.score || 0), 0) / Math.max(results.filter(r => r.type === t).length, 1)),
  }));

  const chartData = history.slice().reverse().map((h, i) => {
    const hAvg = h.results?.length ? Math.round(h.results.reduce((s, r) => s + (r.score || 0), 0) / h.results.length) : 0;
    return {
      name: `Attempt ${i + 1}`,
      date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: hAvg,
      topic: h.role,
    };
  });

  return (
    <div className="dash-page">
      <style>{`
        @media print {
          .nav, .btn-restart, .print-hide, .history-section { display: none !important; }
          .dash-page { margin: 0; padding: 0; max-width: 100%; }
          body { background: white !important; -webkit-print-color-adjust: exact; color: black; }
          .stat-card, .weakness-card { break-inside: avoid; border: 1px solid #ccc; background: #fff !important; }
        }
      `}</style>
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="dash-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome, {user?.name} 👋</div>
          <div className="dash-sub">Recent Interview: {ROLES.find(r => r.id === role)?.name || role} · {results.length} questions</div>
        </div>
        <button className="btn-primary print-hide" onClick={() => window.print()} style={{ padding: '8px 16px', fontSize: '14px' }}>
          📥 Download PDF Report
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Overall Score</div>
          <div className={`stat-value ${avg >= 7 ? "green" : avg >= 4 ? "gold" : "accent"}`}>{avg}<span style={{ fontSize: 16 }}>/10</span></div>
          <div className="stat-trend">{avg >= 7 ? "Excellent performance 🎉" : avg >= 4 ? "Room to improve" : "Keep practicing"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Correct Answers</div>
          <div className="stat-value green">{correct}<span style={{ fontSize: 16 }}>/{results.length}</span></div>
          <div className="stat-trend">{Math.round((correct / Math.max(results.length, 1)) * 100)}% success rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Questions Done</div>
          <div className="stat-value accent">{results.length - skipped}</div>
          <div className="stat-trend">{skipped} skipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Category</div>
          <div className="stat-value gold" style={{ fontSize: 20, paddingTop: 8 }}>
            {typeBreakdown.sort((a, b) => b.avg - a.avg)[0]?.type || "—"}
          </div>
          <div className="stat-trend">avg {typeBreakdown.sort((a, b) => b.avg - a.avg)[0]?.avg || 0}/10</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-section" style={{ marginTop: '40px', marginBottom: '20px', background: 'var(--surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>Progress Over Time</h3>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--border2)" tick={{fill: 'var(--text3)', fontSize: 13, fontWeight: 600}} />
                <YAxis dataKey="score" stroke="var(--border2)" domain={[0, 10]} tick={{fill: 'var(--text3)', fontSize: 13, fontWeight: 600}} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div className="weakness-card">
          <div className="weakness-title">⚠️ Weak Areas — Study These</div>
          <div className="weakness-grid">
            {weaknesses.map(([concept, freq]) => (
              <div className="weakness-item" key={concept}>
                <span style={{ fontSize: 11, color: "var(--red)" }}>{concept}</span>
                <div className="weakness-bar">
                  <div className="weakness-fill" style={{ width: `${(freq / results.length) * 100}%` }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text3)", minWidth: 20 }}>{freq}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-divider" />

      <div style={{ marginBottom: 20, fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>Question-by-Question Review</div>
      <div className="results-list">
        {results.map((r, i) => (
          <div className="result-row" key={i}>
            <div className={`result-score ${r.score >= 7 ? "high" : r.score >= 4 ? "mid" : "low"} score-badge`}>
              {r.verdict === "Skipped" ? "—" : `${r.score}`}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.type}</div>
              <div className="result-q">{r.question.length > 80 ? r.question.slice(0, 80) + "..." : r.question}</div>
            </div>
            <div className="result-feedback">{r.feedback}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button className="btn-restart print-hide" onClick={onRestart}>
          🔄 Start New Interview Session
        </button>
      </div>

      {history.length > 0 && (
        <div className="history-section" style={{ marginTop: 60, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
          <h3 style={{ marginBottom: 16 }}>Past Interviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((h, idx) => {
              const hAvg = h.results?.length ? Math.round(h.results.reduce((s, r) => s + (r.score || 0), 0) / h.results.length) : 0;
              return (
                <div key={idx} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{h.role}</strong> {h.company ? `at ${h.company}` : ''}
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(h.createdAt).toLocaleDateString()} · {h.difficulty}</div>
                  </div>
                  <div className={`score-badge ${hAvg >= 7 ? "high" : hAvg >= 4 ? "mid" : "low"}`}>{hAvg}/10</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
