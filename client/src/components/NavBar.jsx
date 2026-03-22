import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';

const STEPS = ["Upload", "Role", "Interview", "Results"];

export default function NavBar({ step, onHome, onProfile, onAuth }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={onHome} style={{ cursor: 'pointer' }}>
        <div className="logo-dot" />
        <span>Prep</span>IQ
      </div>
      <div className="nav-steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}
            title={s}
          />
        ))}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text3)", display: "flex", gap: "10px", alignItems: "center" }}>
        {step < STEPS.length ? STEPS[step] : "Complete"}
        {user ? (
          <div style={{ position: 'relative', marginLeft: '10px' }}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
              <User size={14} color="var(--accent)" />
              {user.name}
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <button onClick={() => { onProfile && onProfile(); setMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text)', padding: '10px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }} onMouseOver={e => e.currentTarget.style.background='var(--surface2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <User size={14} color="var(--accent)" /> Profile
                </button>
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                <button onClick={() => { logout(); setMenuOpen(false); onHome(); }} style={{ background: 'transparent', border: 'none', color: 'var(--red)', padding: '10px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }} onMouseOver={e => e.currentTarget.style.background='var(--surface2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onAuth}
            style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', marginLeft: '10px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
            <User size={14} /> Login / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}
