"""Rebuild the lecture's data figures from saved observations and labelled teaching data."""
from pathlib import Path
import os, json
ROOT = Path(__file__).resolve().parent
os.environ.setdefault('MPLCONFIGDIR', str(ROOT/'output/.mpl-cache'))
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.patches import Rectangle
A=ROOT/'assets'; A.mkdir(exist_ok=True)
RED='#a71930'; TEAL='#188980'; BLUE='#4175a8'; GREY='#9ba4ab'; GOLD='#bf8619'
plt.rcParams.update({'font.family':['Arial','DejaVu Sans'],'font.size':17,'axes.titlesize':21,'axes.labelsize':17,'xtick.labelsize':14,'ytick.labelsize':14,'axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#aab0b5','axes.labelcolor':'#242424','text.color':'#242424','axes.titlepad':15,'svg.fonttype':'none','savefig.facecolor':'white'})
traffic=pd.read_csv(ROOT/'data/bristol_traffic_2023.csv')
points=pd.read_csv(ROOT/'data/count_points.csv')
cols=['cars','bicycles','buses','vans','lorries','motor_vehicles']
hourly=traffic.groupby(['count_point_id','count_date','hour'],as_index=False)[cols].sum().merge(points,on='count_point_id',validate='many_to_one')
hourly.to_csv(ROOT/'data/site_hours.csv',index=False)
day=hourly.query('count_point_id == 6401').sort_values('hour')
rng=np.random.default_rng(9)
def canvas(n=1,size=None):
 return plt.subplots(1,n,figsize=size or (13.6,5.4),layout='constrained',squeeze=False)
def save(fig,name):
 fig.savefig(A/(name+'.svg'));plt.close(fig)
def grid(ax): ax.grid(axis='y',color='#e7e9eb',zorder=0);ax.set_axisbelow(True)
def note(ax,s): ax.text(.02,.98,s,transform=ax.transAxes,va='top',fontsize=13,color='#666')
def bars(ax): grid(ax);ax.set_ylim(bottom=0)
# The familiar observations.
f,ax=canvas();a=ax[0,0];a.plot(day.hour,day.cars,'o-',color=RED,lw=3);a.set(xlabel='Hour on 13 July 2023',ylabel='Cars and taxis counted',title='A38, site 6401: recorded directions combined');a.set_xticks(day.hour);grid(a);save(f,'traffic-day')
f,ax=canvas(2); counts=traffic.direction.value_counts().reindex(['N','E','S','W']);ax[0,0].bar(counts.index,counts.values,color=TEAL);ax[0,0].set(title='Frequency of survey records',xlabel='Recorded direction',ylabel='Number of records');bars(ax[0,0]);ax[0,1].pie(counts,labels=counts.index,autopct='%1.1f%%',colors=[TEAL,BLUE,GOLD,RED],textprops={'fontsize':17});ax[0,1].set_title('Share of the 936 records');save(f,'category-views')
# Chart caveat: same data, misleading / faithful bar baselines.
f,ax=canvas(2); vals=[99,80]
for a,base,title in zip(ax[0],[75,0],['Cropped baseline','Zero baseline']):
 a.bar(['A','B'],vals,color=[RED,TEAL]);a.set(ylim=(base,105),ylabel='Illustrative count');a.bar_label(a.containers[0],fontsize=19);grid(a)
save(f,'bar-baseline')
ct=pd.crosstab(traffic.count_point_id,traffic.direction).reindex(columns=['N','E','S','W'],fill_value=0).loc[[6401,8599,16961,26511]] if 26511 in traffic.count_point_id.values else pd.crosstab(traffic.count_point_id,traffic.direction).reindex(columns=['N','E','S','W'],fill_value=0).iloc[:4]
ct.to_csv(ROOT/'data/direction_crosstab.csv')
f,ax=canvas(2)
for a,values,title,fmt in [(ax[0,0],ct,'Counts: recorded observations','d'),(ax[0,1],ct.div(ct.sum(axis=1),axis=0)*100,'Row percentages: within each site','.0f')]:
 a.imshow(values,cmap='Blues',aspect='auto',vmin=0,vmax=100 if fmt=='.0f' else values.to_numpy().max());a.set_xticks(range(4),values.columns);a.set_yticks(range(len(ct)),[str(s) for s in ct.index]);a.set(xlabel='Direction',ylabel='Count-point ID',title=title)
 for i in range(len(ct)):
  for j in range(4): a.text(j,i,format(values.iloc[i,j],fmt)+('%' if fmt=='.0f' else ''),ha='center',va='center',color='white' if values.iloc[i,j] > (60 if fmt=='.0f' else values.to_numpy().max()*.6) else '#242424',fontsize=19)
