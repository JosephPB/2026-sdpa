"""Run from the week7 folder. Each cell starts with fresh setup."""
from pathlib import Path

# %% Example 1
exec(Path("live/setup.py").read_text())
measurements = np.array([10, 20, 30])
print(measurements)
print(measurements.shape)
print(measurements.ndim)
print(measurements.dtype)

# %% Example 2
exec(Path("live/setup.py").read_text())
duck = np.array([
    [0,0,0,0,0,1,1,1,0,0],
    [0,0,0,0,1,1,0,1,1,1],
    [0,0,0,0,1,1,1,1,0,0],
    [1,0,0,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,0,0,0,0]])
print(duck.shape)

# %% Example 3
exec(Path("live/setup.py").read_text())
values = np.arange(12)
grid = values.reshape(4, 3)
print(grid)
print(grid.T)

# %% Example 4
exec(Path("live/setup.py").read_text())
a = np.arange(20).reshape(4, 5)
print(a[1, :])
print(a[1, :].shape)
print(a[1:2, :])
print(a[1:2, :].shape)

# %% Example 5
exec(Path("live/setup.py").read_text())
crop = duck[0:3, 4:10]
reverse = duck[:, ::-1]
print(crop.shape)
print(reverse.shape)

# %% Example 6
exec(Path("live/setup.py").read_text())
from PIL import Image
RGB = np.array(Image.open('assets/duck.png').convert('RGB'))
print(RGB.shape)
print(RGB[1, 8, :])

# %% Example 7
exec(Path("live/setup.py").read_text())
video = np.stack([RGB, RGB[:, ::-1, :]])
print(video.shape)

# %% Example 8
exec(Path("live/setup.py").read_text())
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

# %% Example 9
exec(Path("live/setup.py").read_text())
counts = np.array([12, 25, 40])
print(counts + 5)
print(counts / counts.sum())
print(np.sqrt(counts))

# %% Example 10
exec(Path("live/setup.py").read_text())
counts = np.array([[10, 20, 30], [40, 50, 60]])
print('Each hour, across sites:', counts.sum(axis=0))
print('Each site, across hours:', counts.sum(axis=1))

# %% Example 11
exec(Path("live/setup.py").read_text())
pixel = np.uint8(128)
print(type(pixel).__name__)
pixels = np.array([0, 128, 255], dtype=np.uint8)
print(pixels.dtype)
print(pixels.itemsize)

# %% Example 12
exec(Path("live/setup.py").read_text())
factors = np.array([0.5, 1.0, 1.0])
tinted = (RGB * factors).astype(np.uint8)
print(tinted.shape)

# %% Example 13
exec(Path("live/setup.py").read_text())
for shape in [(3,), (4, 1), (4,)]:
    try:
        result = np.ones((4, 3)) + np.ones(shape)
        print(shape, '→', result.shape)
    except ValueError:
        print(shape, '→ incompatible')

# %% Example 14
exec(Path("live/setup.py").read_text())
transform = np.array([[2, 0], [0, 1]])
point = np.array([4, 2])
print(transform @ point)

# %% Example 15
exec(Path("live/setup.py").read_text())
x = np.array([[1, 2], [3, 4]])
y = np.array([[2, 1], [0, 3]])
print(x * y)
print(x @ y)

# %% Example 16
exec(Path("live/setup.py").read_text())
names = np.array(['A', 'B', 'C'])
cycles = np.array([30, 10, 20])
order = np.argsort(cycles)
print(order)
print(names[order])
print(np.sort(cycles))

# %% Example 17
exec(Path("live/setup.py").read_text())
import pandas as pd
small = pd.DataFrame({
    'site': ['A', 'B', 'C'],
    'bicycles': [30, 10, 20]
})
print(small)

# %% Example 18
exec(Path("live/setup.py").read_text())
labelled = small.set_index('site')
print(labelled)
print(labelled.index)

# %% Example 19
exec(Path("live/setup.py").read_text())
print(small['bicycles'])
print(small[['bicycles']])

# %% Example 20
exec(Path("live/setup.py").read_text())
column = small['bicycles']
print(type(column))
print(type(column).__name__)

# %% Example 21
exec(Path("live/setup.py").read_text())
traffic = pd.read_csv('data/bristol_traffic_2023.csv')
print(traffic[['count_point_id', 'hour', 'bicycles', 'cars']].head(4))
print('Rows, columns:', traffic.shape)

# %% Example 22
exec(Path("live/setup.py").read_text())
print(traffic[['hour', 'bicycles', 'cars']].dtypes)
print(traffic[['bicycles', 'cars']].isna().sum())

