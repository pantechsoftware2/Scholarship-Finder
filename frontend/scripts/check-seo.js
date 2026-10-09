const fs = require('fs');
const path = require('path');

const buildDirectory = path.resolve(__dirname, '..', 'build');
const htmlPath = path.join(buildDirectory, 'index.html');
const sitemapPath = path.join(buildDirectory, 'sitemap.xml');

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