save(f,'crosstab')
f,ax=canvas(2)
ct.plot.bar(ax=ax[0,0],color=[TEAL,BLUE,GOLD,RED],rot=0);ct.div(ct.sum(axis=1),axis=0).mul(100).plot.bar(stacked=True,ax=ax[0,1],color=[TEAL,BLUE,GOLD,RED],rot=0)
for a,title,yl in zip(ax[0],['Grouped counts','Composition within each site'],['Survey records','Percent']):a.set(title=title,xlabel='Count-point ID',ylabel=yl);bars(a);a.legend(title='Direction',fontsize=12,ncol=2)
save(f,'cross-bars')
# Numeric distributions and binning.
f,ax=canvas();a=ax[0,0];a.hist(hourly.cars,bins=25,color=TEAL,edgecolor='white');a.set(xlabel='Cars and taxis per observed site-hour',ylabel='Number of site-hours',title='480 observed site-hours across 40 sites');grid(a);save(f,'traffic-hist')
f,ax=canvas(3)
for a,n in zip(ax[0],[6,18,45]):a.hist(hourly.cars,bins=n,color=TEAL,edgecolor='white');a.set(title=f'{n} bins',xlabel='Cars and taxis',ylabel='Site-hours');grid(a)
save(f,'bins')
small=np.array([20,22,23,23,25,25,27,29,29,31,32,34.])
for state,last in enumerate([34,80,160]):
 v=small.copy();v[-1]=last
 f,ax=canvas(size=(13.6,4.8));a=ax[0,0];a.scatter(v,np.zeros(len(v))+rng.uniform(-.05,.05,len(v)),s=140,color=[TEAL]*11+[RED],zorder=3);a.axvline(v.mean(),color=RED,lw=3,label=f'Mean {v.mean():.1f}');a.axvline(np.median(v),color=BLUE,lw=3,ls='--',label=f'Median {np.median(v):.1f}');a.set(xlim=(10,175),ylim=(-.32,.5),yticks=[],xlabel='Illustrative measurement',title=f'Range {np.ptp(v):.0f}     Sample SD {v.std(ddof=1):.1f}');a.legend(loc='upper right',ncol=2);save(f,f'moving-point-{state}')
f,ax=canvas(3)
for a,v,t in zip(ax[0],[rng.normal(0,1,1500),rng.lognormal(0,.7,1500),np.r_[rng.normal(-2,.5,750),rng.normal(2,.8,750)]],['Roughly symmetric','Right-skewed','Two modes']):a.hist(v,bins=28,color=TEAL,edgecolor='white');a.set(title=t,xlabel='Illustrative measurement',ylabel='Frequency');grid(a)
save(f,'shapes')
f,ax=canvas();a=ax[0,0];v=np.array([10,15,25,30,44,52,58,59,61,70,88,93]);a.scatter(v,np.ones(len(v)),s=110,color=TEAL);a.vlines([0,25,50,75,100],.5,1.5,color=GREY,ls='--');a.set(xlim=(-4,104),ylim=(.2,1.8),yticks=[],xlabel='Illustrative values: equal-width bins',title='Which information survives a bin label?');save(f,'discretise')
# Boxplot anatomy, normal empirical rule, robust thresholds.
v=np.r_[small[:-1],80.];q1,med,q3=np.percentile(v,[25,50,75]);iqr=q3-q1
# Separate, spacious teaching sample so fences and whiskers are distinguishable.
bv=np.r_[np.arange(10,32,2),60.];bq1,bmed,bq3=np.percentile(bv,[25,50,75]);biqr=bq3-bq1;blo=bq1-1.5*biqr;bhi=bq3+1.5*biqr
f,ax=canvas(size=(14,6));a=ax[0,0]
a.boxplot(bv,orientation='horizontal',positions=[1.2],widths=.42,patch_artist=True,boxprops={'facecolor':'#d5eeea'},medianprops={'color':RED,'linewidth':3},flierprops={'markeredgecolor':RED,'markersize':9})
a.scatter(bv,np.full(len(bv),-.25),s=65,color=TEAL)
a.vlines([blo,bhi],-.65,1.65,ls=':',color=RED,lw=2)
def label(txt,xy,at,color='#242424'):
 a.annotate(txt,xy,xytext=at,ha='center',va='center',fontsize=15,color=color,arrowprops={'arrowstyle':'->','color':GREY,'lw':1.5})
