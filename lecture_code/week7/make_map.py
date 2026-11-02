"""Create the lecture opener with legends tied to the plotted data encodings."""
from pathlib import Path
import os
ROOT=Path(__file__).resolve().parent
os.chdir(ROOT)
os.environ.setdefault('MPLCONFIGDIR',str(ROOT/'.mpl-cache'))
ns={};exec((ROOT/'live/setup.py').read_text(),ns)
plt=ns['plt'];mapped=ns['mapped'];air=ns['air']
plt.rcParams.update({'font.family':'Arial','svg.fonttype':'none','font.size':17})
fig=plt.figure(figsize=(16,9),facecolor='white')
ax=fig.add_axes([.035,.03,.65,.94]);ns['base_map'](ax);ax.set_axis_off()
ax.scatter(mapped.longitude,mapped.latitude,s=mapped.motor_vehicles/5,
           facecolors='#a71930',alpha=.25,edgecolors='#777',linewidths=.7,zorder=2)
sc=ax.scatter(air.longitude,air.latitude,c=air.no2_ugm3,cmap='YlOrRd',
              s=22,marker='s',vmin=10,vmax=65,edgecolors='white',linewidths=.3,zorder=3)
# University Walk, BS8 1TR; approximate building location, not the hospital of the same name.
# Address: https://www.bristol.ac.uk/library/locations-opening/queens-library/
# Coordinates cross-checked with https://geotopoi.wordpress.com/2025/11/08/queens-building-bristol-university/
queens=(-2.60195,51.45698)
ax.scatter(*queens,marker='*',s=180,c='#005c62',edgecolors='white',linewidths=1,zorder=6)
ax.annotate("Queen's Building\nClifton campus",xy=queens,xytext=(-2.686,51.49),
            fontsize=15,color='#005c62',fontweight='bold',
            bbox=dict(boxstyle='round,pad=.35',facecolor='white',edgecolor='#005c62'),
            arrowprops=dict(arrowstyle='-',color='#005c62',lw=1.5),zorder=7)
fig.text(.735,.88,'Traffic',fontsize=24,fontweight='bold')
handles=[ax.scatter([],[],s=v/5,facecolors='#a71930',alpha=.25,edgecolors='#777') for v in [100,500,1500]]
fig.legend(handles,['100','500','1500'],title='2023 survey counts\nMean motor vehicles\nper observed hour',
           loc='upper left',bbox_to_anchor=(.725,.85),frameon=False,labelspacing=1.3,
           handletextpad=1.5,borderpad=0,title_fontsize=17,fontsize=17)
fig.text(.735,.39,'Air quality',fontsize=24,fontweight='bold')
fig.text(.735,.32,'2023 annual mean NO$_2$\n(µg/m³)',fontsize=17,linespacing=1.4)
cax=fig.add_axes([.735,.24,.21,.032]);cb=fig.colorbar(sc,cax=cax,orientation='horizontal',ticks=[10,30,50,65]);cb.outline.set_visible(False);cb.ax.tick_params(labelsize=16,length=0,pad=8)
fig.savefig(ROOT/'assets/bristol-map-legend.svg',facecolor='white')
plt.close(fig)
print('Saved map with traffic-size and NO₂-colour legends')