# %% Example 23
exec(Path("live/setup.py").read_text())
print(traffic[['bicycles', 'cars']].describe().round(1))

# %% Example 24
exec(Path("live/setup.py").read_text())
sample = pd.DataFrame({'cycles': [30, 10, 20]}, index=['A', 'B', 'C'])
print(sample.loc['A':'B'])
print(sample.iloc[0:1])
print(sample.loc['B', 'cycles'])

# %% Example 25
exec(Path("live/setup.py").read_text())
mask = (traffic['bicycles'] >= 30) & (traffic['cars'] < 300)
selected = traffic.loc[mask, ['count_point_id', 'hour', 'bicycles', 'cars']]
print(selected.head(4))
print(mask.sum())

# %% Example 26
exec(Path("live/setup.py").read_text())
traffic['total'] = traffic['bicycles'] + traffic['motor_vehicles']
traffic['cycle_share'] = traffic['bicycles'] / traffic['total'].replace(0, np.nan)
print(traffic[['bicycles', 'total', 'cycle_share']].head(4).round(3))

# %% Example 27
exec(Path("live/setup.py").read_text())
example = pd.Series([12, np.nan, 24], name='bicycles')
print('Observed mean:', example.mean())
print('Fill with zero:', example.fillna(0).mean())
print('Keep observations:', example.dropna().tolist())

# %% Example 28
exec(Path("live/setup.py").read_text())
readings = pd.DataFrame({
    'site': ['A', 'B', 'A', 'B'],
    'bicycles': [10, 30, 20, 50]
})
groups = readings.groupby('site')
print(groups.groups)
print(groups['bicycles'].mean())

# %% Example 29
exec(Path("live/setup.py").read_text())
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

# %% Example 30
exec(Path("live/setup.py").read_text())
site_hour = traffic.groupby(
    ['count_point_id', 'count_date', 'hour'], as_index=False
)[['cars', 'bicycles', 'buses', 'motor_vehicles']].sum()
print(site_hour.head(3))

# %% Example 31
exec(Path("live/setup.py").read_text())
site_mean = site_hour.groupby('count_point_id', as_index=False).agg(
    cars=('cars', 'mean'),
    bicycles=('bicycles', 'mean'),
    motor_vehicles=('motor_vehicles', 'mean'),
    observed_hours=('hour', 'size')
)
print(site_mean.head(4).round(1))

# %% Example 32
exec(Path("live/setup.py").read_text())
locations = pd.read_csv('data/count_points.csv')
mapped = site_mean.merge(locations, on='count_point_id', validate='one_to_one')
print(mapped[['count_point_id', 'road_name', 'cars', 'bicycles']].head(4).round(1))

# %% Example 33
exec(Path("live/setup.py").read_text())
import matplotlib.pyplot as plt
fig, ax = plt.subplots()

# %% Example 34
exec(Path("live/setup.py").read_text())
day = site_hour.loc[site_hour['count_point_id'] == 6401].sort_values('hour')
hours = day['hour']
cars = day['cars']
fig, ax = plt.subplots()
ax.plot(hours, cars)

# %% Example 35
exec(Path("live/setup.py").read_text())
day = site_hour.loc[site_hour['count_point_id'] == 6401].sort_values('hour')
fig, ax = plt.subplots()
ax.plot(day['hour'], day['cars'], '--o', linewidth=2)
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars counted')
plt.show()

# %% Example 36
exec(Path("live/setup.py").read_text())
hours = [7, 8, 9]
cars = [414, 514, 438]

plt.plot(hours, cars, '--o')
plt.xlabel('Hour starting')
plt.ylabel('Cars counted')
plt.show()

# %% Example 37
exec(Path("live/setup.py").read_text())
hours = [7, 8, 9]
cars = [414, 514, 438]
fig, ax = plt.subplots()
ax.plot(hours, cars, '--o')
ax.set_xlabel('Hour starting')
ax.set_ylabel('Cars counted')
plt.show()

# %% Example 38
exec(Path("live/setup.py").read_text())
totals = traffic[['cars', 'bicycles', 'buses', 'vans', 'lorries']].sum()
fig, ax = plt.subplots()
ax.bar(totals.index, totals.values)
ax.set(ylabel='Vehicles counted')

# %% Example 39
exec(Path("live/setup.py").read_text())
fig, ax = plt.subplots()
ax.hist(site_hour['bicycles'], bins=15, edgecolor='white')
ax.set(xlabel='Bicycles per observed site-hour', ylabel='Number of site-hours')

