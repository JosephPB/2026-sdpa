"""Week 9 worked examples. Run Setup, then any numbered cell."""
# %% Setup
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
ROOT = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
traffic = pd.read_csv(ROOT / 'data/bristol_traffic_2023.csv')
hourly = pd.read_csv(ROOT / 'data/site_hours.csv')

# %% categories
import pandas as pd

traffic = pd.read_csv('data/bristol_traffic_2023.csv')
traffic['direction'] = (traffic['direction']
    .astype('string').str.strip().str.upper()
    .fillna('Missing'))
counts = traffic['direction'].value_counts(dropna=False)
summary = pd.DataFrame({
    'records': counts,
    'proportion': counts / len(traffic),
    'percent': 100 * counts / len(traffic)
})
print(summary.round(3))


# %% summary
cars = hourly['cars']
print(cars.describe().round(1))
print('Median:', cars.median())
print('Range:', cars.max() - cars.min())
print('Sample variance:',
      round(cars.var(ddof=1), 1))


# %% correlation
paired = hourly[['cars', 'bicycles']]
print(paired.corr().round(3))


# %% scaling
x = np.array([100., 200., 300.])
minmax = (x - x.min()) / np.ptp(x)
z = (x - x.mean()) / x.std(ddof=0)
print('Original:', x)
print('Min–max:', minmax)
print('z-scores:', np.round(z, 3))
print('z mean / SD:',
      round(z.mean(), 3),
      round(z.std(ddof=0), 3))


# %% grouping
site_hour = traffic.groupby(
    ['count_point_id', 'count_date', 'hour'],
    as_index=False
)[['cars', 'bicycles']].sum()
print(site_hour[['hour', 'cars', 'bicycles']]
      .head(3).to_string(index=False))
print('Observed site-hours:', len(site_hour))
