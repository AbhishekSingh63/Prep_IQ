const BASE_URL = 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/interview`;

export const parseResumeAPI = async (text) => {
  const res = await fetch(`${API_URL}/parse-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to parse resume');
  return res.json();
};

export const analyzeGapAPI = async (skills, role) => {
  const res = await fetch(`${API_URL}/analyze-gap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, role })
  });
  if (!res.ok) throw new Error('Failed to analyze gap');
  return res.json();
};

export const generateQuestionsAPI = async (skills, role, difficulty, company) => {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, role, difficulty, company })
  });
  if (!res.ok) throw new Error('Failed to generate questions');
  return res.json();
};

export const evaluateAnswerAPI = async (question, answer, idealAnswer) => {
  const res = await fetch(`${API_URL}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, idealAnswer })
  });
  if (!res.ok) throw new Error('Failed to evaluate answer');
  return res.json();
};

export const saveHistoryAPI = async (token, historyData) => {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(historyData)
  });
  if (!res.ok) throw new Error('Failed to save history');
  return res.json();
};

export const getHistoryAPI = async (token) => {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
};
