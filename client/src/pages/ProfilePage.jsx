import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Target, Award, LogOut, Clock, ChevronRight } from 'lucide-react';
import { getHistoryAPI } from '../services/api';

export default function ProfilePage({ onHome }) {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://prep-iq-backend.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch profile. Session may have expired.');
        }
        const data = await res.json();
        setProfileData(data);

        try {
          const hist = await getHistoryAPI(user.token);
          setHistory(hist || []);
        } catch (e) {
          console.error("Failed to fetch history", e);
          setHistory([]);
        }
      } catch (err) {
        console.error("Profile load error", err);
        logout();
        onHome();
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text)' }}>Loading profile...</div>;
  if (!profileData) return <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--red)' }}>Error loading profile</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: 'var(--text)' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
          {profileData.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontFamily: 'Syne, sans-serif' }}>{profileData.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text3)', marginTop: '4px', fontSize: '14px' }}>
            <Mail size={14} /> {profileData.email}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <Calendar size={16} /> Joined
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <Target size={16} /> Questions Attempted
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
            {profileData.totalQuestionsAttempted || 0}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <Award size={16} /> Avg Accuracy
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)' }}>
            {profileData.accuracy || 0}%
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-section" style={{ marginBottom: '40px', padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
            <Clock size={20} color="var(--accent)" /> Past Interviews & Performance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history.map((h, idx) => {
              const hAvg = h.results?.length ? Math.round(h.results.reduce((s, r) => s + (r.score || 0), 0) / h.results.length) : 0;
              return (
                <div key={idx} className="fade-in" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', cursor: 'default' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{h.role} {h.company ? `at ${h.company}` : ''}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <Calendar size={12} /> {new Date(h.createdAt).toLocaleDateString()}
                      <span style={{ color: 'var(--text2)', padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Score</div>
                      <div className={`score-badge ${hAvg >= 7 ? "high" : hAvg >= 4 ? "mid" : "low"}`} style={{ marginTop: '6px', fontSize: '14px', padding: '4px 8px', width: 'auto', height: 'auto', borderRadius: '8px' }}>{hAvg}/10</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => { logout(); onHome(); }}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)' }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
