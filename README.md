# lsn-list-export

Export a **LinkedIn Sales Navigator Lead List** to CSV.

Runs locally on your machine using your own logged-in browser session. No credentials are stored, no data is sent to any third party, no AI/LLM is used.

## What it does

- Opens a browser window (bundled Chromium by default; can also use your installed Chrome or Microsoft Edge)
- You log in to LinkedIn / Sales Navigator manually (one time — session is cached)
- Navigates to the Lead List URL you give it
- Scrolls through the list, harvests `name`, `title`, `company`, `location`, `profileUrl`
- Writes a timestamped `leads-<timestamp>.csv` to the current directory

## Requirements

- Node.js 18+
- A LinkedIn Sales Navigator account (Core, Advanced, or Advanced Plus)

## Step-by-step setup (for non-developers)

### 1. Install Node.js

Node.js is the runtime that lets the script run on your computer.

- **Windows / macOS:** go to <https://nodejs.org/en/download> and download the **LTS** installer. Run it and click *Next* through the prompts.
- **Linux:** `sudo apt install nodejs npm` (Debian/Ubuntu) or use [nvm](https://github.com/nvm-sh/nvm).

To confirm it's installed, open a terminal (next step) and type:

```bash
node -v
```

You should see something like `v20.11.0`. Any version 18 or newer works.

### 2. Open a terminal

A terminal is a window where you type commands.

- **Windows:** press `Win + R`, type `powershell`, press Enter. Or right-click the Start menu → *Terminal* / *Windows PowerShell*.
- **macOS:** press `Cmd + Space`, type `Terminal`, press Enter.
- **Linux:** press `Ctrl + Alt + T`, or open *Terminal* from your applications menu.

### 3. Download the code

In the terminal, paste this and press Enter:

```bash
git clone https://github.com/liblogvincent/lsn-list-export.git
cd lsn-list-export
```

> Don't have `git`? Either [install Git](https://git-scm.com/downloads), **or** download the ZIP from <https://github.com/liblogvincent/lsn-list-export> (green *Code* button → *Download ZIP*), unzip it, then `cd` into the folder.

### 4. Install dependencies

```bash
npm install
```

This downloads Playwright and a bundled Chromium browser. First run takes a couple of minutes.

### 5. Run the export

```bash
node export.js "https://www.linkedin.com/sales/lists/people/<your-list-id>"
```

A browser window will open. Log in to LinkedIn (only the first time) — your session is cached for next time.

## Install (short version, for developers)

```bash
git clone https://github.com/liblogvincent/lsn-list-export.git
cd lsn-list-export
npm install
```

`npm install` automatically downloads the bundled Chromium browser via `playwright install`. If you'd rather use a browser already installed on your computer, see [Choosing a browser](#choosing-a-browser) below.

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

## Choosing a browser

By default the script uses the bundled Chromium that Playwright downloads during `npm install`. You can switch to your existing Chrome or Edge installation with the `LSN_BROWSER` environment variable:

```bash
# Bundled Chromium (default)
node export.js "<list-url>"

# Microsoft Edge (Windows / macOS)
LSN_BROWSER=msedge node export.js "<list-url>"

# Google Chrome
LSN_BROWSER=chrome node export.js "<list-url>"
```

PowerShell syntax (Windows):

```powershell
$env:LSN_BROWSER="msedge"; node export.js "<list-url>"
```

The chosen browser must already be installed on your system. Each browser keeps its own cached login under a separate folder inside `.browser-data/`.

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