# %% Example 40
exec(Path("live/setup.py").read_text())
fig, ax = plt.subplots()
ax.scatter(site_mean['cars'], site_mean['bicycles'], alpha=0.75)
ax.set(xlabel='Mean cars per observed hour',
       ylabel='Mean bicycles per observed hour')

# %% Example 41
exec(Path("live/setup.py").read_text())
top = mapped.nlargest(6, 'bicycles').sort_values('bicycles')
labels = top['road_name'] + ' (' + top['count_point_id'].astype(str) + ')'
fig, ax = plt.subplots()
ax.barh(labels, top['bicycles'])
ax.set(xlabel='Mean bicycles per observed hour')
fig.tight_layout()

# %% Example 42
exec(Path("live/setup.py").read_text())
top = mapped.nlargest(5, 'bicycles').sort_values('bicycles')
fig, axes = plt.subplots(1, 2, sharey=True, figsize=(9, 4))
labels = top['count_point_id'].astype(str)
for ax, col in zip(axes, ['cars', 'bicycles']):
    ax.barh(labels, top[col]); ax.set_xlabel(col + ' / observed hour')
fig.tight_layout()

# %% Example 43
exec(Path("live/setup.py").read_text())
fig, ax = plt.subplots(figsize=(7, 4.8))
base_map(ax)
ax.scatter(
    mapped['longitude'], mapped['latitude'],
    s=mapped['motor_vehicles'] / 5,
    alpha=0.5, label='Traffic sites')
ax.legend()

# %% Example 44
exec(Path("live/setup.py").read_text())
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

# %% Example 45
exec(Path("live/setup.py").read_text())
x = np.arange(6).reshape(2, 3)
print(np.concatenate([x, x], axis=0))
print(np.stack([x, x]).shape)
print([part.shape for part in np.array_split(x, 2, axis=1)])
print(x.mean(axis=0))
print(x.mean(axis=1))

# %% Example 46
exec(Path("live/setup.py").read_text())
x = np.array([10, 20, 15])
print(np.cumsum(x))
print(np.cumprod(x))
print(np.diff(x))
print(np.gradient(x))
print(np.sum(x))
print(np.prod(x))

# %% Example 47
exec(Path("live/setup.py").read_text())
x = np.array([1., 2., 4.])
print(np.add(x, 2))
print(np.multiply(x, 2))
print(np.floor_divide(x, 3))
print(np.remainder(x, 3))
print(np.exp(np.log(x)))
print(np.modf(x / 3))

# %% Example 48
exec(Path("live/setup.py").read_text())
rng = np.random.default_rng(7)
print(rng.integers(0, 10, size=5))
print(rng.binomial(10, 0.5, size=5))
x = np.arange(5); rng.shuffle(x); print(x)

# %% Example 49
exec(Path("live/setup.py").read_text())
x = np.array([30, 10, 20, 0])
print(np.where(x >= 20, 'high', 'low'))
print(np.flatnonzero(x >= 20))
print(np.count_nonzero(x))
print(np.argmax(x))
print(np.searchsorted(np.sort(x), 15))

# %% Example 50
exec(Path("live/setup.py").read_text())
A = np.array([[2., 1.], [1., 3.]])
b = np.array([5., 7.])
x = np.linalg.solve(A, b)
print(x)
print(np.allclose(A @ x, b))
print(np.linalg.det(A))
print(np.linalg.norm(x))

# %% Example 51
exec(Path("live/setup.py").read_text())
A = np.array([[2., 1.], [1., 2.]])
values, vectors = np.linalg.eigh(A)
print(values)
U, singular, Vt = np.linalg.svd(A)
print(singular)
print(np.allclose(U @ np.diag(singular) @ Vt, A))

# %% Example 52
exec(Path("live/setup.py").read_text())
x = pd.Series([1, 2], index=['A', 'B'])
y = pd.Series([9, 8], index=['B', 'A'])
print(pd.DataFrame({'x': x, 'y': y}))
print(pd.DataFrame(np.arange(6).reshape(2, 3)))

# %% Example 53
exec(Path("live/setup.py").read_text())
df = pd.DataFrame({'cycles': [10, 20, 30]}, index=['A', 'B', 'A'])
print(df.loc['A'])
print(type(df.iloc[0]).__name__)
print(type(df.iloc[[0]]).__name__)
print(df.cycles.equals(df['cycles']))

