import React, { useState } from 'react';
import LeadCaptureModal from './LeadCaptureModal';
import '../styles/ResultsDisplay.css';
import { DollarSign, Calendar, Lock, Unlock, Zap, Target, ArrowLeft } from 'lucide-react';

function ResultsDisplay({ scholarshipResults, userProfile, onUnlock, onBack }) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [modalTriggered, setModalTriggered] = useState(false);

  const handleLockedCardInteraction = (e) => {
    if (!modalTriggered) {
      if (e && e.preventDefault) { e.preventDefault(); }
      if (e && e.stopPropagation) { e.stopPropagation(); }
      setShowUnlockModal(true);
      setModalTriggered(true);
    }
  };

  const handleScrollTrigger = () => {
    if (!modalTriggered) {
      setShowUnlockModal(true);
      setModalTriggered(true);
    }
  };

  if (!scholarshipResults || !scholarshipResults.scholarships) {
    return <div>Loading results...</div>;
  }

  const topScholarship = scholarshipResults.scholarships[0];
  const lockedScholarships = scholarshipResults.scholarships.slice(1);
  const isFreshDataUnavailable =
    topScholarship &&
    topScholarship.name === 'Fresh live scholarship data temporarily unavailable';

  return (
    <div className="results-container">
      
      <div className="results-header-container">
        {onBack && (
          <button className="btn-back" onClick={onBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="results-header">
          <h1>
            {isFreshDataUnavailable
              ? 'Data Needs Refresh'
              : `Found ${scholarshipResults.scholarships.length} Matches`}
          </h1>
          <div className="probability-badge">
            <span className="label">
              {isFreshDataUnavailable ? 'Coverage' : 'Success Probability'}
            </span>
            <span className="value">{scholarshipResults.summary_probability}%</span>
          </div>
        </div>
      </div>

      {/* Top Pick Card */}
      <div className="scholarship-card top-pick-card">
        <div className="top-pick-badge">
          {isFreshDataUnavailable ? 'Status' : 'Top Pick'}
        </div>
        <div className="card-content">
          <h3 className="scholarship-name">{topScholarship.name}</h3>
          <div className="card-meta">
            <span className="meta-item amount">
              <DollarSign size={16} />
              {topScholarship.amount}
            </span>
            <span className="meta-item deadline">
              <Calendar size={16} />
              {topScholarship.deadline}
            </span>
          </div>
          
          <div className="match-score-inline">
            <Target size={16} color="var(--text-secondary)" />
            <span className="score">{topScholarship.match_score}%</span>
            <span className="label">{isFreshDataUnavailable ? 'Ready' : 'Match'}</span>
          </div>

          <p className="reason">
            <strong><Zap size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px'}}/>{isFreshDataUnavailable ? 'What happened:' : "Why you'll win:"}</strong>{' '}
            {topScholarship.one_liner_reason}
          </p>
        </div>
      </div>

      {/* Locked Cards */}
      {!isFreshDataUnavailable && lockedScholarships.length > 0 && (
        <div className="locked-section">
          <p className="locked-label">Scroll to unlock more matches</p>
          
          <div 
            className="locked-cards-container"
            onClick={handleLockedCardInteraction}
            onWheel={(e) => { if (Math.abs(e.deltaY) > 10) handleScrollTrigger(); }}
            onScroll={handleScrollTrigger}
            onTouchStart={handleScrollTrigger}
          >
            {lockedScholarships.map((scholarship, idx) => (
              <div 
                key={idx} 
                className="scholarship-card locked-card"
                onClick={handleLockedCardInteraction}
              >
                <div className="card-blur-content">
                  <div className="blurred-text"></div>
                  <div className="blurred-text short"></div>
                  <div className="match-score-badge">
                    <Lock size={14} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px'}}/>
                    <span>{scholarship.match_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showUnlockModal && (
            <div className="modal-overlay" onClick={() => setShowUnlockModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="modal-close" 
                  onClick={() => setShowUnlockModal(false)}
                >
                  ✕
                </button>
                
                <div className="unlock-icon"><Unlock size={48} /></div>
                
                <h2>Unlock Your Full List</h2>
                <p className="unlock-subtitle">+ AI Essay Strategy & Personalized Tips</p>
                
                <p className="unlock-description">
                  Get instant access to all {scholarshipResults.scholarships.length} scholarships and a personalized action plan.
                </p>

                <button 
                  className="btn-unlock"
                  onClick={() => {
                    setShowUnlockModal(false);
                    setShowLeadModal(true);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Locked Cards Message */}
      {lockedScholarships.length === 0 && !isFreshDataUnavailable && (
        <div className="no-more-matches">
          <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>This is your top match! Enter your details to get personalized strategy tips.</p>
          <button 
            className="btn-unlock"
            onClick={() => setShowLeadModal(true)}
          >
            Send My Report
          </button>
        </div>
      )}

      {isFreshDataUnavailable && (
        <div className="no-more-matches">
          <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
            Live AI providers are not returning current-cycle scholarships right now.
          </p>
          <button
            className="btn-unlock"
            onClick={() => window.location.reload()}
          >
            Refresh Results
          </button>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <LeadCaptureModal 
          scholarships={scholarshipResults}
          profile={userProfile || {}}
          onClose={() => setShowLeadModal(false)}
          onSuccess={() => {
            setShowLeadModal(false);
            if (onUnlock) onUnlock();
          }}
        />
      )}
    </div>
  );
}

export default ResultsDisplay;
