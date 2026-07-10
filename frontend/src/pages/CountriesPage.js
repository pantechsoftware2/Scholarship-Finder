import React from 'react';
import '../styles/InfoPages.css';

function CountriesPage() {
  return (
    <main className="info-page">
      <nav className="info-nav" aria-label="Primary navigation">
        <a href="/">Home</a>
        <a href="/how-it-works">How It Works</a>
        <a href="/#scholarship-faq">FAQ</a>
        <a href="/countries" className="active">Countries</a>
      </nav>

      <section className="info-hero">
        <div className="info-hero-copy">
          <span className="info-eyebrow">Popular Scholarship Destinations</span>
          <h1>Compare scholarship countries with a cleaner study abroad strategy.</h1>
          <p>
            Students commonly use this scholarship checker to search for scholarships in the USA, UK,
            Canada, Australia, and Germany, along with other emerging study abroad destinations.
          </p>
          <p>
            This destination page brings that country section into a full standalone view so users can
            explore it directly from the navigation instead of landing on a website not found message.
          </p>
          <div className="info-actions">
            <a className="info-btn-primary" href="/#scholarship-form">Check your target countries</a>
            <a className="info-btn-secondary" href="/how-it-works">See how matching works</a>
          </div>
        </div>

        <aside className="info-panel">
          <h2>Country planning tips</h2>
          <ul className="info-bullet-list">
            <li>Choose multiple target countries to widen scholarship coverage.</li>
            <li>Compare destinations based on profile strength, not just popularity.</li>
            <li>Use intake timing to decide which country list to prioritize first.</li>
          </ul>
        </aside>
      </section>

      <section className="info-section">
        <div className="info-section-heading">
          <h2>Popular scholarship destinations</h2>
          <p>
            This expands the homepage countries section into a dedicated destination guide with more
            context for international scholarship research.
          </p>
        </div>

        <div className="country-chip-row">
          <a href="/#scholarship-form">USA scholarships</a>
          <a href="/#scholarship-form">UK scholarships</a>
          <a href="/#scholarship-form">Canada scholarships</a>
          <a href="/#scholarship-form">Australia scholarships</a>
          <a href="/#scholarship-form">Germany scholarships</a>
        </div>

        <div className="info-card-grid">
          <article className="info-card">
            <h3>USA scholarships</h3>
            <p>Often searched for graduate funding, university scholarships, and research-linked study abroad opportunities.</p>
          </article>
          <article className="info-card">
            <h3>UK scholarships</h3>
            <p>Popular among students targeting shorter postgraduate programs and institution-led scholarship support.</p>
          </article>
          <article className="info-card">
            <h3>Canada scholarships</h3>
            <p>Commonly compared for international student funding, research pathways, and strong long-term study outcomes.</p>
          </article>
          <article className="info-card">
            <h3>Australia scholarships</h3>
            <p>Frequently explored for master&apos;s and PhD funding, especially where research profile matters.</p>
          </article>
          <article className="info-card">
            <h3>Germany scholarships</h3>
            <p>Often attractive for technical and research-oriented students comparing cost and scholarship opportunities.</p>
          </article>
        </div>
      </section>

      <section className="info-section">
        <div className="info-section-heading">
          <h2>How to choose the right country mix</h2>
          <p>
            Stronger scholarship planning usually comes from comparing destinations together rather than
            overcommitting to one country too early.
          </p>
        </div>

        <div className="info-card-grid info-card-grid-three">
          <article className="info-card">
            <h3>Start broad</h3>
            <p>Select multiple target countries in the form to discover a wider set of scholarship opportunities.</p>
          </article>
          <article className="info-card">
            <h3>Refine by fit</h3>
            <p>Use your GPA, major, work experience, and nationality to identify where your profile is strongest.</p>
          </article>
          <article className="info-card">
            <h3>Prioritize by intake</h3>
            <p>Once you know which countries fit best, focus on the scholarships that align with your next application cycle.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default CountriesPage;
