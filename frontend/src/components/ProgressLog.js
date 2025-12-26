// Filename: src/components/ProgressLog.js
// No changes.

import React from 'react';
import '../styles/ProgressLog.css';

function ProgressLog() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    'Scanning global databases...',
    'Verifying eligibility criteria...',
    'Calculating match probability...'
  ];

  const completedSteps = Math.floor((progress / 100) * steps.length);

  return (
    <div className="progress-log-container">
      <div className="spinner"></div>
      
      <h2>Finding Your Perfect Scholarships</h2>
      
      <div className="progress-steps">
        {steps.map((step, idx) => (
          <div key={idx} className={`step ${idx < completedSteps ? 'completed' : ''} ${idx === completedSteps ? 'current' : ''}`}>
            <div className="step-indicator">
              {idx < completedSteps ? (
                <span className="checkmark">✓</span>
              ) : (
                <span className="dot"></span>
              )}
            </div>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${Math.min(progress, 95)}%` }}></div>
      </div>
      
      <p className="progress-text">Building your customized report...</p>
    </div>
  );
}

export default ProgressLog;