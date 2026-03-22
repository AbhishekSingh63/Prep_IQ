import React from 'react';
import { Target, TrendingUp, Award, Calendar } from 'lucide-react';
import Card from '../components/Card';
import './Dashboard.css';

const MOCK_STATS = [
  { id: 1, role: 'Senior Frontend Engineer', company: 'Google', date: 'Oct 15, 2026', _score: 8.5 },
  { id: 2, role: 'Full Stack Developer', company: 'Stripe', date: 'Oct 10, 2026', _score: 7.2 },
  { id: 3, role: 'React Developer', company: 'Startup', date: 'Oct 02, 2026', _score: 6.8 },
];

const Dashboard = ({ onBack }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="text-gradient">Performance Overview</h2>
        <p>Track your progress and identify areas for improvement.</p>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon"><Target color="#00d2ff" size={28} /></div>
          <div className="stat-value">3</div>
          <div className="stat-label">Interviews Completed</div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon"><TrendingUp color="#00ff96" size={28} /></div>
          <div className="stat-value">7.5</div>
          <div className="stat-label">Average Score</div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon"><Award color="#ffa500" size={28} /></div>
          <div className="stat-value">Senior</div>
          <div className="stat-label">Current Level</div>
        </div>
      </div>

      <h3 className="history-title">Recent Sessions</h3>
      <div className="history-list">
        {MOCK_STATS.map(stat => (
          <div key={stat.id} className="history-item glass-panel">
            <div className="history-info">
              <h4>{stat.role}</h4>
              <p className="history-company">{stat.company}</p>
            </div>
            <div className="history-meta">
              <span className="history-date"><Calendar size={14} /> {stat.date}</span>
              <span className="history-score" style={{ 
                color: stat._score >= 8 ? '#00ff96' : stat._score >= 7 ? '#00d2ff' : '#ffa500' 
              }}>
                {stat._score}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
