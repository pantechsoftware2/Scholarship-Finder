const fs = require('fs');
const path = require('path');

const buildDirectory = path.resolve(__dirname, '..', 'build');
const htmlPath = path.join(buildDirectory, 'index.html');
const sitemapPath = path.join(buildDirectory, 'sitemap.xml');
const robotsPath = path.join(buildDirectory, 'robots.txt');
const canonicalOrigin = 'https://www.fundmystudyabroad.com';
const publicPages = [
  { path: '/', file: 'index.html' },
  { path: '/how-it-works', file: 'how-it-works.html' },
  { path: '/countries', file: 'countries.html' },
];

function fail(message) {
  console.error(`SEO check failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(htmlPath)) {
  console.error('SEO check failed: build/index.html does not exist. Run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
const visibleText = body
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const wordCount = visibleText.match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/gi)?.length || 0;
const internalLinkCount = (body.match(/<a\s[^>]*href="(?:\/|#)/gi) || []).length;
const externalLinkCount = (body.match(/<a\s[^>]*href="https?:\/\//gi) || []).length;

if (wordCount < 300) fail(`expected at least 300 visible words, found ${wordCount}`);
if (internalLinkCount < 10) fail(`expected at least 10 internal links, found ${internalLinkCount}`);
if (externalLinkCount < 1) fail('expected at least one authoritative external link');
if (!visibleText.includes('Study Abroad Scholarships')) {
  fail('page-title phrase is missing from visible content');
}
if (!visibleText.includes('Scholarship Finder for study abroad funding')) {
  fail('H1 phrase is missing from supporting body content');
}
if (!html.includes('<link rel="canonical" href="https://www.fundmystudyabroad.com/"')) {
  fail('homepage canonical URL is missing or incorrect');
}
if (html.includes('twitter:site')) fail('unverified twitter:site metadata is present');
if (html.includes('SearchAction')) fail('unsupported SearchAction structured data is present');
if (!fs.existsSync(sitemapPath)) fail('build/sitemap.xml is missing');
if (!fs.existsSync(robotsPath)) fail('build/robots.txt is missing');

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = publicPages.map(({ path: pagePath }) => (
    pagePath === '/' ? `${canonicalOrigin}/` : `${canonicalOrigin}${pagePath}`
  ));
  const duplicateUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  const lastModifiedDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)]
    .map((match) => match[1]);

  if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    fail('sitemap.xml does not use the standard sitemap protocol namespace');
  }
  if (sitemapUrls.length !== expectedUrls.length) {
    fail(`expected ${expectedUrls.length} sitemap URLs, found ${sitemapUrls.length}`);
  }
  expectedUrls.forEach((url) => {
    if (!sitemapUrls.includes(url)) fail(`sitemap.xml is missing canonical URL ${url}`);
  });
  sitemapUrls.forEach((url) => {
    if (!url.startsWith(`${canonicalOrigin}/`)) {
      fail(`sitemap URL does not use the canonical www HTTPS origin: ${url}`);
    }
  });
  if (duplicateUrls.length) fail(`sitemap.xml contains duplicate URLs: ${duplicateUrls.join(', ')}`);
  if (/<(?:changefreq|priority)>/i.test(sitemap)) {
    fail('sitemap.xml includes changefreq or priority values that Google ignores');
  }
  if (lastModifiedDates.length !== expectedUrls.length) {
    fail('every sitemap URL must have an accurate lastmod date');
  }
  lastModifiedDates.forEach((date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      fail(`sitemap.xml contains an invalid lastmod date: ${date}`);
    }
  });
}

if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
    fail('robots.txt does not advertise the canonical www sitemap URL');
  }
}

publicPages.forEach(({ path: pagePath, file }) => {
  const pageFile = path.join(buildDirectory, file);
  const expectedCanonical = pagePath === '/' ? `${canonicalOrigin}/` : `${canonicalOrigin}${pagePath}`;

  if (!fs.existsSync(pageFile)) {
    fail(`build/${file} is missing`);
    return;
  }

  const pageHtml = fs.readFileSync(pageFile, 'utf8');
  if (!pageHtml.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
    fail(`${file} is missing its canonical www URL`);
  }
  if (!pageHtml.includes('href="/sitemap.xml"')) {
    fail(`${file} is missing a visible sitemap link`);
  }
});

const homepageSchemas = [
  ...html.matchAll(/<script[^>]*id="schema-homepage"[^>]*>([\s\S]*?)<\/script>/gi),
];
if (homepageSchemas.length !== 1) {
  fail(`expected one homepage JSON-LD block, found ${homepageSchemas.length}`);
} else {
  try {
    JSON.parse(homepageSchemas[0][1]);
  } catch (error) {
    fail(`homepage JSON-LD is invalid: ${error.message}`);
  }
}

if (!process.exitCode) {
  console.log(
    `SEO check passed: ${wordCount} words, ${internalLinkCount} internal links, ` +
      `${externalLinkCount} external links.`
  );
}
