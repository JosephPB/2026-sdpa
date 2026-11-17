"""Prepared variables for independent slide examples; request cells run their own GET."""
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import requests
from PIL import Image
from bs4 import BeautifulSoup

Path('output').mkdir(exist_ok=True)
pd.set_option('display.max_rows', 6)
pd.set_option('display.max_columns', 6)
pd.set_option('display.width', 65)
plt.rcParams.update({'figure.figsize': (7, 3.6), 'font.size': 12})
traffic = pd.read_csv('data/bristol_traffic_2023.csv')
RGB = np.array(Image.open('assets/duck.png').convert('RGB'))
a = np.arange(20).reshape(4, 5)
hourly = traffic.groupby(['count_point_id', 'count_date', 'hour'], as_index=False)['cars'].sum()
day = hourly.loc[(hourly['count_point_id'] == 6401) &
                 (hourly['count_date'] == '2023-07-13')].sort_values('hour')
base = 'https://roadtraffic.dft.gov.uk/api/raw-counts'
params = {'filter[local_authority_id]': 144, 'filter[year]': 2023,
          'page[size]': 2, 'fields': 'road_name,cars_and_taxis'}

# Inspection slides start with the same saved preview. This is not a live GET.
response = requests.Response()
response.status_code = 200
response._content = Path('data/raw/traffic-preview.json').read_bytes()
response.encoding = 'utf-8'
response.headers['Content-Type'] = 'application/json'
response.url = requests.Request('GET', base, params=params).prepare().url
payload = response.json()
records = payload['data']
df = pd.DataFrame(records)

# The reference extraction example can run without first running the scrape cell.
page = requests.Response()
page.status_code = 200
page._content = Path('data/raw/books-to-scrape.html').read_bytes()
page.encoding = 'utf-8'
page.url = 'https://books.toscrape.com/'
soup = BeautifulSoup(page.text, 'html.parser')
prices = soup.select('article.product_pod .price_color')
