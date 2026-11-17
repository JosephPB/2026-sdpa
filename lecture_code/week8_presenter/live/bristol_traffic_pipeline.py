"""Bristol traffic: source -> documentation -> retrieve/save -> process -> plot.

Run from the week8 folder:
    python live/bristol_traffic_pipeline.py
    python live/bristol_traffic_pipeline.py --saved

The default makes a real GET request. --saved reads the response retrieved on
31 October 2026, without making a request. Add --no-show to save without opening
a plot window. Install requests, pandas and matplotlib before running.

The # %% markers divide the script into sections for teaching in an editor.
Source: Department for Transport, raw traffic counts, Open Government Licence
v3.0. These are observations on survey days, not continuous traffic monitoring.
"""

from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import argparse
import json

import matplotlib.pyplot as plt
import pandas as pd
import requests


# %% 1. Source and documentation: what does one record represent?
# Read https://roadtraffic.dft.gov.uk/api-documentation (Raw Counts).
# One record is one count point, on one date, in one hour, in one direction.
URL = 'https://roadtraffic.dft.gov.uk/api/raw-counts'
PARAMS = {
    'filter[local_authority_id]': 144,  # Bristol in this API
    'filter[year]': 2023,
    'page[size]': 10000,
}
SITE_ID = 6401                       # The A38 example from Week 7
SURVEY_DATE = '2023-07-13'

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--saved', action='store_true', help='Use the bundled response; no network request.')
parser.add_argument('--no-show', action='store_true', help='Save the graph without opening a window.')
args = parser.parse_args()

ROOT = Path(__file__).resolve().parents[1]
mode = 'saved' if args.saved else 'live'
OUTPUT = ROOT / 'output' / 'bristol-pipeline' / mode
RAW = OUTPUT / 'raw'
RAW.mkdir(parents=True, exist_ok=True)
started_at = datetime.now(timezone.utc).isoformat()

print('1. SOURCE: DfT raw traffic counts, Bristol, 2023')
print('Question: how did car and taxi counts vary through one observed day?')


# %% 2. Retrieve and save: keep the original before changing anything.
print('\n2. RETRIEVE + SAVE')
if args.saved:
    print('SAVED DATA: retrieved 31 October 2026. No live request.')
    raw_text = (ROOT / 'data' / 'raw' / 'traffic-2023.json').read_text(encoding='utf-8')
else:
    print('LIVE GET:', URL)
    try:
        response = requests.get(URL, params=PARAMS,
                                headers={'Accept': 'application/json'}, timeout=30)
        response.raise_for_status()
    except requests.RequestException as error:
        raise SystemExit(
            f'Could not retrieve the live data: {error}\n'
            'Run again with --saved to use the labelled classroom copy.'
        ) from error
    print('Status:', response.status_code)
    print('Content-Type:', response.headers.get('Content-Type'))
    print('Requested URL:', response.url)
    raw_text = response.text

(RAW / 'page-1.json').write_text(raw_text, encoding='utf-8')
print('Start of the response body:', raw_text[:160])


# %% 3. Parse JSON: text becomes dictionaries, lists and numeric values.
print('\n3. PARSE JSON')
payload = json.loads(raw_text) if args.saved else response.json()
if not isinstance(payload, dict) or not isinstance(payload.get('data'), list):
    raise ValueError('Expected a JSON object containing a data list. Inspect the saved body.')

print('First record:', payload['data'][0] if payload['data'] else 'No records')
records = payload['data'].copy()
expected_total = payload['total']
print('Records on page 1:', len(records), '| API total:', expected_total)

# A large page size does not guarantee a complete download. Follow next_page_url.
page_number = 1
seen_urls = set()
while payload.get('next_page_url'):
    if args.saved:
        raise ValueError('The saved response is incomplete: another page is required.')
    next_url = urljoin(response.url, payload['next_page_url'])
    destination = urlsplit(next_url)
    if (destination.scheme, destination.netloc) != ('https', 'roadtraffic.dft.gov.uk'):
        raise ValueError('Unexpected host in the next-page link; inspect the response.')
    if next_url in seen_urls or page_number >= 100:
        raise ValueError('Pagination repeated or exceeded 100 pages; inspect the query.')
    seen_urls.add(next_url)
    response = requests.get(next_url, headers={'Accept': 'application/json'}, timeout=30)
    response.raise_for_status()
    page_number += 1
    (RAW / f'page-{page_number}.json').write_text(response.text, encoding='utf-8')
    payload = response.json()
    if not isinstance(payload, dict) or not isinstance(payload.get('data'), list):
        raise ValueError('Expected a JSON object containing a data list on each page.')
    records.extend(payload['data'])
    print(f'Page {page_number}: {len(payload["data"])} records; collected {len(records)}')

if len(records) != expected_total:
    raise ValueError(f'Collected {len(records)} records; API total was {expected_total}.')
if not records:
    raise ValueError('No observations returned. Check the source and query filters.')

