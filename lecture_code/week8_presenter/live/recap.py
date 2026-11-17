# %% Imports and data
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
traffic = pd.read_csv(ROOT / 'data/bristol_traffic_2023.csv')
RGB = np.array(Image.open(ROOT / 'assets/duck.png').convert('RGB'))

# %% One-dimensional arrays can supply columns or rows
x = np.array([10, 20, 30])
y = np.array([1, 2, 3])
print('Each input:', x.shape, y.shape)
print('As columns:\n', np.column_stack((x, y)))
print('As rows:\n', np.vstack((x, y)))
print('Explicit column / row:', x[:, None].shape, x[None, :].shape)

# %% Slicing: predict the shape first
a = np.arange(20).reshape(4, 5)
print(a[1:3, 1:4])
print(a[1].shape, a[1:2].shape, RGB.shape)

# %% Matrix multiplication
A = np.array([[1, 2], [3, 4]])
B = np.array([[2, 1], [0, 3]])
print('Elementwise:\n', A * B)
print('Matrix product:\n', A @ B)

# %% Sliding window: inspect every iteration
values = np.array([5, 2, 4, 6, 3, 1])
width = 2
averages = []
for start in range(len(values) - width + 1):
    stop = start + width
    window = values[start:stop]
    average = window.mean()
    averages.append(float(average))
    print('start:', start, 'stop:', stop)
    print('window:', window, 'mean:', average)
    print('results:', averages)

# %% DataFrame selection
print(traffic.iloc[0:3, 0:2])
print(traffic.loc[0:2, ['cars']])
busy = traffic.loc[traffic['cars'] > 300,
                   ['count_point_id', 'hour', 'cars']]
print(busy.head())

# %% Prepare one observed site/day before plotting
site_hour = traffic.groupby(
    ['count_point_id', 'count_date', 'hour'], as_index=False
)[['cars', 'bicycles']].sum()
day = site_hour.loc[
    (site_hour['count_point_id'] == 6401) &
    (site_hour['count_date'] == '2023-07-13')
].sort_values('hour')

# %% Plot
fig, ax = plt.subplots()
ax.plot(day['hour'], day['cars'], 'o-')
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars and taxis counted')
plt.show()
