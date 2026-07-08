import React, { useEffect, useMemo, useState } from 'react';
import '../styles/InputForm.css';
import ProgressLog from './ProgressLog';
import {
  GraduationCap,
  Target,
  BookOpen,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Home,
  ChevronDown,
  Globe2,
  CalendarRange,
  Languages,
  School,
} from 'lucide-react';

const MAJOR_SUGGESTIONS = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Management',
  'Finance',
  'Economics',
  'Law',
  'Medicine',
  'Medical Science',
  'Biotechnology',
  'Data Science',
  'Artificial Intelligence',
  'Cybersecurity',
  'Psychology',
  'Architecture',
  'Education',
];

const CURRENT_DEGREES = [
  'B.Tech',
  'B.E.',
  'B.Sc',
  'B.Com',
  'BBA',
  'BA',
  'MBBS',
  'BCA',
  'M.Tech',
  'M.Sc',
  'MBA',
  'LLB',
];

const NATIONALITIES = ['India', 'Bangladesh', 'Nepal', 'Pakistan', 'Sri Lanka', 'UAE', 'Nigeria', 'Kenya'];
const INTAKES = ['Fall 2027', 'Spring 2028', 'Any'];
const ENGLISH_TEST_FIELDS = ['IELTS', 'TOEFL', 'PTE', 'Duolingo'];
const WORK_EXPERIENCE_OPTIONS = ['0', '1', '2', '3', '4+'];

