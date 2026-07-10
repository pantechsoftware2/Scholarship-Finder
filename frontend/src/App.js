import React, { useEffect, useMemo, useState } from 'react';
import InputForm from './components/InputForm';
import CountriesPage from './pages/CountriesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import Results from './pages/Results';
import ThankYou from './pages/ThankYou';
import './styles/App.css';
import { getApiBaseUrl } from './config';

const SITE_URL = 'https://scholarship-finder-frontend.vercel.app';

const STAGE_SEO = {
  input: {
    title: 'Scholarship Finder for Study Abroad Scholarships | AI Scholarship Match Tool',
    description:
      'Find international scholarships, fully funded scholarships, merit scholarships, and study abroad funding with an AI scholarship finder built for bachelor, master, and PhD applicants.',
    robots: 'index, follow',
  },
  results: {
    title: 'Scholarship Match Results | Scholarship Finder',
    description:
      'Personalized scholarship matches generated from your academic profile, target countries, and intake preferences.',
    robots: 'noindex, nofollow',
  },
  thankyou: {
    title: 'Scholarship Report Sent | Scholarship Finder',
    description:
      'Your scholarship report has been sent. Review your matched scholarships and application strategy from your inbox.',
    robots: 'noindex, nofollow',
  },
  howItWorks: {
    title: 'How Scholarship Finder Works | AI Scholarship Matching Process',
    description:
      'Learn how Scholarship Finder matches students with study abroad scholarships using nationality, degree level, GPA, major, intake, and profile strength.',
    robots: 'index, follow',
  },
  countries: {
    title: 'Scholarship Countries Guide | USA, UK, Canada, Australia, Germany',
    description:
      'Explore popular scholarship destinations including the USA, UK, Canada, Australia, and Germany for international students searching for study abroad funding.',
    robots: 'index, follow',
  },
  notfound: {
    title: 'Page Not Found | Scholarship Finder',
    description:
      'The page you requested does not exist. Return to Scholarship Finder to discover international scholarships and study abroad funding opportunities.',
    robots: 'noindex, nofollow',
  },
};

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertStructuredData(id, payload) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(payload);
}

function App() {
  const [currentStage, setCurrentStage] = useState('input');
  const [userProfile, setUserProfile] = useState(null);
  const [scholarshipResults, setScholarshipResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = getApiBaseUrl();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '');
  const supportedPath = useMemo(() => {
    if (normalizedPath === '/') return 'home';
    if (normalizedPath === '/how-it-works') return 'howItWorks';
    if (normalizedPath === '/countries') return 'countries';
    return 'notfound';
  }, [normalizedPath]);
  const hasUnsupportedPath = supportedPath === 'notfound';
  const gaMeasurementId = (process.env.REACT_APP_GA_MEASUREMENT_ID || '').trim();

  const activeSeoState = useMemo(() => {
    if (supportedPath === 'howItWorks') {
      return STAGE_SEO.howItWorks;
    }
    if (supportedPath === 'countries') {
      return STAGE_SEO.countries;
    }
    if (hasUnsupportedPath) {
      return STAGE_SEO.notfound;
    }

    return STAGE_SEO[currentStage] || STAGE_SEO.input;
  }, [currentStage, hasUnsupportedPath, supportedPath]);

  const handleCalculate = async (profile) => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${apiUrl}/api/calculate-scholarships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(profile),
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        let errorMessage = 'Unable to calculate scholarships right now.';

        if (result && typeof result.detail === 'string') {
          errorMessage = result.detail;
        } else if (result && Array.isArray(result.detail)) {
          errorMessage = result.detail
            .map((entry) => `${entry.loc?.join('.')}: ${entry.msg}`)
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

  useEffect(() => {
    const canonicalUrl = supportedPath === 'home'
      ? `${SITE_URL}/`
      : `${SITE_URL}${normalizedPath}`;

    document.title = activeSeoState.title;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: activeSeoState.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: activeSeoState.robots,
    });
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: activeSeoState.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: activeSeoState.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: `${SITE_URL}/og-image.svg`,
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: 'Scholarship Finder',
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: activeSeoState.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: activeSeoState.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: `${SITE_URL}/og-image.svg`,
    });
    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    });

    if (supportedPath === 'howItWorks') {
      upsertStructuredData('schema-homepage', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'How Scholarship Finder Works',
        url: canonicalUrl,
        description: activeSeoState.description,
      });
      return;
    }

    if (supportedPath === 'countries') {
      upsertStructuredData('schema-homepage', {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Scholarship Countries Guide',
        url: canonicalUrl,
        description: activeSeoState.description,
      });
      return;
    }

    if (!hasUnsupportedPath && currentStage === 'input') {
      upsertStructuredData('schema-homepage', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'Scholarship Finder',
            url: canonicalUrl,
            description:
              'AI scholarship finder for study abroad scholarships, fully funded scholarships, and international student funding opportunities.',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${canonicalUrl}#scholarship-form`,
              'query-input': 'required name=student scholarship profile',
            },
          },
          {
            '@type': 'Organization',
            name: 'Scholarship Finder',
            url: canonicalUrl,
            logo: `${SITE_URL}/favicon.svg`,
          },
        ],
      });
      return;
    }

    const existingSchema = document.getElementById('schema-homepage');
    if (existingSchema) {
      existingSchema.remove();
    }
  }, [activeSeoState, currentStage, hasUnsupportedPath, normalizedPath, supportedPath]);

  useEffect(() => {
    if (!gaMeasurementId || typeof window === 'undefined') {
      return undefined;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    const existingScript = document.querySelector('script[data-ga-loader="true"]');
    if (existingScript) {
      window.gtag('config', gaMeasurementId, {
        page_path: window.location.pathname + window.location.search,
      });
      return undefined;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    script.dataset.gaLoader = 'true';
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', gaMeasurementId, {
      page_path: window.location.pathname + window.location.search,
    });

    return undefined;
  }, [gaMeasurementId, supportedPath, currentStage]);

  return (
    <div className="app">
      {supportedPath === 'howItWorks' && <HowItWorksPage />}

      {supportedPath === 'countries' && <CountriesPage />}

      {hasUnsupportedPath && (
        <main className="not-found-state" aria-labelledby="not-found-title">
          <p className="not-found-eyebrow">404</p>
          <h1 id="not-found-title">This page is not available.</h1>
          <p>
            Scholarship Finder only supports the homepage experience right now. Return to the main
            scholarship matcher to explore study abroad scholarships and funding options.
          </p>
          <a className="not-found-link" href="/">
            Go to Scholarship Finder
          </a>
        </main>
      )}

      {supportedPath === 'home' && currentStage === 'input' && (
        <InputForm
          onCalculate={handleCalculate}
          loading={loading}
          error={error}
        />
      )}

      {supportedPath === 'home' && currentStage === 'results' && (
        <Results
          results={scholarshipResults}
          profile={userProfile}
          onLeadCaptured={() => setCurrentStage('thankyou')}
          onBack={() => setCurrentStage('input')}
        />
      )}

      {supportedPath === 'home' && currentStage === 'thankyou' && (
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
