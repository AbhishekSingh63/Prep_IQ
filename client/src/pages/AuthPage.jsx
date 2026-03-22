import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let result;
    if (isLogin) {
      result = await login(email, password, rememberMe);
    } else {
      result = await register(name, email, password, rememberMe);
    }
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container action-card fade-in" style={{ maxWidth: '400px', margin: '40px auto', padding: '40px', borderRadius: '24px', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontFamily: 'Syne', textAlign: 'center', marginBottom: '8px', fontSize: '28px', fontWeight: '800' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text3)', marginBottom: '32px', fontSize: '14px', fontWeight: '500' }}>
        {isLogin ? 'Login to continue your preparation' : 'Sign up to track your progress'}
      </p>
      
      {error && <div className="error-message" style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', border: '1px solid #fecaca', fontWeight: '600' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!isLogin && (
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text2)', fontWeight: '700' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
        )}
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text2)', fontWeight: '700' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
        </div>
        <div className="form-group" style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text2)', fontWeight: '700' }}>Password</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', boxSizing: 'border-box', paddingRight: '48px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        {isLogin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-4px' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'var(--text2)', cursor: 'pointer', fontWeight: '500' }}>Remember Me</label>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px', padding: '16px', borderRadius: '12px', width: '100%', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center' }}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <p className="toggle-text" style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text3)', fontWeight: '500' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => { setIsLogin(!isLogin); setError(''); }} className="toggle-link" style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '700' }}>
          {isLogin ? 'Sign up' : 'Login'}
        </span>
      </p>
    </div>
  );
}
