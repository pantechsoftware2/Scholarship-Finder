// frontend/src/pages/Results.js
import React from 'react';
import ResultsDisplay from '../components/ResultsDisplay';

function Results({ results, profile, onLeadCaptured }) {
  return <ResultsDisplay scholarshipResults={results} userProfile={profile} onUnlock={onLeadCaptured} />;
}

export default Results;
