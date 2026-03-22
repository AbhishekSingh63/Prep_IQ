import React, { useState, useRef } from 'react';
import { parseResumeAPI } from '../services/api';

export default function UploadPage({ onNext }) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const parseResume = async () => {
    setLoading(true);
    const text = resumeText || manualText;
    try {
      const parsed = await parseResumeAPI(text);
      onNext(parsed.data || parsed, text);
    } catch (err) {
      console.error(err);
      // Fallback
      onNext({ name: "Candidate", skills: ["JavaScript", "Python"], experience_years: 1, projects: [], education: "B.Tech", level: "junior" }, text);
    }
    setLoading(false);
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="card">
          <div className="card-title">Upload Your Resume</div>
          <div className="card-sub">We'll parse your skills, experience & projects to personalize your prep</div>

          <div className="section-label">Drop PDF or Text File</div>
          <div
            className={`drop-zone ${drag ? "drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc" hidden onChange={(e) => handleFile(e.target.files[0])} />
            <div className="drop-icon">📄</div>
            <div className="drop-title">Drag & drop your resume</div>
            <div className="drop-sub">Supports .txt, .pdf, .doc · or paste text below</div>
            {fileName && <div className="file-badge">✓ {fileName}</div>}
          </div>

          <div className="section-label" style={{ marginTop: 24 }}>Or Paste Resume Text</div>
          <textarea
            className="text-area"
            placeholder="Paste your resume content here — skills, experience, projects, education..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
          />

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <div className="loading-text">Analyzing your resume with AI...</div>
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={parseResume}
              disabled={!resumeText && !manualText}
            >
              Analyze Resume → Map Skills
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
