"""Week 7 live examples. Run the first cell, then any numbered cell in an IDE.

Each example starts with fresh lecture data. Run from this folder with:
    python week7.py
The plots use your local Matplotlib backend. Install requirements.txt first.
"""
# %% Setup
from pathlib import Path
import os
ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
os.chdir(ROOT)
LOCAL_SETUP = (ROOT / 'live/local_setup.py').read_text()


# %% Example 1
exec(LOCAL_SETUP, globals())
measurements = np.array([10, 20, 30])
print(measurements)
print(measurements.shape)
print(measurements.ndim)
print(measurements.dtype)
plt.show()
plt.close("all")

# %% Example 2
exec(LOCAL_SETUP, globals())
duck = np.array([
    [0,0,0,0,0,1,1,1,0,0],
    [0,0,0,0,1,1,0,1,1,1],
    [0,0,0,0,1,1,1,1,0,0],
    [1,0,0,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,0,0,0,0]])
print(duck.shape)
plt.show()
plt.close("all")

# %% Example 3
exec(LOCAL_SETUP, globals())
values = np.arange(12)
grid = values.reshape(4, 3)
print(grid)
print(grid.T)
plt.show()
plt.close("all")

# %% Example 4
exec(LOCAL_SETUP, globals())
a = np.arange(20).reshape(4, 5)
print(a[1, :])
print(a[1, :].shape)
print(a[1:2, :])
print(a[1:2, :].shape)
plt.show()
plt.close("all")

# %% Example 5
exec(LOCAL_SETUP, globals())
crop = duck[0:3, 4:10]
reverse = duck[:, ::-1]
print(crop.shape)
print(reverse.shape)
plt.show()
plt.close("all")

# %% Example 6
exec(LOCAL_SETUP, globals())
from PIL import Image
RGB = np.array(Image.open('assets/duck.png').convert('RGB'))
print(RGB.shape)
print(RGB[1, 8, :])
plt.show()
plt.close("all")

# %% Example 7
exec(LOCAL_SETUP, globals())
video = np.stack([RGB, RGB[:, ::-1, :]])
print(video.shape)
plt.show()
plt.close("all")

# %% Example 8
exec(LOCAL_SETUP, globals())
a = np.arange(6).reshape(2, 3)
view = a[:, :2]
view[:] = 99
print(a)
independent = a[:, :2].copy()
independent[:] = 0
print(independent)
print(a)
print(np.shares_memory(a, view))
print(np.shares_memory(a, independent))
plt.show()
plt.close("all")

# %% Example 9
exec(LOCAL_SETUP, globals())
counts = np.array([12, 25, 40])
print(counts + 5)
print(counts / counts.sum())
print(np.sqrt(counts))
plt.show()
plt.close("all")

# %% Example 10
exec(LOCAL_SETUP, globals())
counts = np.array([[10, 20, 30], [40, 50, 60]])
print('Each hour, across sites:', counts.sum(axis=0))
print('Each site, across hours:', counts.sum(axis=1))
plt.show()
plt.close("all")

# %% Example 11
exec(LOCAL_SETUP, globals())
pixel = np.uint8(128)
print(type(pixel).__name__)
pixels = np.array([0, 128, 255], dtype=np.uint8)
print(pixels.dtype)
print(pixels.itemsize)
plt.show()
plt.close("all")

# %% Example 12
exec(LOCAL_SETUP, globals())
factors = np.array([0.5, 1.0, 1.0])
tinted = (RGB * factors).astype(np.uint8)
print(tinted.shape)
plt.show()
plt.close("all")

# %% Example 13
exec(LOCAL_SETUP, globals())
for shape in [(3,), (4, 1), (4,)]:
    try:
        result = np.ones((4, 3)) + np.ones(shape)
        print(shape, '→', result.shape)
    except ValueError:
        print(shape, '→ incompatible')
plt.show()
plt.close("all")

# %% Example 14
exec(LOCAL_SETUP, globals())
transform = np.array([[2, 0], [0, 1]])
point = np.array([4, 2])
print(transform @ point)
plt.show()
plt.close("all")

# %% Example 15
exec(LOCAL_SETUP, globals())
x = np.array([[1, 2], [3, 4]])
y = np.array([[2, 1], [0, 3]])
print(x * y)
print(x @ y)
plt.show()
plt.close("all")

