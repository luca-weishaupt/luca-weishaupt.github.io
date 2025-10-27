# Publications Update System

This directory contains the system for managing Google Scholar publications data on the website.

## Files

- `assets/data/publications.json` - Static JSON file containing publications data
- `assets/js/scholar.js` - JavaScript that loads and displays publications
- `update_publications.py` - Python script to fetch latest data from Google Scholar
- `.github/workflows/update-publications.yml` - GitHub Action to auto-update daily

## How It Works

1. **Static Data First**: The website loads publications from `assets/data/publications.json` for fast, reliable display
2. **Live Fallback**: If static data is unavailable, it tries fetching live from Google Scholar via CORS proxies
3. **Automatic Updates**: A GitHub Action runs daily at 2 AM UTC to update the static data
4. **Manual Updates**: You can manually update by running `python update_publications.py`

## Manual Update

To manually update publications data:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the update script
python update_publications.py
```

This will fetch the latest data from Google Scholar and update `assets/data/publications.json`.

## GitHub Action

The workflow can also be triggered manually:
1. Go to Actions tab in GitHub
2. Select "Update Publications" workflow
3. Click "Run workflow"

## Data Format

The `publications.json` file contains:
- `summary`: Citation metrics (total citations, h-index, i10-index)
- `publications`: Array of publication objects with title, year, citations, and URL
- `last_updated`: Timestamp of last update
- `scholar_url`: Link to Google Scholar profile