label('Q1: 25th percentile',(bq1,1.42),(7,2.35));label('Median: 50th percentile',(bmed,1.42),(27,2.75));label('Q3: 75th percentile',(bq3,1.42),(47,2.35))
label('Lower whisker\nsmallest observation\ninside the fences',(bv.min(),1.2),(-10,.85))
label('Upper whisker\nlargest observation\ninside the fences',(30,1.2),(51,.75))
label('Flagged point\nbeyond the fence',(60,1.2),(72,2.1),RED)
a.annotate('',(bq1,.65),(bq3,.65),arrowprops={'arrowstyle':'|-|','color':TEAL,'lw':2});a.text(bmed,.37,'IQR = Q3 − Q1',ha='center',fontsize=16,color=TEAL)
a.text(blo,-.95,'Lower fence\nQ1 − 1.5 × IQR',ha='center',color=RED,fontsize=16);a.text(bhi,-.95,'Upper fence\nQ3 + 1.5 × IQR',ha='center',color=RED,fontsize=16)
a.text(73,-.25,'Raw values',ha='center',fontsize=14,color=TEAL)
a.set(yticks=[],ylim=(-1.5,3.1),xlim=(-23,85),xlabel='Illustrative measurement');save(f,'box-anatomy')
f,ax=canvas(3)
for a,k,pct in zip(ax[0],[1,2,3],['68%','95%','99.7%']):
 x=np.linspace(-4,4,500);y=np.exp(-x*x/2)/np.sqrt(2*np.pi);a.plot(x,y,color=BLUE);a.fill_between(x,y,where=np.abs(x)<=k,color=TEAL,alpha=.5);a.set(title=f'Within {k} SD: about {pct}',xlabel='Standard deviations from mean',yticks=[]);a.set_xticks([-3,-2,-1,0,1,2,3])
save(f,'normal-rule')
f,ax=canvas();a=ax[0,0];mad=np.median(np.abs(v-np.median(v))); thresholds=[(v.mean()-3*v.std(ddof=1),v.mean()+3*v.std(ddof=1)),(med-3*1.4826*mad,med+3*1.4826*mad),(q1-1.5*iqr,q3+1.5*iqr)]
for i,(lo,hi) in enumerate(thresholds):
 a.plot([lo,hi],[i,i],color=TEAL,lw=8,alpha=.2);a.scatter(v,np.full(len(v),i),c=[RED if x<lo or x>hi else TEAL for x in v],s=95,zorder=3);a.vlines([lo,hi],i-.2,i+.2,color=GREY)
