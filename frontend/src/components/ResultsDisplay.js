import React, { useMemo, useState } from 'react';
import LeadCaptureModal from './LeadCaptureModal';
import '../styles/ResultsDisplay.css';
import {
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  Zap,
  Target,
  ArrowLeft,
  Globe,
  GraduationCap,
  Briefcase,
  Sparkles,
  Clock3,
} from 'lucide-react';

function ResultsDisplay({ scholarshipResults, userProfile, onUnlock, onBack }) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const handleLockedCardInteraction = (e) => {
    if (e && e.preventDefault) { e.preventDefault(); }
    if (e && e.stopPropagation) { e.stopPropagation(); }
    setShowUnlockModal(true);
  };

  const handleScrollTrigger = () => {
    if (!showUnlockModal && !showLeadModal) {
      setShowUnlockModal(true);
    }
  };

  const scholarships = scholarshipResults?.scholarships || [];
  const topScholarship = scholarships[0];
  const lockedScholarships = scholarships.slice(1);
  const isFreshDataUnavailable =
    topScholarship &&
    topScholarship.name === 'Fresh live scholarship data temporarily unavailable';

  const profileHighlights = useMemo(() => {
    const items = [];
    const filledEnglishTests = userProfile?.test_scores
      ? Object.entries(userProfile.test_scores)
          .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
          .map(([exam, value]) => `${String(exam).toUpperCase()} ${value}`)
      : [];

    if (userProfile?.nationality) {
      items.push({
        icon: <Globe size={14} />,
        label: 'Nationality',
        value: userProfile.nationality,
      });
    }

    if (userProfile?.degree_level) {
      items.push({
        icon: <GraduationCap size={14} />,
        label: 'Degree Level',
        value: userProfile.degree_level,
      });
    }

    if (userProfile?.major) {
      items.push({
        icon: <Sparkles size={14} />,
        label: 'Major',
        value: userProfile.major,
      });
    }

    if (userProfile?.work_experience_years !== undefined && userProfile?.work_experience_years !== '') {
      items.push({
        icon: <Briefcase size={14} />,
        label: 'Experience',
        value: `${userProfile.work_experience_years} year${String(userProfile.work_experience_years) === '1' ? '' : 's'}`,
      });
    }

    if (userProfile?.intended_intake) {
      items.push({
        icon: <Calendar size={14} />,
        label: 'Intake',
        value: userProfile.intended_intake,
      });
    }

    if (filledEnglishTests.length > 0) {
      items.push({
        icon: <Target size={14} />,
        label: 'English Test',
        value: filledEnglishTests.join(' | '),
      });
    }

    return items.slice(0, 6);
  }, [userProfile]);

  const deadlineInsight = useMemo(() => {
    const rawDeadline = topScholarship?.deadline;
    if (!rawDeadline) {
      return 'Deadline information is being verified.';
    }

    const parsed = new Date(rawDeadline);
    if (Number.isNaN(parsed.getTime())) {
      return `Application timeline: ${rawDeadline}.`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(parsed);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - today) / 86400000);

    if (diffDays < 0) {
      return 'Deadline has passed and should be refreshed.';
    }
    if (diffDays === 0) {
      return 'Deadline is today. Submit immediately if this cycle is still open.';
    }
    if (diffDays <= 14) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} left. This one should be prioritized first.`;
    }
    if (diffDays <= 45) {
      return `${diffDays} days left. Start documents and essays now to stay ahead.`;
    }
    return `${diffDays} days left. Good time to prepare a stronger, higher-quality application.`;
  }, [topScholarship]);

  const targetCountriesLabel = Array.isArray(userProfile?.target_countries) && userProfile.target_countries.length
    ? userProfile.target_countries.join(', ')
    : null;

  if (!scholarshipResults || !scholarshipResults.scholarships) {
    return <div>Loading results...</div>;
  }

  return (
    <main className="results-container" aria-labelledby="results-title">
      <div className="results-header-container">
        {onBack && (
          <button
            className="btn-back"
            onClick={onBack}
            type="button"
            aria-label="Go back to the scholarship profile form"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="results-header">
          <h1 id="results-title">
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
      <section className="scholarship-card top-pick-card" aria-labelledby="top-scholarship-title">
        <div className="top-pick-badge">
          {isFreshDataUnavailable ? 'Status' : 'Top Pick'}
        </div>
        <div className="card-content">
          <h2 className="scholarship-name" id="top-scholarship-title">{topScholarship.name}</h2>
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

          {!isFreshDataUnavailable && (
            <>
              <div className="detail-grid">
                <div className="detail-panel">
                  <p className="detail-panel-label">
                    <Clock3 size={15} />
                    Application Timing
                  </p>
                  <p className="detail-panel-text">{deadlineInsight}</p>
                </div>

                <div className="detail-panel">
                  <p className="detail-panel-label">
                    <Sparkles size={15} />
                    AI Strategy Tip
                  </p>
                  <p className="detail-panel-text">{topScholarship.strategy_tip}</p>
                </div>
              </div>

              {profileHighlights.length > 0 && (
                <div className="profile-fit-section">
                  <p className="profile-fit-title">Why this matches your profile</p>
                  <div className="profile-fit-list">
                    {profileHighlights.map((item) => (
                      <div className="profile-fit-chip" key={`${item.label}-${item.value}`}>
                        <span className="chip-icon">{item.icon}</span>
                        <span className="chip-label">{item.label}</span>
                        <span className="chip-value">{item.value}</span>
                      </div>
                    ))}
                    {targetCountriesLabel && (
                      <div className="profile-fit-chip">
                        <span className="chip-icon"><Globe size={14} /></span>
                        <span className="chip-label">Targets</span>
                        <span className="chip-value">{targetCountriesLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Locked Cards */}
      {!isFreshDataUnavailable && lockedScholarships.length > 0 && (
        <section className="locked-section" aria-labelledby="locked-matches-title">
          <h2 id="locked-matches-title" className="sr-only">More scholarship matches</h2>
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
                <div className="locked-card-overlay">
                  <span className="locked-preview-chip">Preview Locked</span>
                </div>
                <div className="card-blur-content">
                  <div className="blurred-text shimmer"></div>
                  <div className="blurred-text"></div>
                  <div className="blurred-text short"></div>
                  <div className="blurred-meta-row">
                    <div className="blurred-pill"></div>
                    <div className="blurred-pill short"></div>
                  </div>
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
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="unlock-modal-title"
              >
                <button
                  type="button"
                  className="modal-close" 
                  onClick={() => setShowUnlockModal(false)}
                  aria-label="Close unlock modal"
                >
                  ✕
                </button>
                
                <div className="unlock-icon"><Unlock size={48} /></div>
                
                <h2 id="unlock-modal-title">Unlock Your Full List</h2>
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
        </section>
      )}

      {/* No Locked Cards Message */}
      {lockedScholarships.length === 0 && !isFreshDataUnavailable && (
        <div className="no-more-matches">
          <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>This is your top match! Enter your details to get personalized strategy tips.</p>
          <button 
            type="button"
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
            type="button"
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
    </main>
  );
}

export default ResultsDisplay;
