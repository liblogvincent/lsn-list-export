#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const USER_DATA_DIR_BASE = path.join(process.cwd(), '.browser-data');
const BROWSER_CHOICE = (process.env.LSN_BROWSER || 'chromium').toLowerCase();
const VALID_BROWSERS = { chromium: null, chrome: 'chrome', msedge: 'msedge' };
if (!(BROWSER_CHOICE in VALID_BROWSERS)) {
  console.error(`Invalid LSN_BROWSER value: "${BROWSER_CHOICE}". Use chromium, chrome, or msedge.`);
  process.exit(1);
}
const USER_DATA_DIR = path.join(USER_DATA_DIR_BASE, BROWSER_CHOICE);
const LIST_URL = process.argv[2];

if (!LIST_URL) {
  console.error('Usage: lsn-list-export <lead-list-url>');
  console.error('Example: lsn-list-export "https://www.linkedin.com/sales/lists/people/1234567890"');
  process.exit(1);
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v).replace(/\r?\n/g, ' ').trim();
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

(async () => {
  const launchOpts = {
    headless: false,
    viewport: { width: 1440, height: 900 },
  };
  if (VALID_BROWSERS[BROWSER_CHOICE]) launchOpts.channel = VALID_BROWSERS[BROWSER_CHOICE];
  console.log(`Launching ${BROWSER_CHOICE}...`);
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, launchOpts);
  const page = browser.pages()[0] || await browser.newPage();

  console.log('Navigating to list...');
  await page.goto(LIST_URL, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector('[data-anonymize="person-name"]', { timeout: 60000 });
  } catch {
    console.error('Could not find lead rows. If this is your first run, log in to LinkedIn in the browser window, then re-run the command.');
    await new Promise(() => {});
  }
  await page.waitForTimeout(2000);

  const collected = new Map();

  async function harvest() {
    const rows = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('tr').forEach(tr => {
        const nameEl = tr.querySelector('[data-anonymize="person-name"]');
        if (!nameEl) return;
        const titleEl = tr.querySelector('[data-anonymize="job-title"]');
        const companyEl = tr.querySelector('[data-anonymize="company-name"]');
        const locEl = tr.querySelector('[data-anonymize="location"]');
        const linkEl = tr.querySelector('a[href*="/sales/lead/"]');
        out.push({
          name: nameEl.textContent.trim(),
          title: titleEl ? titleEl.textContent.trim() : '',
          company: companyEl ? companyEl.textContent.trim() : '',
          location: locEl ? locEl.textContent.trim() : '',
          profileUrl: linkEl ? linkEl.href.split('?')[0].split(',')[0] : '',
        });
      });
      return out;
    });
    rows.forEach(r => {
      if (r.profileUrl && !collected.has(r.profileUrl)) collected.set(r.profileUrl, r);
    });
  }

  await harvest();
  let prev = -1;
  let stable = 0;
  for (let i = 0; i < 60 && stable < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(700);
    await harvest();
    if (collected.size === prev) stable++;
    else { stable = 0; prev = collected.size; }
    process.stdout.write(`\r  rows so far: ${collected.size}   `);
  }
  console.log('');

  for (let p = 0; p < 50; p++) {
    const nextBtn = await page.$('button[aria-label="Next"]:not([disabled])');
    if (!nextBtn) break;
    const before = collected.size;
    await nextBtn.click();
    await page.waitForTimeout(2500);
    await harvest();
    if (collected.size === before) break;
    console.log(`  page ${p + 2}: ${collected.size} rows`);
  }

  const rows = Array.from(collected.values());
  console.log(`\nTotal: ${rows.length} leads`);

  const headers = ['name', 'title', 'company', 'location', 'profileUrl'];
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => csvEscape(r[h])).join(',')))
    .join('\n');

  const outFile = path.join(process.cwd(), `leads-${Date.now()}.csv`);
  fs.writeFileSync(outFile, csv);
  console.log(`Wrote ${outFile}`);

  await browser.close();
})();
