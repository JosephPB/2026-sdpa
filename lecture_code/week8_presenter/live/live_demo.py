"""API lecture demonstration. Cached by default; --live requests the DfT API.

Run from week8: python live/live_demo.py [--live]
The cached path constructs a requests.Response from a labelled saved body so
the same inspection/parsing steps work without claiming a live request occurred.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import json
import requests
import pandas as pd
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output'
URL = 'https://roadtraffic.dft.gov.uk/api/raw-counts'
PARAMS = {'filter[local_authority_id]': 144,
          'filter[year]': 2023, 'page[size]': 10000}


def get_response(live=False):
    if live:
        print('LIVE GET:', URL)
        response = requests.get(URL, params=PARAMS, timeout=20)
        response.raise_for_status()
        return response
    print('SAVED RESPONSE: DfT data retrieved 31 October 2026. No live request.')
    response = requests.Response()
    response.status_code = 200
    response._content = (ROOT / 'data/raw/traffic-2023.json').read_bytes()
    response.encoding = 'utf-8'
    response.headers['Content-Type'] = 'application/json'
    response.url = requests.Request('GET', URL, params=PARAMS).prepare().url
    return response


def collect_records(response, live=False):
    """Follow this API's documented page links, preserving every page."""
    records, seen = [], set()
    for page_number in range(1, 101):
        response.raise_for_status()
        if response.url in seen:
            raise ValueError('Pagination repeated a URL; inspect before continuing.')
        seen.add(response.url)
        payload = response.json()
        if not isinstance(payload, dict) or not isinstance(payload.get('data'), list):
            raise ValueError('Expected a dict containing a data list.')
        (OUTPUT / f'traffic-page-{page_number}.json').write_text(
            response.text, encoding='utf-8')
        records.extend(payload['data'])
        next_url = payload.get('next_page_url')
        if not next_url:
            if isinstance(payload.get('total'), int) and len(records) != payload['total']:
                raise ValueError('Record count differs from the API total.')
            return records
        if not live:
            raise ValueError('Saved response has another page; a full saved collection is needed.')
        # Only follow pagination links on the original API host and scheme.
        from urllib.parse import urlsplit, urljoin
        next_url = urljoin(response.url, next_url)
        if (urlsplit(next_url).scheme, urlsplit(next_url).netloc) != ('https', 'roadtraffic.dft.gov.uk'):
            raise ValueError('Unexpected pagination destination.')
        response = requests.get(next_url, timeout=20)
    raise ValueError('More than 100 pages; inspect the request before continuing.')


def main(live=False):
    OUTPUT.mkdir(exist_ok=True)
    # Request, check and inspect.
    response = get_response(live)
    print(response.status_code)
    print(response.headers.get('Content-Type'))
    print(response.text[:200])
    (OUTPUT / 'traffic-response.json').write_text(response.text, encoding='utf-8')
    (OUTPUT / 'request-metadata.json').write_text(json.dumps({
        'mode': 'live' if live else 'saved', 'url': response.url,
        'parameters': PARAMS, 'demonstrated_at': datetime.now(timezone.utc).isoformat(),
        'source_retrieved': 'live request above' if live else '2026-10-31',
    }, indent=2), encoding='utf-8')

    # Parse, then inspect the intermediate objects.
    payload = response.json()
    print(list(payload)[:4])
    print(len(payload['data']))
    if payload['data']:
        print(payload['data'][0]['road_name'])
    records = collect_records(response, live)
    df = pd.DataFrame(records)
    if df.empty:
        raise ValueError('No records returned: inspect source and filters.')

    # Select fields and store a processed table separately from raw responses.
    counts = df[['count_point_id', 'count_date', 'hour',
                 'direction_of_travel', 'cars_and_taxis']].copy()
    counts = counts.rename(columns={'cars_and_taxis': 'cars'})
    counts['cars'] = pd.to_numeric(counts['cars'], errors='raise')
    print(counts.dtypes)
    print(counts.isna().sum())
    counts.to_csv(OUTPUT / 'traffic-counts.csv', index=False)
    hourly = counts.groupby(
        ['count_point_id', 'count_date', 'hour'], as_index=False
    )['cars'].sum(min_count=1)
    day = hourly.loc[(hourly.count_point_id == 6401) &
                     (hourly.count_date == '2023-07-13')].sort_values('hour')
    if day.empty:
        raise ValueError('Expected example day is absent; inspect the returned sample.')
    fig, ax = plt.subplots(figsize=(9, 4), layout='constrained')
    ax.plot(day['hour'], day['cars'], 'o-', color='#a71930')
    ax.set(xlabel='Hour starting', ylabel='Cars and taxis counted',
           title='A38, site 6401 · 13 July 2023')
    fig.savefig(OUTPUT / 'traffic-demo.png', dpi=140)
    plt.close(fig)
    print(f'Saved {len(counts)} records and the plot in {OUTPUT}')
    return counts


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true')
    args = parser.parse_args()
    try:
        main(args.live)
    except requests.RequestException as error:
        raise SystemExit(f'Live request failed: {error}\nRun without --live to use the labelled saved response.')
