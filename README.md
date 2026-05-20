# lsn-list-export

Export a **LinkedIn Sales Navigator Lead List** to CSV.

Runs locally on your machine using your own logged-in browser session. No credentials are stored, no data is sent to any third party, no AI/LLM is used.

## What it does

- Opens a Chromium window
- You log in to LinkedIn / Sales Navigator manually (one time — session is cached)
- Navigates to the Lead List URL you give it
- Scrolls through the list, harvests `name`, `title`, `company`, `location`, `profileUrl`
- Writes a timestamped `leads-<timestamp>.csv` to the current directory

## Requirements

- Node.js 18+
- A LinkedIn Sales Navigator account (Core, Advanced, or Advanced Plus)

## Install

```bash
git clone https://github.com/<you>/lsn-list-export.git
cd lsn-list-export
npm install
```

`npm install` automatically downloads the bundled Chromium browser via `playwright install`.

## Usage

```bash
node export.js "https://www.linkedin.com/sales/lists/people/<list-id>"
```

The first run opens a browser window. Log in to LinkedIn, complete any MFA, and let it land on Sales Navigator. The script will detect the list and start exporting. Your session is cached in `.browser-data/` so subsequent runs are passwordless.

When finished, you'll see:

```
Total: 42 leads
Wrote /path/to/leads-1779270179027.csv
```

## Output format

```csv
name,title,company,location,profileUrl
Sandra Soriano,Senior Social Media Operations Manager,Hilti Group,"Paris, Île-de-France, France",https://www.linkedin.com/sales/lead/ACwAAAZtVH4BDVf1xDEVjs0OLVYigGJP0D4rCHo
```

## How to find your Lead List URL

1. Go to <https://www.linkedin.com/sales/lists/people>
2. Click the list you want to export
3. Copy the URL from the address bar — it looks like  
   `https://www.linkedin.com/sales/lists/people/7462782930424209409`

## Limitations

- **Email is not exported.** Sales Navigator does not display email on the list view. Use a separate enrichment provider if you need it.
- **One list at a time.** Pass the URL explicitly per run.
- **Selectors may break** if LinkedIn restructures the Sales Navigator DOM. The script targets `data-anonymize="*"` attributes, which have been stable for years, but no guarantees.

## Troubleshooting

| Problem | Fix |
|---|---|
| Browser opens but page is blank | Log in manually in the window; the script waits up to 60s for the list to load |
| "Could not find lead rows" | Make sure the URL is a Lead List, not a Saved Search or Account List |
| Want to start fresh | Delete `.browser-data/` to clear the cached session |

## Legal

LinkedIn's User Agreement prohibits automated data collection at scale. This tool is intended for **manual, occasional export of your own saved Lead Lists** — exactly what you can already do by hand, just faster. Use responsibly. You are responsible for compliance with LinkedIn's terms.

## License

MIT
