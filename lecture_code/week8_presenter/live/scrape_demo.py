"""Retrieve, inspect and parse the public Books to Scrape website.

Default: live HTTPS request. --saved explicitly uses the captured public page.
The site is designed for scraping practice; its prices/ratings are artificial.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import json
import requests
from bs4 import BeautifulSoup
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://books.toscrape.com/'


def main(saved=False):
    output = ROOT / 'output'
    output.mkdir(exist_ok=True)
    if saved:
        print('SAVED public webpage: no live request.')
        html = (ROOT / 'data/raw/books-to-scrape.html').read_text(encoding='utf-8')
    else:
        print('LIVE HTTPS:', URL)
        page = requests.get(URL, timeout=20)
        page.raise_for_status()
        page.encoding = 'utf-8'
        print(page.status_code)
        html = page.text
    (output / 'books-page.html').write_text(html, encoding='utf-8')
    (output / 'books-request.json').write_text(json.dumps({
        'url': URL, 'mode': 'saved' if saved else 'live',
        'demonstrated_at': datetime.now(timezone.utc).isoformat(),
        'description': 'Scraping-practice website; prices/ratings are artificial.'
    }, indent=2), encoding='utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    prices = soup.select('article.product_pod .price_color')
    if not prices:
        raise ValueError('No matching prices: inspect the HTML and selector.')
    print('First selected element:', prices[0])
    first_three = [price.get_text(strip=True) for price in prices[:3]]
    print(first_three)
    rows = []
    for book in soup.select('article.product_pod'):
        title = book.select_one('h3 a')
        price = book.select_one('.price_color')
        if title is None or price is None:
            raise ValueError('A book is missing a title or price; inspect the source.')
        text = price.get_text(strip=True)
        rows.append({'title': title['title'],
                     'price_gbp': float(text.removeprefix('£'))})
    pd.DataFrame(rows).to_csv(output / 'scraped-books.csv', index=False)
    print('A missing selector:', soup.select('.missing'))
    print(f'Saved the original HTML and {len(rows)} book records from this page.')
    print('This page is a preview, not the whole catalogue. Check its next-page link.')
    return rows


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--saved', action='store_true')
    args = parser.parse_args()
    try:
        main(args.saved)
    except requests.RequestException as error:
        raise SystemExit(f'Live request failed: {error}\nUse --saved explicitly to demonstrate the captured public page.')
