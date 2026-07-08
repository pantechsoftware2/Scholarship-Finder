import React, { useState } from 'react';
import '../styles/InputForm.css';
import ProgressLog from './ProgressLog';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  MapPin, 
  Award, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

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
    <div className="landing-container">
      <div className="hero-section">
        <div className="badge-pill">
          <Sparkles size={14} color="var(--primary)" />
          <span>AI-Powered Matching Engine</span>
        </div>
        <h1 className="hero-title">
          Discover Scholarships<br/>
          <span className="text-highlight">You Can Actually Win.</span>
        </h1>
        <p className="hero-subtitle">
          Stop wasting time on applications where you don't stand a chance. 
          Our algorithm analyzes your unique profile against thousands of opportunities 
          to find your highest-probability matches.
        </p>
        
        <div className="feature-list">
          <div className="feature-item">
            <CheckCircle2 size={20} color="var(--primary)" />
            <span>Personalized Match Scores</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={20} color="var(--primary)" />
            <span>Custom Essay Strategies</span>
          </div>
          <div className="feature-item">
            <CheckCircle2 size={20} color="var(--primary)" />
            <span>100% Free Analysis</span>
          </div>
        </div>
      </div>

      <div className="form-section fade-in">
        <div className="form-wrapper">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <ProgressLog />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="form-header-small">
                <h3>Your Academic Profile</h3>
                <p>Tell us about yourself to get started</p>
              </div>

              {/* Degree Level */}
              <div className="form-group">
                <label htmlFor="degree_level"><GraduationCap size={16} /> Degree Level *</label>
                <div className="input-with-icon">
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
              </div>

              {/* GPA Input */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gpa"><Target size={16} /> Current GPA *</label>
                  <div className="input-with-icon">
                    <input
                      id="gpa"
                      name="gpa"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8.5"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gpa_scale">Scale</label>
                  <div className="input-with-icon">
                    <select
                      id="gpa_scale"
                      name="gpa_scale"
                      value={formData.gpa_scale}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="10">Out of 10</option>
                      <option value="100">Out of 100</option>
                      <option value="4.0">Out of 4.0</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Major */}
              <div className="form-group">
                <label htmlFor="major"><BookOpen size={16} /> Major/Field of Study *</label>
                <div className="input-with-icon">
                  <input
                    id="major"
                    name="major"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Target Countries */}
              <div className="form-group">
                <label><MapPin size={16} /> Target Countries *</label>
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
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Award size={16} /> I have test scores (GRE/GMAT/IELTS)</span>
                </label>
              </div>

              {/* Test Scores Inputs */}
              {showTestScores && (
                <div className="test-scores-group">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gre">GRE Score</label>
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
                      <label htmlFor="gmat">GMAT Score</label>
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
                    <label htmlFor="ielts">IELTS Score</label>
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
                <label htmlFor="work_experience_years"><Briefcase size={16} /> Work Experience (years)</label>
                <div className="input-with-icon">
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
              </div>

              {/* Profile Highlight */}
              <div className="form-group">
                <label htmlFor="profile_highlight"><Sparkles size={16} /> Profile Highlight (Max 140 chars)</label>
                <textarea
                  id="profile_highlight"
                  name="profile_highlight"
                  maxLength="140"
                  placeholder="e.g., State-level athlete, Published paper..."
                  value={formData.profile_highlight}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="2"
                />
                <span className="char-count">{formData.profile_highlight.length}/140</span>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-calculate">
                Calculate Matches <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default InputForm;
