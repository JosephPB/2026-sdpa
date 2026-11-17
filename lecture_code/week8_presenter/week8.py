"""Week 8 examples. Run Setup, then any numbered cell. Request cells make real GETs."""
# %% Setup
from pathlib import Path
import os
ROOT = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
os.chdir(ROOT)
SETUP = (ROOT / "live/local_setup.py").read_text()

# %% 1: array-stacking
exec(SETUP, globals())
x = np.array([10, 20, 30])
y = np.array([1, 2, 3])

print(np.column_stack((x, y)))  # three rows, two columns
print(np.vstack((x, y)))        # two rows, three columns
plt.show()
plt.close("all")

# %% 2: slice-code
exec(SETUP, globals())
import numpy as np

a = np.arange(20).reshape(4, 5)
print(a[1:3, 1:4])
print(a[1].shape)
print(a[1:2].shape)
plt.show()
plt.close("all")

# %% 3: matrix-code
exec(SETUP, globals())
A = np.array([[1, 2], [3, 4]])
B = np.array([[2, 1], [0, 3]])

print(A * B)
print(A @ B)
plt.show()
plt.close("all")

# %% 4: dataframe-code
exec(SETUP, globals())
import pandas as pd

traffic = pd.read_csv('data/bristol_traffic_2023.csv')

print(traffic.iloc[0:3, 0:2])      # positions; stop excluded
print(traffic.loc[0:2, ['cars']]) # labels; stop included here

busy = traffic.loc[traffic['cars'] > 300,
                   ['count_point_id', 'hour', 'cars']]
print(busy.head())
plt.show()
plt.close("all")

# %% 5: plot-code
exec(SETUP, globals())
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(day['hour'], day['cars'], 'o-')
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars and taxis counted')
plt.show()
plt.show()
plt.close("all")

# %% 6: files
exec(SETUP, globals())
import pandas as pd
from PIL import Image

traffic = pd.read_csv(
    'data/bristol_traffic_2023.csv')
RGB = np.array(
    Image.open('assets/duck.png')
         .convert('RGB'))
print(RGB.shape)
plt.show()
plt.close("all")

# %% 7: request-code
exec(SETUP, globals())
import requests
import json

url = ('https://roadtraffic.dft.gov.uk/api/raw-counts'
       '?filter[local_authority_id]=144&filter[year]=2023'
       '&page[size]=2&fields=road_name,cars_and_taxis')
response = requests.get(url, timeout=20)
response.raise_for_status()
print(json.dumps(response.json()['data'], indent=2))
plt.show()
plt.close("all")

# %% 8: request-code
exec(SETUP, globals())
base = 'https://roadtraffic.dft.gov.uk/api/raw-counts'
authority, year = 144, 2023
url = (f'{base}?filter[local_authority_id]={authority}'
       f'&filter[year]={year}&page[size]=2'
       '&fields=road_name,cars_and_taxis')
response = requests.get(url, timeout=20)
response.raise_for_status()
print(json.dumps(response.json()['data'], indent=2))
plt.show()
plt.close("all")

# %% 9: request-code
exec(SETUP, globals())
base = 'https://roadtraffic.dft.gov.uk/api/raw-counts'
params = {'filter[local_authority_id]': 144,
          'filter[year]': 2023, 'page[size]': 2,
          'fields': 'road_name,cars_and_taxis'}
response = requests.get(base, params=params, timeout=20)
response.raise_for_status()
print(json.dumps(response.json()['data'], indent=2))
plt.show()
plt.close("all")

# %% 10: save-code
exec(SETUP, globals())
print(response.headers.get('Content-Type'))
print(response.text[:200])
plt.show()
plt.close("all")

# %% 11: save-code
exec(SETUP, globals())
with open('output/traffic-response.json',
          'w', encoding='utf-8') as file:
    file.write(response.text)
plt.show()
plt.close("all")

# %% 12: save-code
exec(SETUP, globals())
from pathlib import Path

Path('output/traffic-response.json').write_text(
    response.text, encoding='utf-8')
plt.show()
plt.close("all")

# %% 13: parse-code
exec(SETUP, globals())
payload = response.json()
print(list(payload)[:4])

records = payload['data']
print(records)
print(len(records))

df = pd.DataFrame(records)
print(df)
plt.show()
plt.close("all")

# %% 14: pagination
exec(SETUP, globals())
print(payload.keys())
print(payload.get('next_page_url'))
print(response.links.get('next'))
plt.show()
plt.close("all")

# %% 15: process-code
exec(SETUP, globals())
counts = df[['road_name', 'cars_and_taxis']].copy()
counts = counts.rename(columns={'cars_and_taxis': 'cars'})

print(counts.dtypes)
print(counts.isna().sum())
counts.to_csv('output/traffic-counts.csv', index=False)
plt.show()
plt.close("all")

# %% 16: scrape-code
exec(SETUP, globals())
from bs4 import BeautifulSoup

page = requests.get('https://books.toscrape.com/', timeout=20)
page.raise_for_status()
page.encoding = 'utf-8'
soup = BeautifulSoup(page.text, 'html.parser')

prices = soup.select('article.product_pod .price_color')
print([price.get_text(strip=True) for price in prices[:3]])
plt.show()
plt.close("all")

# %% 17: ref-memory
exec(SETUP, globals())
original = np.array([10, 20, 30])
view = original[1:]
view[0] = 99        # original is now [10, 99, 30]
copy = original.copy()
copy[0] = 0        # original remains [10, 99, 30]
print(original)
print(copy)
plt.show()
plt.close("all")

# %% 18: ref-window
exec(SETUP, globals())
values = np.array([5, 2, 4, 6, 3, 1])
width = 2
averages = []
for start in range(len(values) - width + 1):
    stop = start + width
    window = values[start:stop]
    average = window.mean()
    averages.append(float(average))
    print(start, stop, window, average, averages)
plt.show()
plt.close("all")

# %% 19: ref-pandas
exec(SETUP, globals())
# Inspect missing entries before deciding what they mean.
print(traffic.isna().sum())

# Group and combine directions within each observed hour.
site_hour = traffic.groupby(
    ['count_point_id', 'count_date', 'hour'], as_index=False
)[['bicycles', 'cars']].sum()

# Filter rows; select named columns.
selected = site_hour.loc[site_hour['bicycles'] >= 30,
                         ['count_point_id', 'bicycles']]
print(selected.head())
plt.show()
plt.close("all")

# %% 20: ref-scraping
exec(SETUP, globals())
# Inspect links and resolve relative destinations when needed.
from urllib.parse import urljoin
for anchor in soup.find_all('a')[:3]:
    href = anchor.get('href')
    if href:
        print(urljoin(page.url, href))

values = [float(p.get_text(strip=True).removeprefix('£'))
          for p in prices]
pd.DataFrame({'price_gbp': values}).to_csv(
    'output/scraped-prices.csv', index=False)
plt.show()
plt.close("all")