# %% Example 16
exec(LOCAL_SETUP, globals())
names = np.array(['A', 'B', 'C'])
cycles = np.array([30, 10, 20])
order = np.argsort(cycles)
print(order)
print(names[order])
print(np.sort(cycles))
plt.show()
plt.close("all")

# %% Example 17
exec(LOCAL_SETUP, globals())
import pandas as pd
small = pd.DataFrame({
    'site': ['A', 'B', 'C'],
    'bicycles': [30, 10, 20]
})
print(small)
plt.show()
plt.close("all")

# %% Example 18
exec(LOCAL_SETUP, globals())
labelled = small.set_index('site')
print(labelled)
print(labelled.index)
plt.show()
plt.close("all")

# %% Example 19
exec(LOCAL_SETUP, globals())
print(small['bicycles'])
print(small[['bicycles']])
plt.show()
plt.close("all")

# %% Example 20
exec(LOCAL_SETUP, globals())
column = small['bicycles']
print(type(column))
print(type(column).__name__)
plt.show()
plt.close("all")

# %% Example 21
exec(LOCAL_SETUP, globals())
traffic = pd.read_csv('data/bristol_traffic_2023.csv')
print(traffic[['count_point_id', 'hour', 'bicycles', 'cars']].head(4))
print('Rows, columns:', traffic.shape)
plt.show()
plt.close("all")

# %% Example 22
exec(LOCAL_SETUP, globals())
print(traffic[['hour', 'bicycles', 'cars']].dtypes)
print(traffic[['bicycles', 'cars']].isna().sum())
plt.show()
plt.close("all")

# %% Example 23
exec(LOCAL_SETUP, globals())
print(traffic[['bicycles', 'cars']].describe().round(1))
plt.show()
plt.close("all")

# %% Example 24
exec(LOCAL_SETUP, globals())
sample = pd.DataFrame({'cycles': [30, 10, 20]}, index=['A', 'B', 'C'])
print(sample.loc['A':'B'])
print(sample.iloc[0:1])
print(sample.loc['B', 'cycles'])
plt.show()
plt.close("all")

# %% Example 25
exec(LOCAL_SETUP, globals())
mask = (traffic['bicycles'] >= 30) & (traffic['cars'] < 300)
selected = traffic.loc[mask, ['count_point_id', 'hour', 'bicycles', 'cars']]
print(selected.head(4))
print(mask.sum())
plt.show()
plt.close("all")

# %% Example 26
exec(LOCAL_SETUP, globals())
traffic['total'] = traffic['bicycles'] + traffic['motor_vehicles']
traffic['cycle_share'] = traffic['bicycles'] / traffic['total'].replace(0, np.nan)
print(traffic[['bicycles', 'total', 'cycle_share']].head(4).round(3))
plt.show()
plt.close("all")

# %% Example 27
exec(LOCAL_SETUP, globals())
example = pd.Series([12, np.nan, 24], name='bicycles')
print('Observed mean:', example.mean())
print('Fill with zero:', example.fillna(0).mean())
print('Keep observations:', example.dropna().tolist())
plt.show()
plt.close("all")

# %% Example 28
exec(LOCAL_SETUP, globals())
readings = pd.DataFrame({
    'site': ['A', 'B', 'A', 'B'],
    'bicycles': [10, 30, 20, 50]
})
groups = readings.groupby('site')
print(groups.groups)
print(groups['bicycles'].mean())
plt.show()
plt.close("all")

# %% Example 29
exec(LOCAL_SETUP, globals())
readings = pd.DataFrame({
    'site': ['A', 'B', 'A', 'B'],
    'bicycles': [10, 30, 20, 50]
})
summary = readings.groupby('site', as_index=False).agg(
    mean_cycles=('bicycles', 'mean'),
    peak_cycles=('bicycles', 'max'),
    observations=('bicycles', 'size')
)
print(summary)
plt.show()
plt.close("all")

# %% Example 30
exec(LOCAL_SETUP, globals())
site_hour = traffic.groupby(
    ['count_point_id', 'count_date', 'hour'], as_index=False
)[['cars', 'bicycles', 'buses', 'motor_vehicles']].sum()
print(site_hour.head(3))
plt.show()
plt.close("all")

