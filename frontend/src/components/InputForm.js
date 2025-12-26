import React, { useState } from 'react';
import '../styles/InputForm.css';
import ProgressLog from './ProgressLog';

function InputForm({ onCalculate, loading, error }) {
  const [formData, setFormData] = useState({
    degree_level: 'Masters',
    gpa: '',
    gpa_scale: '10',
    target_countries: [],
    major: '',
    test_scores: {},
    work_experience_years: 0,
    profile_highlight: ''
  });

  const [showTestScores, setShowTestScores] = useState(false);

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Anywhere'];
  const degrees = ['Undergrad', 'Masters', 'PhD', 'MBA'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryToggle = (country) => {
    setFormData(prev => ({
      ...prev,
      target_countries: prev.target_countries.includes(country)
        ? prev.target_countries.filter(c => c !== country)
        : [...prev.target_countries, country]
    }));
  };

  const handleTestScoreChange = (test, score) => {
    setFormData(prev => ({
      ...prev,
      test_scores: {
        ...prev.test_scores,
        [test]: score || undefined
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.gpa || !formData.major || formData.target_countries.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    // Clean up and coerce types for backend validation
    const cleanTestScores = Object.fromEntries(
      Object.entries(formData.test_scores || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );

    // Coerce numeric fields
    const coercedProfile = {
      ...formData,
      gpa: parseFloat(formData.gpa),
      work_experience_years: Number(formData.work_experience_years) || 0,
      test_scores: Object.keys(cleanTestScores).length > 0 ? Object.fromEntries(
        Object.entries(cleanTestScores).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
      ) : null,
      target_countries: Array.isArray(formData.target_countries) ? formData.target_countries : [],
    };

    onCalculate(coercedProfile);
  };

  return (
    <div className="input-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>🎓 Find Your Perfect Scholarship</h1>
          <p>Answer a few questions about your academic profile, and we'll find you the best matches.</p>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <ProgressLog />
        ) : (
          <form onSubmit={handleSubmit} className="form">
            {/* Degree Level */}
            <div className="form-group">
              <label htmlFor="degree_level">Degree Level *</label>
              <select
                id="degree_level"
                name="degree_level"
                value={formData.degree_level}
                onChange={handleInputChange}
                className="form-select"
              >
                {degrees.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            {/* GPA Input */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gpa">Current GPA/Percentage *</label>
                <input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 8.5 or 85"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gpa_scale">Scale</label>
                <select
                  id="gpa_scale"
                  name="gpa_scale"
                  value={formData.gpa_scale}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="10">Out of 10</option>
                  <option value="100">Out of 100</option>
                </select>
              </div>
            </div>

            {/* Major */}
            <div className="form-group">
              <label htmlFor="major">Major/Field of Study *</label>
              <input
                id="major"
                name="major"
                type="text"
                placeholder="e.g., Computer Science, Business Administration"
                value={formData.major}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {/* Target Countries */}
            <div className="form-group">
              <label>Target Countries *</label>
              <div className="country-chips">
                {countries.map(country => (
                  <button
                    key={country}
                    type="button"
                    className={`chip ${formData.target_countries.includes(country) ? 'active' : ''}`}
                    onClick={() => handleCountryToggle(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Scores Toggle */}
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showTestScores}
                  onChange={(e) => setShowTestScores(e.target.checked)}
                  className="form-checkbox"
                />
                <span>I have test scores (GRE/GMAT/IELTS)</span>
              </label>
            </div>

            {/* Test Scores Inputs */}
            {showTestScores && (
              <div className="test-scores-group">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gre">GRE Score (out of 340)</label>
                    <input
                      id="gre"
                      type="number"
                      min="0"
                      max="340"
                      placeholder="e.g., 320"
                      value={formData.test_scores.gre || ''}
                      onChange={(e) => handleTestScoreChange('gre', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gmat">GMAT Score (out of 800)</label>
                    <input
                      id="gmat"
                      type="number"
                      min="0"
                      max="800"
                      placeholder="e.g., 720"
                      value={formData.test_scores.gmat || ''}
                      onChange={(e) => handleTestScoreChange('gmat', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ielts">IELTS Score (out of 9)</label>
                  <input
                    id="ielts"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    placeholder="e.g., 7.5"
                    value={formData.test_scores.ielts || ''}
                    onChange={(e) => handleTestScoreChange('ielts', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Work Experience */}
            <div className="form-group">
              <label htmlFor="work_experience_years">Work Experience (years)</label>
              <input
                id="work_experience_years"
                name="work_experience_years"
                type="number"
                min="0"
                step="0.5"
                value={formData.work_experience_years}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Profile Highlight */}
            <div className="form-group">
              <label htmlFor="profile_highlight">Profile Highlight (Max 140 chars)</label>
              <textarea
                id="profile_highlight"
                name="profile_highlight"
                maxLength="140"
                placeholder="e.g., State-level cricket player, Published research paper, Volunteer at NGO..."
                value={formData.profile_highlight}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
              />
              <span className="char-count">{formData.profile_highlight.length}/140</span>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-calculate">
              Calculate My Odds 🚀
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default InputForm;
