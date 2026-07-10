import React from 'react';
import '../styles/InfoPages.css';

function HowItWorksPage() {
  return (
    <main className="info-page">
      <nav className="info-nav" aria-label="Primary navigation">
        <a href="/">Home</a>
        <a href="/how-it-works" className="active">How It Works</a>
        <a href="/#scholarship-faq">FAQ</a>
        <a href="/countries">Countries</a>
      </nav>

      <section className="info-hero">
        <div className="info-hero-copy">
          <span className="info-eyebrow">How Scholarship Finder Works</span>
          <h1>Understand the scholarship matching process before you apply.</h1>
          <p>
            Scholarship Finder helps students reduce random applications and focus on study abroad
            scholarships that align more closely with academic background, nationality, target country,
            and intake timing.
          </p>
          <p>
            This page explains the exact matching flow so students can use the scholarship form more
            effectively and build stronger international scholarship shortlists.
          </p>
          <div className="info-actions">
            <a className="info-btn-primary" href="/#scholarship-form">Start scholarship matching</a>
            <a className="info-btn-secondary" href="/countries">Explore countries</a>
          </div>
        </div>

        <aside className="info-panel">
          <h2>Why this matters</h2>
          <ul className="info-bullet-list">
            <li>Better-fit scholarships save time during application season.</li>
            <li>Country targeting works better when matched with degree level and GPA.</li>
            <li>Stronger shortlists lead to more realistic funding decisions.</li>
          </ul>
        </aside>
      </section>

      <section className="info-section">
        <div className="info-section-heading">
          <h2>How Scholarship Finder works</h2>
          <p>
            These are the same ideas already introduced on the homepage, now expanded into a dedicated
            page so users can read the process clearly without landing on a not-found screen.
          </p>
        </div>

        <div className="info-card-grid info-card-grid-three">
          <article className="info-card">
            <h3>1. Build your student profile</h3>
            <p>
              Add your degree level, GPA, major, nationality, work experience, and intake so the
              scholarship finder can understand your academic background.
            </p>
          </article>
          <article className="info-card">
            <h3>2. Match funding opportunities</h3>
            <p>
              We compare your profile against study abroad scholarships, merit scholarships, and
              international funding opportunities for your preferred countries.
            </p>
          </article>
          <article className="info-card">
            <h3>3. Prioritize strong-fit scholarships</h3>
            <p>
              Instead of chasing every option, you get a shortlist of higher-fit scholarships that are
              more relevant to your profile and intake timeline.
            </p>
          </article>
        </div>
      </section>

      <section className="info-section">
        <div className="info-section-heading">
          <h2>What the scholarship checker evaluates</h2>
          <p>
            These signals improve match quality and help surface more relevant scholarships for
            bachelor&apos;s, master&apos;s, and PhD applicants.
          </p>
        </div>

        <div className="info-card-grid">
          <article className="info-card">
            <h3>Academic profile</h3>
            <p>Degree level, current qualification, GPA, and major help estimate overall program fit.</p>
          </article>
          <article className="info-card">
            <h3>Nationality and target countries</h3>
            <p>Many international scholarships are country-specific, so citizenship and destination choice matter early.</p>
          </article>
          <article className="info-card">
            <h3>Application timing</h3>
            <p>Intake selection helps prioritize scholarships that align better with the cycle you plan to apply in.</p>
          </article>
          <article className="info-card">
            <h3>Experience and test profile</h3>
            <p>Work experience and English scores can change which scholarship opportunities are more realistic.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HowItWorksPage;