metadata = {
    'source': URL, 'documentation': 'https://roadtraffic.dft.gov.uk/api-documentation',
    'parameters': PARAMS, 'mode': mode, 'run_started_at_utc': started_at,
    'source_retrieved': '2026-10-31' if args.saved else started_at,
    'records': len(records), 'api_total': expected_total,
    'raw_pages': [f'raw/page-{n}.json' for n in range(1, page_number + 1)],
    'attribution': 'Department for Transport; Open Government Licence v3.0',
    'licence': 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
    'meaning': 'Observed site/date/hour/direction counts; not annual averages.',
}
(OUTPUT / 'source.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')


# %% 4. Process: build a labelled table, select columns and check values.
print('\n4. PROCESS: JSON records -> pandas DataFrame')
df = pd.DataFrame(records)
print('Original shape:', df.shape)
print(df[['count_point_id', 'road_name', 'count_date', 'hour',
          'direction_of_travel', 'cars_and_taxis']].head().to_string(index=False))

# Check that the publisher applied the requested filters.
if (not df['local_authority_id'].eq(PARAMS['filter[local_authority_id]']).all()
        or not df['year'].eq(PARAMS['filter[year]']).all()):
    raise ValueError('Some records are outside the requested Bristol/year subset.')

counts = df[['count_point_id', 'road_name', 'count_date', 'hour',
             'direction_of_travel', 'cars_and_taxis']].copy()
counts = counts.rename(columns={'cars_and_taxis': 'cars'})  # cars includes taxis
counts['count_date'] = pd.to_datetime(counts['count_date'], format='%Y-%m-%d', errors='raise')
for column in ['count_point_id', 'hour', 'cars']:
    counts[column] = pd.to_numeric(counts[column], errors='raise')

print('\nColumn types:\n', counts.dtypes)
print('\nMissing values:\n', counts.isna().sum())
key = ['count_point_id', 'count_date', 'hour', 'direction_of_travel']
print('Duplicate observations:', counts.duplicated(key).sum())
if counts.isna().any().any() or counts.duplicated(key).any():
    raise ValueError('Missing values or duplicate observations need investigation before aggregation.')
if not counts['hour'].between(0, 23).all() or not counts['hour'].mod(1).eq(0).all():
    raise ValueError('Hours must be whole numbers from 0 to 23.')
if counts['cars'].lt(0).any() or not counts['cars'].mod(1).eq(0).all():
    raise ValueError('Vehicle counts must be nonnegative whole numbers.')
counts.to_csv(OUTPUT / 'traffic-counts.csv', index=False)


# %% 5. Summarise: combine directions within the same site, date and hour.
print('\n5. SUMMARISE: one row per site/date/hour')
# Adding two directions is sensible here. Adding different sites or survey dates
# would answer a different question. A missing hour must not become a zero count.
hourly = counts.groupby(['count_point_id', 'count_date', 'hour'], as_index=False)['cars'].sum()
hourly.to_csv(OUTPUT / 'hourly-counts.csv', index=False)

day = hourly.loc[
    (hourly['count_point_id'] == SITE_ID) &
    (hourly['count_date'] == pd.Timestamp(SURVEY_DATE))
].sort_values('hour')
if day.empty:
    raise ValueError('The example site/date is absent. Inspect the table before choosing another.')
print('Selected site:', SITE_ID, '| Survey date:', SURVEY_DATE)
print(day.to_string(index=False))
day.to_csv(OUTPUT / 'plotted-day.csv', index=False)
selected = counts.loc[(counts['count_point_id'] == SITE_ID) &
                      (counts['count_date'] == pd.Timestamp(SURVEY_DATE))]
print('Recorded directions:', sorted(selected['direction_of_travel'].unique()))
print('Directions recorded in each hour:\n', selected.groupby('hour')['direction_of_travel'].nunique())
road_name = selected['road_name'].iloc[0]

# Convert the selected columns to NumPy arrays to inspect their numeric values.
hours = day['hour'].to_numpy()
cars = day['cars'].to_numpy()
print('Hours as a NumPy array:', hours)
print('Counts as a NumPy array:', cars)


# %% 6. Use: show how the observed count changes through the day.
print('\n6. VISUALISE: numeric arrays -> Matplotlib graph')
# Break the line if an hour was not observed; do not imply a measured zero.
plot_hours = list(range(int(hours.min()), int(hours.max()) + 1))
plot_cars = day.set_index('hour')['cars'].reindex(plot_hours).to_numpy()
fig, ax = plt.subplots(figsize=(10, 5), layout='constrained')
ax.plot(plot_hours, plot_cars, marker='o', color='#a71930')
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars and taxis counted')
ax.set_title(f'{road_name}, Bristol · site {SITE_ID} · {pd.Timestamp(SURVEY_DATE):%d %B %Y}')
ax.set_xticks(plot_hours)
ax.set_ylim(bottom=0)
ax.grid(axis='y', alpha=0.25)
fig.supxlabel('Source: Department for Transport · observed survey hours · recorded directions combined', fontsize=9)
fig.savefig(OUTPUT / 'bristol-traffic.png', dpi=160)
print('Saved raw JSON, source details, processed CSVs and the graph to:', OUTPUT)
print('This is one observed day at one site, not a typical day or an annual average.')
if not args.no_show:
    plt.show()
plt.close(fig)