# %% Example 31
exec(LOCAL_SETUP, globals())
site_mean = site_hour.groupby('count_point_id', as_index=False).agg(
    cars=('cars', 'mean'),
    bicycles=('bicycles', 'mean'),
    motor_vehicles=('motor_vehicles', 'mean'),
    observed_hours=('hour', 'size')
)
print(site_mean.head(4).round(1))
plt.show()
plt.close("all")

# %% Example 32
exec(LOCAL_SETUP, globals())
locations = pd.read_csv('data/count_points.csv')
mapped = site_mean.merge(locations, on='count_point_id', validate='one_to_one')
print(mapped[['count_point_id', 'road_name', 'cars', 'bicycles']].head(4).round(1))
plt.show()
plt.close("all")

# %% Example 33
exec(LOCAL_SETUP, globals())
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
plt.show()
plt.close("all")

# %% Example 34
exec(LOCAL_SETUP, globals())
day = site_hour.loc[site_hour['count_point_id'] == 6401].sort_values('hour')
hours = day['hour']
cars = day['cars']
fig, ax = plt.subplots()
ax.plot(hours, cars)
plt.show()
plt.close("all")

# %% Example 35
exec(LOCAL_SETUP, globals())
day = site_hour.loc[site_hour['count_point_id'] == 6401].sort_values('hour')
fig, ax = plt.subplots()
ax.plot(day['hour'], day['cars'], '--o', linewidth=2)
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars counted')
plt.show()
plt.show()
plt.close("all")

# %% Example 36
exec(LOCAL_SETUP, globals())
hours = [7, 8, 9]
cars = [414, 514, 438]

plt.plot(hours, cars, '--o')
plt.xlabel('Hour starting')
plt.ylabel('Cars counted')
plt.show()
plt.show()
plt.close("all")

# %% Example 37
exec(LOCAL_SETUP, globals())
hours = [7, 8, 9]
cars = [414, 514, 438]
fig, ax = plt.subplots()
ax.plot(hours, cars, '--o')
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars counted')
plt.show()
plt.show()
plt.close("all")

# %% Example 38
exec(LOCAL_SETUP, globals())
totals = traffic[['cars', 'bicycles', 'buses', 'vans', 'lorries']].sum()
fig, ax = plt.subplots()
ax.bar(totals.index, totals.values)
ax.set(ylabel='Vehicles counted')
plt.show()
plt.close("all")

# %% Example 39
exec(LOCAL_SETUP, globals())
fig, ax = plt.subplots()
ax.hist(site_hour['bicycles'], bins=15, edgecolor='white')
ax.set(xlabel='Bicycles per observed site-hour', ylabel='Number of site-hours')
plt.show()
plt.close("all")

# %% Example 40
exec(LOCAL_SETUP, globals())
fig, ax = plt.subplots()
ax.scatter(site_mean['cars'], site_mean['bicycles'], alpha=0.75)
ax.set(xlabel='Mean cars per observed hour',
       ylabel='Mean bicycles per observed hour')
plt.show()
plt.close("all")

# %% Example 41
exec(LOCAL_SETUP, globals())
top = mapped.nlargest(6, 'bicycles').sort_values('bicycles')
labels = top['road_name'] + ' (' + top['count_point_id'].astype(str) + ')'
fig, ax = plt.subplots()
ax.barh(labels, top['bicycles'])
ax.set(xlabel='Mean bicycles per observed hour')
fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 42
exec(LOCAL_SETUP, globals())
top = mapped.nlargest(5, 'bicycles').sort_values('bicycles')
fig, axes = plt.subplots(1, 2, sharey=True, figsize=(9, 4))
labels = top['count_point_id'].astype(str)
for ax, col in zip(axes, ['cars', 'bicycles']):
    ax.barh(labels, top[col]); ax.set_xlabel(col + ' / observed hour')
fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 43
exec(LOCAL_SETUP, globals())
fig, ax = plt.subplots(figsize=(7, 4.8))
base_map(ax)
ax.scatter(
    mapped['longitude'], mapped['latitude'],
    s=mapped['motor_vehicles'] / 5,
    alpha=0.5, label='Traffic sites')
ax.legend()
plt.show()
plt.close("all")

# %% Example 44
exec(LOCAL_SETUP, globals())
air = pd.read_csv(
    'data/bristol_no2_2023.csv')