# %% Example 54
exec(Path("live/setup.py").read_text())
df = pd.DataFrame({'cars': [10, 20], 'cycles': [2, 4]}, index=['A', 'B'])
df['checked'] = False
df.loc['A', 'cars'] = 12
df.loc['B', ['cars', 'cycles']] = [25, 5]
del df['checked']
print(df.drop(index='B'))
print(df.drop(columns='cars'))

# %% Example 55
exec(Path("live/setup.py").read_text())
left = pd.DataFrame({'site': ['A', 'B'], 'cars': [10, 20]})
right = pd.DataFrame({'site': ['B', 'C'], 'road': ['X', 'Y']})
print(left.merge(right, on='site', how='inner'))
print(left.merge(right, on='site', how='outer'))

# %% Example 56
exec(Path("live/setup.py").read_text())
df = pd.DataFrame({'x': [1., np.nan, 3.], 'y': [np.nan]*3})
print(df.dropna(subset=['x']))
print(df.dropna(axis=1, how='all'))
print(df.fillna(df.mean(numeric_only=True)))

# %% Example 57
exec(Path("live/setup.py").read_text())
groups = traffic.groupby('direction')
print('Groups:', len(groups))
for key, group in groups:
    print(key, len(group))
print(groups['bicycles'].agg(['count', 'mean', 'max']).round(1))

# %% Example 58
exec(Path("live/setup.py").read_text())
print(site_hour.pivot_table(index='hour', values=['cars', 'bicycles'], aggfunc='mean').head())
df = pd.DataFrame({'x': [1,2,3,4]}, index=pd.date_range('2023-01-01', periods=4, freq='h'))
print(df.resample('2h').sum())

# %% Example 59
exec(Path("live/setup.py").read_text())
fig, ax = plt.subplots()
ax.imshow(duck, cmap='gray_r', vmin=0, vmax=1)
ax.axis('off')

# %% Example 60
exec(Path("live/setup.py").read_text())
fig, ax = plt.subplots()
ax.plot([0, 1, 2], [0, 2, 1], '--o', label='Line and markers')
ax.set(xlabel='x axis label', ylabel='y axis label', title='Axes title')
ax.grid(alpha=.3); ax.legend(); ax.minorticks_on()
fig.suptitle('Figure title'); fig.tight_layout()

# %% Example 61
exec(Path("live/setup.py").read_text())
x = np.linspace(0, 2*np.pi, 60)
fig, axes = plt.subplots(2, 2, figsize=(8, 4))
axes[0,0].plot(np.sin(x))
axes[0,1].plot(x, np.sin(x), c='r', lw=3)
axes[1,0].plot(x[::5], np.sin(x[::5]), 'o')
axes[1,1].plot(x, np.sin(x), '--o')
fig.tight_layout()

# %% Example 62
exec(Path("live/setup.py").read_text())
x = np.arange(6); y = x**2
fig, axes = plt.subplots(1, 2, subplot_kw={'xticks': (), 'yticks': ()})
axes[0].plot(x, y, 'o'); axes[0].set_title('plot with markers')
sc = axes[1].scatter(x, y, c=y, s=30+20*x, cmap='viridis', edgecolor='black')
fig.colorbar(sc, ax=axes[1], label='y')

# %% Example 63
exec(Path("live/setup.py").read_text())
x = np.random.default_rng(4).normal(size=500)
fig, axes = plt.subplots(1, 3, figsize=(9, 3))
for ax, bins in zip(axes, [10, 50, 'auto']):
    ax.hist(x, bins=bins); ax.set_title(f'bins={bins}')
print(np.histogram(x, bins=5)[0])
fig.tight_layout()

# %% Example 64
exec(Path("live/setup.py").read_text())
fig, axes = plt.subplots(1, 3, figsize=(9, 3))
names = ['Cars', 'Cycles', 'Buses']; values = [70, 20, 10]
axes[0].bar(names, values)
axes[1].barh(names, values)
axes[2].pie(values, labels=names, autopct='%1.0f%%')
fig.tight_layout()

# %% Example 65
exec(Path("live/setup.py").read_text())
fig, axes = plt.subplots(2, 1, sharex=True, figsize=(7, 4))
for ax, col in zip(axes, ['cars', 'bicycles']):
    y = site_hour.groupby('hour')[col].mean()
    ax.plot(y.index, y, label=col)
    ax.axhline(y.mean(), ls='--', color='grey', label='Mean')
    ax.set_ylabel(col); ax.legend()
axes[1].set_xlabel('Hour'); fig.tight_layout()