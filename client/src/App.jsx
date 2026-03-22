import React, { useState } from 'react';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import RolePage from './pages/RolePage';
import InterviewPage from './pages/InterviewPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import { saveHistoryAPI } from './services/api';

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const { user } = useAuth();

  const goHome = () => { setScreen("landing"); setStep(0); };

  const handleResumeNext = (data, rawText) => {
    setResumeData(data);
    setScreen("role");
    setStep(1);
  };

  const handleRoleNext = (r, diff, qs, gap, comp) => {
    setRole(r); setDifficulty(diff); setQuestions(qs); setGapAnalysis(gap); setCompany(comp);
    setScreen("interview"); setStep(2);
  };

  const handleFinish = async (res) => {
    setResults(res); setScreen("dashboard"); setStep(3);
    
    if (user && user.token) {
      try {
        await saveHistoryAPI(user.token, {
          role, company, difficulty, questions, results: res, gapAnalysis
        });
      } catch(err) { console.error("Could not save history", err); }
    }
  };

  const handleRestart = () => {
    setScreen("landing"); setStep(0);
    setResumeData(null); setRole(""); setQuestions([]); setResults([]);
  };

  return (
    <div className="app">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <NavBar step={step} onHome={goHome} onProfile={() => setScreen("profile")} onAuth={() => setScreen("auth")} />
      <div className="page">
        {screen === "landing" && <LandingPage onStart={() => { if (user) { setScreen("upload"); setStep(0); } else { setScreen("auth"); setStep(0); } }} />}
        {screen === "auth" && <AuthPage onLoginSuccess={() => { setScreen("upload"); setStep(0); }} />}
        {screen === "upload" && user && <UploadPage onNext={handleResumeNext} />}
        {screen === "role" && resumeData && <RolePage resumeData={resumeData} onNext={handleRoleNext} />}
        {screen === "interview" && questions.length > 0 && (
          <InterviewPage questions={questions} role={role} difficulty={difficulty} onFinish={handleFinish} />
        )}
        {screen === "dashboard" && user && <DashboardPage results={results} role={role} onRestart={handleRestart} />}
        {screen === "profile" && user && <ProfilePage onHome={goHome} />}
      </div>
    </div>
  );
}