fig, ax = plt.subplots(figsize=(7, 4.8))
base_map(ax)
ax.scatter(
    mapped['longitude'], mapped['latitude'],
    s=mapped['motor_vehicles'] / 5,
    facecolors='none', edgecolors='#666')
sc = ax.scatter(
    air['longitude'], air['latitude'],
    c=air['no2_ugm3'], cmap='YlOrRd',
    s=22, marker='s', vmin=10, vmax=65)
fig.colorbar(sc, ax=ax,
             label='Annual mean NO₂ (µg/m³)')
plt.show()
plt.close("all")

# %% Example 45
exec(LOCAL_SETUP, globals())
x = np.arange(6).reshape(2, 3)
print(np.concatenate([x, x], axis=0))
print(np.stack([x, x]).shape)
print([part.shape for part in np.array_split(x, 2, axis=1)])
print(x.mean(axis=0))
print(x.mean(axis=1))
plt.show()
plt.close("all")

# %% Example 46
exec(LOCAL_SETUP, globals())
x = np.array([10, 20, 15])
print(np.cumsum(x))
print(np.cumprod(x))
print(np.diff(x))
print(np.gradient(x))
print(np.sum(x))
print(np.prod(x))
plt.show()
plt.close("all")

# %% Example 47
exec(LOCAL_SETUP, globals())
x = np.array([1., 2., 4.])
print(np.add(x, 2))
print(np.multiply(x, 2))
print(np.floor_divide(x, 3))
print(np.remainder(x, 3))
print(np.exp(np.log(x)))
print(np.modf(x / 3))
plt.show()
plt.close("all")

# %% Example 48
exec(LOCAL_SETUP, globals())
rng = np.random.default_rng(7)
print(rng.integers(0, 10, size=5))
print(rng.binomial(10, 0.5, size=5))
x = np.arange(5); rng.shuffle(x); print(x)
plt.show()
plt.close("all")

# %% Example 49
exec(LOCAL_SETUP, globals())
x = np.array([30, 10, 20, 0])
print(np.where(x >= 20, 'high', 'low'))
print(np.flatnonzero(x >= 20))
print(np.count_nonzero(x))
print(np.argmax(x))
print(np.searchsorted(np.sort(x), 15))
plt.show()
plt.close("all")

# %% Example 50
exec(LOCAL_SETUP, globals())
A = np.array([[2., 1.], [1., 3.]])
b = np.array([5., 7.])
x = np.linalg.solve(A, b)
print(x)
print(np.allclose(A @ x, b))
print(np.linalg.det(A))
print(np.linalg.norm(x))
plt.show()
plt.close("all")

# %% Example 51
exec(LOCAL_SETUP, globals())
A = np.array([[2., 1.], [1., 2.]])
values, vectors = np.linalg.eigh(A)
print(values)
U, singular, Vt = np.linalg.svd(A)
print(singular)
print(np.allclose(U @ np.diag(singular) @ Vt, A))
plt.show()
plt.close("all")

# %% Example 52
exec(LOCAL_SETUP, globals())
x = pd.Series([1, 2], index=['A', 'B'])
y = pd.Series([9, 8], index=['B', 'A'])
print(pd.DataFrame({'x': x, 'y': y}))
print(pd.DataFrame(np.arange(6).reshape(2, 3)))
plt.show()
plt.close("all")

# %% Example 53
exec(LOCAL_SETUP, globals())
df = pd.DataFrame({'cycles': [10, 20, 30]}, index=['A', 'B', 'A'])
print(df.loc['A'])
print(type(df.iloc[0]).__name__)
print(type(df.iloc[[0]]).__name__)
print(df.cycles.equals(df['cycles']))
plt.show()
plt.close("all")

# %% Example 54
exec(LOCAL_SETUP, globals())
df = pd.DataFrame({'cars': [10, 20], 'cycles': [2, 4]}, index=['A', 'B'])
df['checked'] = False
df.loc['A', 'cars'] = 12
df.loc['B', ['cars', 'cycles']] = [25, 5]
del df['checked']
print(df.drop(index='B'))
print(df.drop(columns='cars'))
plt.show()
plt.close("all")

