import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, ChevronRight } from 'lucide-react';
import './SetupSession.css';

const SetupSession = ({ onNext }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    experience: ''
  });

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file && formData.role) {
      onNext?.({ file, ...formData });
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h2>Configure Your Session</h2>
        <p>Personalize your AI interview by providing your background and goals.</p>
      </div>

      <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Resume</label>
            {!file ? (
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud className="dropzone-icon" size={48} />
                <div className="dropzone-text">
                  {isDragActive ? "Drop your resume here" : "Drag & drop your resume, or click to browse"}
                </div>
                <div className="dropzone-subtext">Supports PDF, DOCX, TXT up to 5MB</div>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <FileText size={24} color="#8a2be2" />
                  <div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button type="button" className="remove-btn" onClick={() => setFile(null)}>
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="form-group">
              <label htmlFor="role">Target Role *</label>
              <input 
                type="text" 
                id="role" 
                name="role" 
                className="form-control" 
                placeholder="e.g. Senior Frontend Engineer" 
                value={formData.role} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <select 
                id="experience" 
                name="experience" 
                className="form-control" 
                value={formData.experience} 
                onChange={handleChange}
              >
                <option value="" disabled>Select Level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (5+ years)</option>
                <option value="lead">Lead / Manager</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label htmlFor="company">Target Company (Optional)</label>
            <input 
              type="text" 
              id="company" 
              name="company" 
              className="form-control" 
              placeholder="e.g. Google, Stripe, Startups" 
              value={formData.company} 
              onChange={handleChange} 
            />
          </div>

          <div className="submit-btn-container">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!file || !formData.role}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              Generate Interview <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupSession;
