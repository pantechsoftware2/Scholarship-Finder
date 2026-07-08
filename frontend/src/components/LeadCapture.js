// Filename: src/components/LeadCapture.js
// No changes, but deprecated in favor of LeadCaptureModal.js in the fixed version.

import React, { useState } from 'react';
import '../styles/LeadCapture.css';

function LeadCapture({ onSubmit, scholarshipResults }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-capture-container">
      <div className="capture-wrapper">
        <div className="capture-header">
          <h2>🔓 Unlock Your Full Report</h2>
          <p>Get all {scholarshipResults?.scholarships?.length || 0} scholarships + AI Strategy Tips</p>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="capture-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">WhatsApp Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Sending your report...' : 'Send My Full Report'}
          </button>

          <p className="form-footer">
            ✅ We'll email your full report instantly<br/>
            📧 Check your inbox (and spam folder) within 2 minutes
          </p>
        </form>

        {scholarshipResults?.scholarships && (
          <div className="scholarship-preview">
            <h3>Preview of Your Full List:</h3>
            <div className="preview-list">
              {scholarshipResults.scholarships.map((scholarship, idx) => (
                <div key={idx} className="preview-item">
                  <span className="item-number">{idx + 1}</span>
                  <div className="item-details">
                    <p className="item-name">{scholarship.name}</p>
                    <p className="item-score">{scholarship.match_score}% Match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadCapture;