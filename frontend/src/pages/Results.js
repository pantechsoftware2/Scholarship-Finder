// frontend/src/pages/Results.js
import React from 'react';
import ResultsDisplay from '../components/ResultsDisplay';

function Results({ results, profile, onLeadCaptured, onBack }) {
  return <ResultsDisplay scholarshipResults={results} userProfile={profile} onUnlock={onLeadCaptured} onBack={onBack} />;
}

export default Results;
