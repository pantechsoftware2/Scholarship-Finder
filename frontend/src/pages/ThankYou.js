import React from 'react';
import '../styles/ThankYou.css';
import { Check, MessageCircle, List, Home } from 'lucide-react';

function ThankYou({ onGoHome }) {
  return (
    <div className="thankyou-container">
      <div className="thankyou-content">
        <div className="thankyou-topbar">
          <button type="button" className="btn-home btn-home-top" onClick={onGoHome}>
            <Home size={18} /> Back to Home
          </button>
        </div>

        <div className="success-animation">
          <Check size={40} className="checkmark" />
        </div>

        <h1>Report Sent Successfully! 🎉</h1>
        
        <div className="message-box">
          <p className="main-message">
            Your personalized scholarship report has been sent to your email.
          </p>
          
          <p className="sub-message">
            Check your inbox (and spam folder) within 2 minutes.
          </p>
        </div>

        <div className="next-steps">
          <h3><List size={20} /> Next Steps</h3>
          <ol>
            <li>
              <strong>Read the full list</strong> Explore all scholarships with match scores
            </li>
            <li>
              <strong>Review strategy tips</strong> Follow our AI-generated winning strategies
            </li>
            <li>
              <strong>Start applying</strong> Click on deadlines and submit applications
            </li>
            <li>
              <strong>Track progress</strong> Save important dates in your calendar
            </li>
          </ol>
        </div>

        <div className="cta-section">
          <p className="cta-text">Need help with your applications?</p>
          <div className="cta-actions">
            <a href="https://wa.me/+917044490574" className="btn-contact" target="_blank" rel="noreferrer">
            <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="encouragement">
          <p>
            You're on your way to securing that scholarship! 🚀<br/>
            <small>Good luck with your applications!</small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ThankYou;
