#!/usr/bin/env python3
"""
Script to fetch Google Scholar publications and save them as JSON.
This should be run periodically to update the publications data.
"""

import json
from scholarly import scholarly
import sys

# Configuration
MAX_PUBLICATIONS = 10  # Number of publications to fetch

def fetch_publications(scholar_id):
    """Fetch publications from Google Scholar."""
    try:
        print(f"Fetching data for scholar ID: {scholar_id}")
        
        # Search for author by ID
        author = scholarly.search_author_id(scholar_id)
        author_filled = scholarly.fill(author)
        
        # Extract summary stats
        summary = {
            'total_citations': author_filled.get('citedby', 0),
            'h_index': author_filled.get('hindex', 0),
            'i10_index': author_filled.get('i10index', 0)
        }
        
        # Extract publications
        publications = []
        for pub in author_filled.get('publications', [])[:MAX_PUBLICATIONS]:
            pub_filled = scholarly.fill(pub)
            publications.append({
                'title': pub_filled.get('bib', {}).get('title', 'Untitled'),
                'year': pub_filled.get('bib', {}).get('pub_year', 'N/A'),
                'citations': pub_filled.get('num_citations', 0),
                'url': pub_filled.get('pub_url', '')
            })
        
        return {
            'summary': summary,
            'publications': publications,
            'last_updated': None  # Will be set by JS
        }
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def main():
    scholar_id = 'KUDBcugAAAAJ'
    
    data = fetch_publications(scholar_id)
    
    if data:
        # Save to JSON file
        output_file = 'assets/data/publications.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved publications to {output_file}")
        return 0
    else:
        print("Failed to fetch publications")
        return 1

if __name__ == '__main__':
    sys.exit(main())