# %% Example 55
exec(LOCAL_SETUP, globals())
left = pd.DataFrame({'site': ['A', 'B'], 'cars': [10, 20]})
right = pd.DataFrame({'site': ['B', 'C'], 'road': ['X', 'Y']})
print(left.merge(right, on='site', how='inner'))
print(left.merge(right, on='site', how='outer'))
plt.show()
plt.close("all")

# %% Example 56
exec(LOCAL_SETUP, globals())
df = pd.DataFrame({'x': [1., np.nan, 3.], 'y': [np.nan]*3})
print(df.dropna(subset=['x']))
print(df.dropna(axis=1, how='all'))
print(df.fillna(df.mean(numeric_only=True)))
plt.show()
plt.close("all")

# %% Example 57
exec(LOCAL_SETUP, globals())
groups = traffic.groupby('direction')
print('Groups:', len(groups))
for key, group in groups:
    print(key, len(group))
print(groups['bicycles'].agg(['count', 'mean', 'max']).round(1))
plt.show()
plt.close("all")

# %% Example 58
exec(LOCAL_SETUP, globals())
print(site_hour.pivot_table(index='hour', values=['cars', 'bicycles'], aggfunc='mean').head())
df = pd.DataFrame({'x': [1,2,3,4]}, index=pd.date_range('2023-01-01', periods=4, freq='h'))
print(df.resample('2h').sum())
plt.show()
plt.close("all")

# %% Example 59
exec(LOCAL_SETUP, globals())
fig, ax = plt.subplots()
ax.imshow(duck, cmap='gray_r', vmin=0, vmax=1)
ax.axis('off')
plt.show()
plt.close("all")

# %% Example 60
exec(LOCAL_SETUP, globals())
fig, ax = plt.subplots()
ax.plot([0, 1, 2], [0, 2, 1], '--o', label='Line and markers')
ax.set(xlabel='x axis label', ylabel='y axis label', title='Axes title')
ax.grid(alpha=.3); ax.legend(); ax.minorticks_on()
fig.suptitle('Figure title'); fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 61
exec(LOCAL_SETUP, globals())
x = np.linspace(0, 2*np.pi, 60)
fig, axes = plt.subplots(2, 2, figsize=(8, 4))
axes[0,0].plot(np.sin(x))
axes[0,1].plot(x, np.sin(x), c='r', lw=3)
axes[1,0].plot(x[::5], np.sin(x[::5]), 'o')
axes[1,1].plot(x, np.sin(x), '--o')
fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 62
exec(LOCAL_SETUP, globals())
x = np.arange(6); y = x**2
fig, axes = plt.subplots(1, 2, subplot_kw={'xticks': (), 'yticks': ()})
axes[0].plot(x, y, 'o'); axes[0].set_title('plot with markers')
sc = axes[1].scatter(x, y, c=y, s=30+20*x, cmap='viridis', edgecolor='black')
fig.colorbar(sc, ax=axes[1], label='y')
plt.show()
plt.close("all")

# %% Example 63
exec(LOCAL_SETUP, globals())
x = np.random.default_rng(4).normal(size=500)
fig, axes = plt.subplots(1, 3, figsize=(9, 3))
for ax, bins in zip(axes, [10, 50, 'auto']):
    ax.hist(x, bins=bins); ax.set_title(f'bins={bins}')
print(np.histogram(x, bins=5)[0])
fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 64
exec(LOCAL_SETUP, globals())
fig, axes = plt.subplots(1, 3, figsize=(9, 3))
names = ['Cars', 'Cycles', 'Buses']; values = [70, 20, 10]
axes[0].bar(names, values)
axes[1].barh(names, values)
axes[2].pie(values, labels=names, autopct='%1.0f%%')
fig.tight_layout()
plt.show()
plt.close("all")

# %% Example 65
exec(LOCAL_SETUP, globals())
fig, axes = plt.subplots(2, 1, sharex=True, figsize=(7, 4))
for ax, col in zip(axes, ['cars', 'bicycles']):
    y = site_hour.groupby('hour')[col].mean()
    ax.plot(y.index, y, label=col)
    ax.axhline(y.mean(), ls='--', color='grey', label='Mean')
    ax.set_ylabel(col); ax.legend()
axes[1].set_xlabel('Hour'); fig.tight_layout()
plt.show()
plt.close("all")
