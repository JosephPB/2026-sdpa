"""Shared setup, run before each independent slide example."""
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'figure.figsize': (7, 3.6), 'font.size': 12,
                     'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.prop_cycle': plt.cycler(color=['#a71930','#167b83','#e5ac23','#555555'])})
pd.set_option('display.max_rows', 8)
pd.set_option('display.max_columns', 6)
pd.set_option('display.width', 85)
traffic = pd.read_csv('data/bristol_traffic_2023.csv')
locations = pd.read_csv('data/count_points.csv')
air = pd.read_csv('data/bristol_no2_2023.csv')
# Binary spatial image: 0 is white and 1 is black.
duck = np.array([[0,0,0,0,0,1,1,1,0,0],
                 [0,0,0,0,1,1,0,1,1,1],
                 [0,0,0,0,1,1,1,1,0,0],
                 [1,0,0,1,1,1,1,0,0,0],
                 [1,1,1,1,1,1,1,1,0,0],
                 [0,1,1,1,1,1,1,0,0,0],
                 [0,0,1,1,1,1,0,0,0,0]])
from PIL import Image
RGB = np.array(Image.open('assets/duck.png').convert('RGB'))
small = pd.DataFrame({'site': ['A', 'B', 'C'], 'bicycles': [30, 10, 20]})
a = np.arange(20).reshape(4,5)
# Sum directions within each observed site/hour first, so one-way sites
# are not automatically weighted differently from two-direction sites.
counts = ['bicycles','cars','buses','vans','lorries','motor_vehicles']
site_hour = traffic.groupby(['count_point_id','count_date','hour'],as_index=False)[counts].sum()
site_mean = site_hour.groupby('count_point_id',as_index=False)[counts].mean()
mapped = site_mean.merge(locations,on='count_point_id',validate='one_to_one')
def base_map(ax):
    """Draw downloaded Bristol classified-street geometry; no live tile service."""
    with open('data/bristol_roads.json') as f: roads=json.load(f)
    for line in roads:
        coords=np.array(line['coordinates'])
        ax.plot(coords[:,0],coords[:,1],color='#a7c9d8' if line['river'] else '#d4d4d4',lw=2 if line['river'] else .7,zorder=0)
    ax.set(xlim=(-2.70,-2.50),ylim=(51.40,51.53),xlabel='Longitude',ylabel='Latitude')
    ax.set_aspect(1/np.cos(np.deg2rad(51.46)))
