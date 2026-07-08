import React from 'react';
import '../styles/ProgressLog.css';

const STEPS = [
  { label: 'Scanning global databases...', threshold: 24 },
  { label: 'Verifying eligibility criteria...', threshold: 54 },
  { label: 'Calculating match probability...', threshold: 78 },
  { label: 'Building your customized report...', threshold: 96 },
];

function ProgressLog() {
  const [progress, setProgress] = React.useState(6);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev;

        if (prev < 24) return Math.min(prev + 6, 24);
        if (prev < 54) return Math.min(prev + 5, 54);
        if (prev < 78) return Math.min(prev + 4, 78);
        return Math.min(prev + 2, 96);
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const currentStepIndex = STEPS.findIndex((step) => progress <= step.threshold);
  const resolvedCurrentStep = currentStepIndex === -1 ? STEPS.length - 1 : currentStepIndex;

  return (
    <div className="progress-log-container">
      <div className="spinner" />

      <h2>Finding Your Perfect Scholarships</h2>

      <div className="progress-percent">{Math.round(progress)}%</div>

      <div className="progress-steps">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < resolvedCurrentStep;
          const isCurrent = idx === resolvedCurrentStep;

          return (
            <div
              key={step.label}
              className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-indicator">
                {isCompleted ? <span className="checkmark">✓</span> : <span className="dot" />}
              </div>
              <span className="step-text">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="progress-bar-container" aria-label="Scholarship progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <p className="progress-text">{STEPS[resolvedCurrentStep].label}</p>
    </div>
  );
}

export default ProgressLog;