a.set(yticks=[0,1,2],yticklabels=['Mean ± 3 sample SD','Median ± 3 × 1.4826 MAD','Q1 − 1.5 IQR to Q3 + 1.5 IQR'],ylim=(-.5,2.5),xlabel='Illustrative measurement',title='A flag starts an investigation');save(f,'outlier-methods')
# Different distributions can have similar summaries.
groups=[hourly.query('count_point_id == @s').cars.to_numpy() for s in [6401,8599,16961]]
labels=['A38\n6401','A4\n8599','A370\n16961']
f,ax=canvas(2)
a=ax[0,0];a.bar(labels,[g.mean() for g in groups],color=TEAL);a.set(title='Means alone',ylabel='Cars and taxis per site-hour');bars(a)
a=ax[0,1];a.boxplot(groups,tick_labels=labels,patch_artist=True,boxprops={'facecolor':'#d5eeea'},medianprops={'color':RED});
for i,g in enumerate(groups,1):a.scatter(rng.normal(i,.045,len(g)),g,s=50,color=TEAL,alpha=.8);a.text(i,.97,f'n = {len(g)}',transform=a.get_xaxis_transform(),ha='center',va='top',fontsize=13)
a.set(title='Distributions and sample sizes',ylabel='Cars and taxis per site-hour',ylim=(min(map(min,groups))*.85,max(map(max,groups))*1.18));grid(a);save(f,'group-views')
f,ax=canvas(2)
a=ax[0,0];parts=a.violinplot(groups,showmedians=True)
for b in parts['bodies']:b.set_facecolor(TEAL)
a.set_xticks([1,2,3],labels);a.set(title='Violin: smoothed distribution',ylabel='Cars and taxis per site-hour');grid(a)
a=ax[0,1]
# Deterministic horizontal spreading of close values, rather than implying a new x variable.
for i,g in enumerate(groups,1):
 slots=[]
 for val in sorted(g):
  near=sum(abs(val-prev)<35 for prev in slots);slots.append(val);offset=((near+1)//2)*.055*(1 if near%2 else -1);a.scatter(i+offset,val,s=80,color=TEAL)
a.set_xticks([1,2,3],labels);a.set(xlim=(.5,3.5),title='Swarm: individual observations',ylabel='Cars and taxis per site-hour');grid(a);save(f,'violin-swarm')
# Relationships.
f,ax=canvas();a=ax[0,0];a.scatter(hourly.cars,hourly.bicycles,c=TEAL,s=45,alpha=.5);a.set(xlabel='Cars and taxis per site-hour',ylabel='Bicycles per site-hour',title='Each point is one matched site/date/hour');grid(a);save(f,'traffic-scatter')
f,ax=canvas(2)
for a,size,alpha,title in zip(ax[0],[130,25],[1,.25],['Large opaque points','Smaller transparent points']):a.scatter(hourly.cars,hourly.bicycles,s=size,alpha=alpha,c=TEAL);a.set(xlabel='Cars and taxis',ylabel='Bicycles',title=title);grid(a)
save(f,'overplotting')
f,ax=canvas(4,size=(14,4.5));x=np.linspace(-2,2,90)
for a,y,title in zip(ax[0],[x+rng.normal(0,.2,90),-x+rng.normal(0,.3,90),x+rng.normal(0,2.2,90),x*x],['A','B','C','D']):a.scatter(x,y,c=TEAL,s=24);a.set(title=title,xticks=[],yticks=[],xlabel='x',ylabel='y')
save(f,'correlation-quiz')
f,ax=canvas(2);x=np.linspace(-2,2,101);ax[0,0].scatter(x,x*x,s=35,c=TEAL);ax[0,0].set(title='Pearson r = 0',xlabel='x',ylabel='y = x²');x1=np.linspace(0,2,30);x2=np.linspace(5,7,30);y1=2-.7*x1+rng.normal(0,.12,30);y2=10-.7*x2+rng.normal(0,.12,30);ax[0,1].scatter(x1,y1,color=TEAL,label='Group A');ax[0,1].scatter(x2,y2,color=RED,label='Group B');ax[0,1].set(title='Aggregate and within-group patterns differ',xlabel='x',ylabel='y');ax[0,1].legend(fontsize=13);save(f,'correlation-caveats')
f,ax=canvas(3);x=np.linspace(30,70,25);y=2*x+rng.normal(0,3,25);xx=np.r_[x,55];yy=np.r_[y,70];ax[0,0].hist(xx,bins=8,color=TEAL,edgecolor='white');ax[0,0].axvline(55,color=RED,lw=3);ax[0,0].set(title='x alone',xlabel='x',ylabel='Count');ax[0,1].hist(yy,bins=8,color=TEAL,edgecolor='white');ax[0,1].axvline(70,color=RED,lw=3);ax[0,1].set(title='y alone',xlabel='y');ax[0,2].scatter(x,y,c=TEAL,s=35);ax[0,2].scatter([55],[70],facecolors='none',edgecolors=RED,lw=3,s=220);ax[0,2].set(title='The combination',xlabel='x',ylabel='y');
ax[0,2].set_visible(False);f.savefig(A/'multivariate-first.svg');ax[0,2].set_visible(True);save(f,'multivariate')
# Scale-sensitive distances, and actual profiles.
p=np.array([[100,20],[130,80],[200,25.]]);scaled=(p-p.min(0))/(p.max(0)-p.min(0))
f,ax=canvas(2)
for a,v,t in zip(ax[0],[p,scaled],['Original counts','Min–max scaled features']):
 for i,label,c in zip(range(3),['A','B','C'],[RED,TEAL,BLUE]):a.scatter(*v[i],s=160,color=c);a.annotate(label,v[i],xytext=(10,8),textcoords='offset points',fontsize=20)
 for i in [1,2]:a.plot(v[[0,i],0],v[[0,i],1],ls='--',c=GREY)
 a.set(title=t,xlabel='Cars',ylabel='Bicycles');a.margins(.22);a.set_aspect('equal',adjustable='datalim');grid(a)
save(f,'distances')
f,ax=canvas(3)
v=hourly[['cars','bicycles']].to_numpy(float)
for a,x,t in zip(ax[0],[v,(v-v.min(0))/(v.max(0)-v.min(0)),(v-v.mean(0))/v.std(0)],['Original counts','Min–max [0, 1]','Standardised (population SD)']):a.scatter(x[:,0],x[:,1],s=16,c=TEAL,alpha=.45);a.set(title=t,xlabel='Cars and taxis',ylabel='Bicycles');grid(a)
save(f,'scaling-scatter')
f,ax=canvas(2)
for a,standard,title in zip(ax[0],[False,True],['Original units: absolute counts','Standardised: relative hourly profiles']):
 for name,c in [('cars',RED),('bicycles',TEAL)]:
  s=day[name];s=(s-s.mean())/s.std(ddof=0) if standard else s;a.plot(day.hour,s,'o-',color=c,label='Cars and taxis' if name=='cars' else 'Bicycles',lw=2)
 a.set(xlabel='Hour on 13 July 2023',ylabel='z-score' if standard else 'Vehicles counted',title=title);a.legend(fontsize=12);grid(a)
save(f,'profiles')
f,ax=canvas(2)
for a,v,title in zip(ax[0],[np.array([10,20,30,40,50.]),np.array([10,20,30,40,500.])],['Maximum = 50','Maximum = 500']):
 s=(v-v.min())/(v.max()-v.min());a.scatter(s,np.zeros(5),s=140,c=[TEAL]*4+[RED]);
 for i,(x,lab) in enumerate(zip(s,v)):
  dy=[48,-48,24,-24,24][i] if v.max()>100 else (18 if i%2==0 else -28)
  a.annotate(f'{lab:.0f}',(x,0),xytext=(0,dy),textcoords='offset points',ha='center',arrowprops={'arrowstyle':'-','color':GREY} if v.max()>100 else None)
 a.set(xlim=(-.08,1.08),ylim=(-.5,.5),yticks=[],xlabel='Min–max scaled value',title=title)

ax[0,1].set_visible(False);f.savefig(A/'scaling-outlier-first.svg');ax[0,1].set_visible(True);save(f,'scaling-outlier')
# Higher dimensional view uses vans as genuine extra field, not a duplicate axis.
f,ax=canvas();a=ax[0,0];s=a.scatter(hourly.cars,hourly.bicycles,c=hourly.hour,s=18+hourly.vans*.18,cmap='viridis',alpha=.65);a.set(xlabel='Cars and taxis',ylabel='Bicycles',title='Colour: hour     Area above minimum marker: van count');f.colorbar(s,ax=a,label='Hour');
for val in [100,500,1000]:a.scatter([],[],s=18+val*.18,c='#aaa',alpha=.7,label=f'{val} vans')
a.legend(title='Size key',fontsize=12);grid(a);save(f,'many-variables')
f,ax=canvas(2);site=hourly.groupby(['count_point_id','road_name','latitude','longitude'],as_index=False).cars.mean();sel=site.nlargest(8,'cars').sort_values('cars');ax[0,0].barh([f'{r.road_name} ({r.count_point_id})' for r in sel.itertuples()],sel.cars,color=TEAL);ax[0,0].set(title='Ranking selected observed sites',xlabel='Mean recorded cars and taxis / hour');a=ax[0,1];sc=a.scatter(site.longitude,site.latitude,c=site.cars,s=90,cmap='viridis',edgecolors='white');a.set(title='Where were the counts recorded?',xlabel='Longitude',ylabel='Latitude');a.set_aspect(1/np.cos(np.deg2rad(51.45)));f.colorbar(sc,ax=a,label='Mean observed hourly count');save(f,'map-ranking')
# Real annual air-quality measurements remain a separate layer.
no2=pd.read_csv(ROOT/'data/bristol_no2_2023.csv');f,ax=canvas();a=ax[0,0];sc=a.scatter(no2.longitude,no2.latitude,c=no2.no2_ugm3,s=65,cmap='viridis',edgecolors='white');a.set(title='Bristol monitoring locations: annual NO₂, 2023',xlabel='Longitude',ylabel='Latitude');a.set_aspect(1/np.cos(np.deg2rad(51.45)));f.colorbar(sc,ax=a,label='Annual NO₂ (µg/m³)');save(f,'no2-map')
# A teaching network explicitly requiring connections.
f,ax=canvas(size=(12,5));a=ax[0,0];coords={'A':(0,0),'B':(1,1),'C':(2,0),'D':(3,1),'E':(4,0)};edges=[('A','B'),('B','C'),('C','D'),('D','E'),('B','D')]
for u,w in edges:a.plot([coords[u][0],coords[w][0]],[coords[u][1],coords[w][1]],c=GREY,lw=4,zorder=1)
for label,(x,y) in coords.items():a.scatter(x,y,s=850,c=TEAL,zorder=2);a.text(x,y,label,ha='center',va='center',color='white',fontsize=22)
a.axis('off');a.set_title('Illustrative junctions (nodes) and road links (edges)');a.margins(.18);save(f,'network')
# A clinic chart whose faults remain for students to diagnose.
f,ax=canvas();a=ax[0,0];means=np.array([g.mean() for g in groups]);a.bar(labels,means,color=[RED,TEAL,BLUE]);a.set(ylim=(max(0,means.min()*.85),means.max()*1.12),title='“This road is always busier”',ylabel='Average count');save(f,'clinic')
meta={'records':len(traffic),'site_hours':len(hourly),'sites':traffic.count_point_id.nunique(),'pearson':float(hourly.cars.corr(hourly.bicycles)),'cars':hourly.cars.describe().to_dict(),'illustrative_outlier':{'q1':q1,'median':med,'q3':q3,'mad':mad,'mean':float(np.r_[small[:-1],80.].mean())}}
(ROOT/'output/data-summary.json').write_text(json.dumps(meta,indent=2))
print(f'Generated {len(list(A.glob("*.svg")))} SVG figures; {len(hourly)} observed site-hours.')

# A legible alternative retaining all four variables and all 480 observations.
f,axes=plt.subplots(2,3,figsize=(14,6.1),layout='constrained',sharex=True)
periods=[(7,10,'07:00–10:00'),(11,14,'11:00–14:00'),(15,18,'15:00–18:00')]
for j,(lo,hi,title) in enumerate(periods):
 h=hourly[hourly.hour.between(lo,hi)]
 for row,field,color in [(0,'bicycles',TEAL),(1,'vans',BLUE)]:
  a=axes[row,j];a.scatter(h.cars,h[field],s=21,c=color,alpha=.5);a.set(xlim=(0,6100),ylim=(0,400 if row==0 else float(hourly.vans.max())*1.06));grid(a)
  if row==0:a.set_title(title)
  if row==1:a.set_xlabel('Cars and taxis')
  if j==0:a.set_ylabel('Bicycles' if row==0 else 'Vans')
save(f,'many-variables-facets')
# Correct comparison for the Suffolk Coastal leaflet, using 2017 results.
f,ax=canvas(size=(7,5));a=ax[0,0];a.bar(['Conservative','Labour','Lib Dem'],[58.1,30.5,7.0],color=[BLUE,RED,GOLD]);a.bar_label(a.containers[0],fmt='%.1f%%',padding=5);a.set(ylim=(0,68),ylabel='2017 vote share (%)',title='Suffolk Coastal: published results');bars(a);save(f,'suffolk-correct')
# Anscombe quartet: same strong correlation, four different structures.
xx=np.array([10,8,13,9,11,14,6,4,12,7,5.]);xx4=np.array([8,8,8,8,8,8,8,19,8,8,8.])
ysets=[np.array(z) for z in [[8.04,6.95,7.58,8.81,8.33,9.96,7.24,4.26,10.84,4.82,5.68],[9.14,8.14,8.74,8.77,9.26,8.10,6.13,3.10,9.13,7.26,4.74],[7.46,6.77,12.74,7.11,7.81,8.84,6.08,5.39,8.15,6.42,5.73],[6.58,5.76,7.71,8.84,8.47,7.04,5.25,12.50,5.56,7.91,6.89]]]
f,axes=plt.subplots(1,4,figsize=(14,4.5),layout='constrained',sharex=True,sharey=True)
for i,(a,y) in enumerate(zip(axes,ysets)):
 x=xx if i<3 else xx4;a.scatter(x,y,c=TEAL,s=60);a.plot([2,20],[4,13],color=RED,lw=2);a.set(xlim=(2,20),ylim=(2,15),title=f'{"I II III IV".split()[i]}: r = {np.corrcoef(x,y)[0,1]:.3f}',xlabel='x')
axes[0].set_ylabel('y');save(f,'anscombe')
# Replot the published dataset; do not draw a new animal or invent correlation.
dino=pd.read_csv(ROOT/'data/datasaurus-dozen.tsv',sep='\t')
f,axes=plt.subplots(1,3,figsize=(14,5),layout='constrained',sharex=True,sharey=True)
for a,name,title in zip(axes,['dino','circle','h_lines'],['A dinosaur','A circle','Horizontal lines']):
 d=dino[dino.dataset==name];a.scatter(d.x,d.y,s=30,c=TEAL);a.set(title=title,xlim=(0,100),ylim=(0,105),xlabel='x');a.set_aspect('equal')
axes[0].set_ylabel('y');save(f,'datasaurus')
stats=dino.groupby('dataset').apply(lambda d:pd.Series({'mean_x':d.x.mean(),'mean_y':d.y.mean(),'sd_x':d.x.std(),'sd_y':d.y.std(),'r':d.x.corr(d.y)}),include_groups=False)
stats.to_csv(ROOT/'output/datasaurus-statistics.csv')
# Three deliberately flawed graphs for critique; no solutions in the graphics.
f,axes=plt.subplots(1,3,figsize=(14,5),layout='constrained')
a=axes[0];a.bar(['A','B'],[48,52],color=[TEAL,BLUE]);a.set(ylim=(45,55),title='A: “A huge improvement”',ylabel='Score');a.bar_label(a.containers[0]);grid(a)
a=axes[1];a.bar(['Group 1','Group 2'],[50,50],color=[TEAL,BLUE]);a.set(ylim=(0,70),title='B: “The groups are identical”',ylabel='Mean measurement');grid(a)
a=axes[2];a.plot([2021,2022,2023,2024],[20,30,45,60],'o-',color=RED,lw=3);a.set(ylim=(70,0),xticks=[2021,2022,2023,2024],title='C: “Complaints are falling”',ylabel='Recorded complaints');grid(a)
save(f,'clinic-three')
