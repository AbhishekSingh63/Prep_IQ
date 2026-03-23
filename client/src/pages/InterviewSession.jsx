import React, { useState, useMemo } from 'react';
import { Terminal, Users, Cpu, Send, CheckCircle } from 'lucide-react';
import './InterviewSession.css';

const InterviewSession = ({ questions, sessionData }) => {
  const [activeQuestionId, setActiveQuestionId] = useState(questions?.technical[0]?.id);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Flatten all questions into a single array for easier navigation
  const allQuestions = useMemo(() => {
    if (!questions) return [];
    return [
      ...questions.technical.map(q => ({ ...q, category: 'Technical', icon: <Cpu size={14} /> })),
      ...questions.hr.map(q => ({ ...q, category: 'HR', icon: <Users size={14} /> })),
      ...questions.coding.map(q => ({ ...q, category: 'Coding', icon: <Terminal size={14} /> }))
    ];
  }, [questions]);

  const activeQuestion = allQuestions.find(q => q.id === activeQuestionId);

  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [activeQuestionId]: e.target.value
    });
  };

  const submitAnswer = async () => {
    if (!answers[activeQuestionId]) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('https://prep-iq-backend.onrender.com/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: activeQuestionId,
          answer: answers[activeQuestionId]
        })
      });
      const result = await response.json();
      setEvaluations({
        ...evaluations,
        [activeQuestionId]: result.data
      });
    } catch (error) {
      console.error('Failed to evaluate:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!questions) return <div>No questions loaded.</div>;

  return (
    <div className="interview-container">
      {/* Sidebar for Navigation */}
      <div className="interview-sidebar">
        <div className="sidebar-header">
          <h3>Interview Plan</h3>
          <p>{allQuestions.length} Questions Generated</p>
        </div>
        <div className="question-list">
          {allQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`question-item ${activeQuestionId === q.id ? 'active' : ''}`}
              onClick={() => setActiveQuestionId(q.id)}
            >
              <div className="question-type-icon">
                {q.icon}
              </div>
              <div className="question-item-title">
                {q.type === 'coding' ? q.title : `Question ${idx + 1}`}
              </div>
              {evaluations[q.id] && <CheckCircle size={16} color="#00ff96" style={{ marginLeft: 'auto' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="interview-main">
        {activeQuestion && (
          <div className="question-display">
            <span className={`question-badge badge-${activeQuestion.type}`}>
              {activeQuestion.category}
            </span>

            {activeQuestion.type === 'coding' ? (
              <>
                <h2 style={{ marginBottom: '1rem' }}>{activeQuestion.title}</h2>
                <div className="current-question glass-panel" style={{ padding: '1.5rem', fontSize: '1.1rem' }}>
                  {activeQuestion.description}
                </div>
              </>
            ) : (
              <h2 className="current-question">
                {activeQuestion.question}
              </h2>
            )}

            <div className="answer-section">
              <textarea
                className="answer-textarea"
                placeholder={activeQuestion.type === 'coding' ? "Write your code here..." : "Type your answer here..."}
                value={answers[activeQuestionId] || ''}
                onChange={handleAnswerChange}
                disabled={!!evaluations[activeQuestionId] || isEvaluating}
                spellCheck="false"
              />

              {!evaluations[activeQuestionId] && (
                <button
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={submitAnswer}
                  disabled={!answers[activeQuestionId] || isEvaluating}
                >
                  {isEvaluating ? 'Evaluating...' : (
                    <>Submit Response <Send size={18} /></>
                  )}
                </button>
              )}

              {/* Feedback Display */}
              {evaluations[activeQuestionId] && (
                <div className="feedback-panel">
                  <div className="feedback-score">Score: {evaluations[activeQuestionId].score}/10</div>
                  <p className="feedback-text">{evaluations[activeQuestionId].feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
