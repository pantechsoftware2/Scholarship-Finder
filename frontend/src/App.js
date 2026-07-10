// Filename: src/App.js
// Fix: Switched to use Results instead of ResultsDisplay and LeadCapture; removed 'lead-capture' stage; onLeadCaptured sets to 'thankyou'.

import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './pages/Results';
import ThankYou from './pages/ThankYou';
import './styles/App.css';
import { getApiBaseUrl } from './config';

function App() {
  const [currentStage, setCurrentStage] = useState('input');
  const [userProfile, setUserProfile] = useState(null);
  const [scholarshipResults, setScholarshipResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = getApiBaseUrl();

  const handleCalculate = async (profile) => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(
        `${apiUrl}/api/calculate-scholarships`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify(profile),
        }
      );

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        // Extract error message from backend response
        let errorMessage = 'Unable to calculate scholarships right now.';
        
        if (result && typeof result.detail === 'string') {
          errorMessage = result.detail;
        } else if (result && Array.isArray(result.detail)) {
          // Handle validation error list
          errorMessage = result.detail
            .map(err => `${err.loc?.join('.')}: ${err.msg}`)
            .join('; ');
        }
        
        throw new Error(errorMessage);
      }

      if (!result || !result.data) {
        throw new Error('The server returned an unexpected response. Please try again.');
      }

      setUserProfile(profile);
      setScholarshipResults(result.data);
      setCurrentStage('results');
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('The request took too long. Please try again in a moment.');
      } else {
        setError(err.message || 'Failed to calculate scholarships.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {currentStage === 'input' && (
        <InputForm
          onCalculate={handleCalculate}
          loading={loading}
          error={error}
        />
      )}

      {currentStage === 'results' && (
        <Results
          results={scholarshipResults}
          profile={userProfile}
          onLeadCaptured={() => setCurrentStage('thankyou')}
          onBack={() => setCurrentStage('input')}
        />
      )}

      {currentStage === 'thankyou' && (
        <ThankYou
          onGoHome={() => {
            setCurrentStage('input');
            setUserProfile(null);
            setScholarshipResults(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