function InputForm({ onCalculate, loading, error }) {
  const [formData, setFormData] = useState({
    degree_level: "Bachelor's",
    current_degree: '',
    gpa: '',
    gpa_scale: '10',
    nationality: 'India',
    target_countries: [],
    intended_intake: 'Fall 2027',
    major: '',
    english_test_taken: 'No',
    test_scores: {
      ielts: '',
      toefl: '',
      pte: '',
      duolingo: '',
    },
    work_experience_years: '0',
    profile_highlight: '',
  });

  const [customCountry, setCustomCountry] = useState('');
  const [useCustomCountry, setUseCustomCountry] = useState(false);
  const [showMajorSuggestions, setShowMajorSuggestions] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const popularCountries = ['USA', 'UK', 'Canada', 'Australia', 'Germany'];
  const degreeLevels = ["Bachelor's", "Master's", 'PhD'];

  useEffect(() => {
    if (!error) return;
    setToastMessage(error);
  }, [error]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(''), 3600);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const filteredMajors = useMemo(() => {
    const query = formData.major.trim().toLowerCase();
    if (!query) return MAJOR_SUGGESTIONS.slice(0, 8);
    return MAJOR_SUGGESTIONS.filter((major) => major.toLowerCase().includes(query)).slice(0, 8);
  }, [formData.major]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryToggle = (country) => {
    setFormData((prev) => ({
      ...prev,
      target_countries: prev.target_countries.includes(country)
        ? prev.target_countries.filter((entry) => entry !== country)
        : [...prev.target_countries, country],
    }));
  };

  const handleOtherCountryToggle = () => {
    setUseCustomCountry((prev) => {
      const nextValue = !prev;
      if (!nextValue) {
        setCustomCountry('');
      }
      return nextValue;
    });
  };

  const handleCustomCountryKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = customCountry.trim();
      if (value && !formData.target_countries.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          target_countries: [...prev.target_countries, value],
        }));
      }
      setCustomCountry('');
    }
  };

  const handleCustomCountryRemove = (country) => {
    setFormData((prev) => ({
      ...prev,
      target_countries: prev.target_countries.filter((entry) => entry !== country),
    }));
  };

  const handleMajorSelect = (major) => {
    setFormData((prev) => ({
      ...prev,
      major,
    }));
    setShowMajorSuggestions(false);
  };

  const handleEnglishTestTakenChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      english_test_taken: value,
      test_scores:
        value === 'No'
          ? {
              ielts: '',
              toefl: '',
              pte: '',
              duolingo: '',
            }
          : prev.test_scores,
    }));
  };

  const handleTestScoreChange = (exam, value) => {
    setFormData((prev) => ({
      ...prev,
      test_scores: {
        ...prev.test_scores,
        [exam]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTargetCountries = [...formData.target_countries];
    const trimmedCustomCountry = customCountry.trim();

    if (useCustomCountry && trimmedCustomCountry && !finalTargetCountries.includes(trimmedCustomCountry)) {
      finalTargetCountries.push(trimmedCustomCountry);
    }

    if (
      !formData.current_degree.trim() ||
      !formData.gpa ||
      !formData.major.trim() ||
      !formData.nationality.trim() ||
      finalTargetCountries.length === 0
    ) {
      setToastMessage('Please complete all required starred fields before continuing.');
      return;
    }

    if (useCustomCountry && !trimmedCustomCountry) {
      setToastMessage('Please enter your target country in the Other field.');
      return;
    }

    const filledTestScores = Object.entries(formData.test_scores || {}).filter(([, value]) => {
      return String(value).trim() !== '';
    });

    if (formData.english_test_taken === 'Yes' && filledTestScores.length === 0) {
      setToastMessage('If you select test taken, please fill at least one score: IELTS, TOEFL, PTE, or Duolingo.');
      return;
    }

    const test_scores = filledTestScores.length
      ? Object.fromEntries(
          filledTestScores.map(([exam, value]) => [exam, Number(value)])
        )
      : null;

    const work_experience_years =
      formData.work_experience_years === '4+'
        ? 4
        : Number(formData.work_experience_years) || 0;

    const coercedProfile = {
      degree_level: formData.degree_level,
      current_degree: formData.current_degree.trim(),
      gpa: parseFloat(formData.gpa),
      gpa_scale: formData.gpa_scale,
      nationality: formData.nationality.trim(),
      target_countries: finalTargetCountries,
      intended_intake: formData.intended_intake,
      major: formData.major.trim(),
      english_test_type:
        filledTestScores.length > 0
          ? filledTestScores.map(([exam]) => exam.toUpperCase()).join(', ')
          : null,
      english_test_score: null,
      test_scores,
      work_experience_years,
      profile_highlight: formData.profile_highlight.trim(),
    };

    onCalculate(coercedProfile);
  };

  return (
    <>
      {toastMessage && (
        <div className="top-toast" role="alert" aria-live="polite">
          <AlertCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="landing-container">
        <div className="hero-section">
          <button
            type="button"
            className="home-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <div className="badge-pill">
            <Sparkles size={14} color="var(--primary)" />
            <span>AI-Powered Matching Engine</span>
          </div>
          <h1 className="hero-title">
            Discover Scholarships
            <br />
            <span className="text-highlight">You Can Actually Win.</span>
          </h1>
          <p className="hero-subtitle">
            Stop wasting time on weak-fit applications. We structure your academic profile the way
            admissions and scholarship teams actually evaluate it.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <CheckCircle2 size={20} color="var(--primary)" />
              <span>Citizenship-aware scholarship matching</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} color="var(--primary)" />
              <span>Intake-specific opportunity targeting</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} color="var(--primary)" />
              <span>Cleaner profile capture for better results</span>
            </div>
          </div>
        </div>

        <div className="form-section fade-in">
          <div className="form-wrapper">
            {loading ? (
              <div className="loading-state">
                <ProgressLog />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form">
                <div className="form-header-small">
                  <h3>Your Academic Profile</h3>
                  <p>Complete the starred fields to generate your shortlist.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="degree_level">
                    <GraduationCap size={16} /> Degree Level *
                  </label>
                  <div className="input-with-icon">
                    <select
                      id="degree_level"
                      name="degree_level"
                      value={formData.degree_level}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {degreeLevels.map((degree) => (
                        <option key={degree} value={degree}>
                          {degree}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="current_degree">
                    <School size={16} /> Current / Last Degree *
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="current_degree"
                      name="current_degree"
                      type="text"
                      list="current-degree-options"
                      placeholder="e.g., B.Tech"
                      value={formData.current_degree}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    <datalist id="current-degree-options">
                      {CURRENT_DEGREES.map((degree) => (
                        <option key={degree} value={degree} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group major-group">
                  <label htmlFor="major">
                    <BookOpen size={16} /> Major *
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="major"
                      name="major"
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={formData.major}
                      onChange={handleInputChange}
                      onFocus={() => setShowMajorSuggestions(true)}
                      className="form-input"
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      className="major-toggle"
                      onClick={() => setShowMajorSuggestions((prev) => !prev)}
                      aria-label="Toggle major suggestions"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  {showMajorSuggestions && filteredMajors.length > 0 && (
                    <div className="major-suggestions">
                      {filteredMajors.map((major) => (
                        <button
                          key={major}
                          type="button"
                          className="major-suggestion-item"
                          onMouseDown={() => handleMajorSelect(major)}
                        >
                          {major}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="field-help">Choose a common major or type your own manually.</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gpa">
                      <Target size={16} /> GPA / Percentage *
                    </label>
                    <div className="input-with-icon">
                      <input
                        id="gpa"
                        name="gpa"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 8.2"
                        value={formData.gpa}
                        onChange={handleInputChange}
                        onWheel={(event) => event.target.blur()}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gpa_scale">Scale *</label>
                    <div className="input-with-icon">
                      <select
                        id="gpa_scale"
                        name="gpa_scale"
                        value={formData.gpa_scale}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="10">10</option>
                        <option value="4">4</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nationality">
                    <Globe2 size={16} /> Nationality *
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      list="nationality-options"
                      placeholder="e.g., India"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    <datalist id="nationality-options">
                      {NATIONALITIES.map((nationality) => (
                        <option key={nationality} value={nationality} />
                      ))}
                    </datalist>
                  </div>
                  <span className="field-help">
                    Citizenship matters more than country of residence for many scholarships.
                  </span>
                </div>

                <div className="form-group">
                  <label>
                    <MapPin size={16} /> Target Countries *
                  </label>
                  <div className="country-chips">
                    {popularCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        className={`chip ${formData.target_countries.includes(country) ? 'active' : ''}`}
                        onClick={() => handleCountryToggle(country)}
                      >
                        {country}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`chip ${useCustomCountry ? 'active' : ''}`}
                      onClick={handleOtherCountryToggle}
                    >
                      Other
                    </button>
                    {formData.target_countries
                      .filter((country) => !popularCountries.includes(country))
                      .map((country) => (
                        <button
                          key={country}
                          type="button"
                          className="chip active custom-chip"
                          onClick={() => handleCustomCountryRemove(country)}
                          title="Click to remove"
                        >
                          {country} x
                        </button>
                      ))}
                  </div>
                  {useCustomCountry && (
                    <div className="input-with-icon custom-country-input">
                      <input
                        type="text"
                        placeholder="Enter another target country"
                        value={customCountry}
                        onChange={(e) => setCustomCountry(e.target.value)}
                        onKeyDown={handleCustomCountryKeyDown}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="intended_intake">
                    <CalendarRange size={16} /> Intended Intake *
                  </label>
                  <div className="input-with-icon">
                    <select
                      id="intended_intake"
                      name="intended_intake"
                      value={formData.intended_intake}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {INTAKES.map((intake) => (
                        <option key={intake} value={intake}>
                          {intake}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Languages size={16} /> English Test
                  </label>
                  <div className="choice-grid">
                    {['No', 'Yes'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`choice-pill ${formData.english_test_taken === option ? 'active' : ''}`}
                        onClick={() => handleEnglishTestTakenChange(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <span className="field-help">
                    If yes, add at least one valid score below.
                  </span>
                </div>

                {formData.english_test_taken === 'Yes' && (
                  <div className="test-scores-group">
                    <label>Enter any available overall score(s)</label>
                    <div className="test-score-grid">
                      {ENGLISH_TEST_FIELDS.map((exam) => (
                        <div className="form-group compact-form-group" key={exam}>
                          <label htmlFor={`test_${exam.toLowerCase()}`}>{exam}</label>
                          <div className="input-with-icon">
                            <input
                              id={`test_${exam.toLowerCase()}`}
                              type="number"
                              step="0.1"
                              placeholder={`Enter ${exam} score`}
                              value={formData.test_scores[exam.toLowerCase()]}
                              onChange={(e) => handleTestScoreChange(exam.toLowerCase(), e.target.value)}
                              onWheel={(event) => event.target.blur()}
                              className="form-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="work_experience_years">
                    <Briefcase size={16} /> Work Experience
                  </label>
                  <div className="input-with-icon">
                    <select
                      id="work_experience_years"
                      name="work_experience_years"
                      value={formData.work_experience_years}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {WORK_EXPERIENCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile_highlight">
                    <Sparkles size={16} /> Anything you'd like us to know?
                  </label>
                  <textarea
                    id="profile_highlight"
                    name="profile_highlight"
                    maxLength="220"
                    placeholder="Examples: research paper, national athlete, startup founder, financial need, volunteer work..."
                    value={formData.profile_highlight}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                  />
                  <span className="char-count">{formData.profile_highlight.length}/220</span>
                </div>

                <button type="submit" className="btn-calculate">
                  Calculate Matches <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default InputForm;
