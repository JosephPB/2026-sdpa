"""Rebuild editable teaching diagrams and the charts from bundled Week 7 data."""
from pathlib import Path
import html
import base64
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets'
DUCK = 'data:image/png;base64,' + base64.b64encode((OUT/'duck.png').read_bytes()).decode()
RED, TEAL, GOLD, INK = '#a71930', '#167b83', '#bf881c', '#242424'

def text(x,y,s,size=30,fill=INK,anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}">{html.escape(str(s))}</text>'
def line(x,y,x2,y2,color='#aaa',width=2):
    return f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>'
def box(x,y,w,h,fill='white',stroke='#bbb'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def arrow(x,y,x2,y2):
    return f'<path d="M{x},{y} L{x2},{y2}" stroke="{RED}" stroke-width="3" fill="none" marker-end="url(#arrow)"/>'
def save(name,body,height=430,title='Teaching diagram',width=1300):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img"><title>{html.escape(title)}</title><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="{RED}"/></marker></defs><g font-family="Arial,Helvetica,sans-serif">{body}</g></svg>')

# A 1D input can supply a column; orientation belongs to the constructed 2D array.
b=''
for x,label,values,color in [(50,'x',[10,20,30],RED),(300,'y',[1,2,3],TEAL)]:
    b+=text(x+50,45,label,36,color,'middle')
    for r,value in enumerate(values):
        b+=box(x,100+r*75,100,75,'#f6e4e8' if color==RED else '#e8f2f2',color)+text(x+50,150+r*75,value,38,color,'middle')
    b+=text(x+50,385,'shape (3,)',28,INK,'middle')
b+=arrow(480,210,700,210)+text(590,175,'side by side',28,INK,'middle')
b+=text(815,40,'Three rows, two columns',32)
for c,label in enumerate(['column 0','column 1']):
    b+=text(925+c*150,80,label,26,RED if c==0 else TEAL,'middle')
for r,values in enumerate([[10,1],[20,2],[30,3]]):
    b+=text(815,150+r*75,'row '+str(r),27,INK,'end')
    for c,value in enumerate(values):
        color=RED if c==0 else TEAL
        b+=box(850+c*150,100+r*75,150,75,'#f6e4e8' if c==0 else '#e8f2f2',color)+text(925+c*150,150+r*75,value,38,color,'middle')
b+=text(850,385,'shape (3, 2)',30)
save('array-columns.svg',b,title='Two one-dimensional arrays supply two columns in a three-row array')

b=text(160,40,'As columns',34)+text(790,40,'As rows',34)
for r,values in enumerate([[10,1],[20,2],[30,3]]):
    for c,value in enumerate(values):
        color=RED if c==0 else TEAL
        b+=box(160+c*110,70+r*65,110,65,'#f6e4e8' if c==0 else '#e8f2f2',color)+text(215+c*110,115+r*65,value,38,color,'middle')
for r,values in enumerate([[10,20,30],[1,2,3]]):
    for c,value in enumerate(values):
        color=RED if r==0 else TEAL
        b+=box(790+c*110,95+r*65,110,65,'#f6e4e8' if r==0 else '#e8f2f2',color)+text(845+c*110,140+r*65,value,38,color,'middle')
b+=text(160,315,'3 rows × 2 columns',31)+text(790,315,'2 rows × 3 columns',31)
save('array-stacking.svg',b,360,title='The same input values arranged as columns or as rows')

# Axis/shape relationships, not a decorative drawing.
b=text(20,40,'RGB image',36)+f'<image href="{DUCK}" x="20" y="90" width="360" height="250" style="image-rendering:pixelated"/>'
b+=arrow(420,210,580,210)+text(650,60,'shape',34)
b+=text(650,130,'(',44)+text(800,130,',',44)+text(1040,130,',',44)+text(1220,130,')',44)
for x,value,label,color in [(720,'7','7 rows',RED),(940,'10','10 columns',TEAL),(1160,'3','3 channels',GOLD)]:
    b+=text(x,130,value,44,color,'middle')+line(x,155,x,215,color,3)+text(x,260,label,28,color,'middle')
b+=text(650,340,'RGB[row, column, channel]',32)
save('array-axes.svg',b,title='An RGB image has row, column and channel axes')

# Separate source and answer assets keep the quiz result hidden until Next.
a=np.arange(20).reshape(4,5)
b=text(30,45,'Array a',34)
for r in range(4):
    for c in range(5):
        b+=box(30+c*100,85+r*72,100,72)+text(80+c*100,132+r*72,a[r,c],34,INK,'middle')
save('slice-input.svg',b,430,title='Array a contains 0 through 19 in four rows and five columns',width=600)
b=''
for r in range(2):
    for c in range(3):
        b+=box(30+c*115,30+r*85,115,85,'#f6e4e8')+text(87+c*115,85+r*85,a[r+1,c+1],39,RED,'middle')
b+=text(30,260,'shape = (2, 3)',36)
# A compact viewBox fits the result in the right-hand answer column.
(OUT/'slice-answer.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 300" role="img"><title>Slice result: two rows and three columns</title><g font-family="Arial">'+b+'</g></svg>')

b=text(20,40,'A labelled table',34)
head=['site','hour','bicycles','cars'];rows=[['A38',12,10,182],['A38',14,11,233],['A38',15,8,286]]
for i,row in enumerate([head]+rows):
    for j,v in enumerate(row):b+=box(20+j*150,75+i*65,150,65,'#f6e4e8' if j==2 else 'white')+text(95+j*150,117+i*65,v,28,INK,'middle')
b+=arrow(670,180,790,180)+text(850,95,'Named columns',32)+text(850,155,'Select rows by condition',30)+text(850,215,'Summarise groups',30)+text(850,275,'Join related tables',30)+text(850,335,'Track missing values',30)
save('dataframe.svg',b,title='A DataFrame combines a labelled table with selection and analysis')

b=text(20,40,'Structured fields',34)+text(470,40,'Unstructured content',34)
for i,row in enumerate([['site','count'],['A38','182'],['A4','233']]):
    for j,v in enumerate(row):b+=box(20+j*180,90+i*65,180,65,'#f6e4e8' if i==0 else 'white')+text(110+j*180,132+i*65,v,29,INK,'middle')
b+=text(20,340,'Repeated, named fields',28)
b+=text(470,110,'“Traffic was heavy near',32)+text(470,155,'the junction this morning.”',32)
b+=text(950,85,'Image content',29,RED)
b+=f'<image href="{DUCK}" x="950" y="105" width="250" height="175" style="image-rendering:pixelated"/>'
b+=text(950,315,'What is pictured?',28)
b+=text(470,340,'Free text',28,RED)
save('structure.svg',b,title='Tabular fields compared with free text and image content')

b=text(30,40,'A nested record',34)
code=['{','  "site": "A38",','  "counts": {','    "cars": 182,','    "bicycles": 10','  }','}']
for i,s in enumerate(code):b+=text(30,85+i*41,s,29,RED if i in [2,3,4,5] else INK)
b+=arrow(520,200,650,200)
b+=text(745,75,'observation',34)+line(835,90,835,135)+line(745,135,1045,135)+line(745,135,745,170)+line(1045,135,1045,170)+text(745,205,'site: A38',30,INK,'middle')+text(1045,205,'counts',30,RED,'middle')+line(1045,225,1045,265)+line(900,265,1170,265)+text(900,310,'cars: 182',28,RED,'middle')+text(1170,310,'bicycles: 10',28,RED,'middle')
b+=text(700,390,'Keys and nesting organise the fields.',28)
save('nested-record.svg',b,title='JSON keys and nesting describe a record hierarchy')

b=''
labels=['Files','Web API','Database','Sensor','Webpage']
for i,label in enumerate(labels):
    y=35+i*75;b+=text(40,y+30,label,32)+arrow(250,y+20,530,215)
b+=box(560,155,295,120,'#f6e4e8',RED)+text(708,205,'Retrieve + save',32,INK,'middle')+text(708,245,'raw source',28,INK,'middle')+arrow(885,215,1010,215)+text(1040,200,'Parse',34)+text(1040,250,'and process',30)
save('sources.svg',b,title='Files, APIs, databases, sensors and webpages feed an acquisition pipeline')

b=text(25,45,'Python client',36)+text(1010,45,'Server',36)
b+=arrow(250,115,1000,115)+text(625,93,'HTTPS request',31,RED,'middle')+arrow(1000,320,250,320)+text(625,365,'HTTP response',31,TEAL,'middle')
b+=text(265,170,'GET  /observations?site=A38',33)+text(265,215,'Accept: application/json',29)
b+=text(265,285,'200 OK   ·   Content-Type: application/json',29)
b+=text(35,390,'Method + URL + headers + optional body',27)+text(730,390,'Status + headers + body',27)
save('api-anatomy.svg',b,title='An HTTP request and response between a Python client and a server')

b=text(25,45,'https://example.org/observations?site=A38',40)
for x,label,color in [(110,'scheme',RED),(390,'host',TEAL),(740,'resource path',RED),(1100,'query',TEAL)]:
    b+=line(x,75,x,150,color,3)+text(x,195,label,30,color,'middle')
b+=text(30,280,'A resource has a URL. A representation is returned.',33)
b+=text(30,345,'Each request supplies the context the server needs.',31)
save('rest-url.svg',b,title='URL scheme, host, resource path and query in an illustrative REST request')

b=''
stages=[('Response','JSON text in the body'),('dict','parsed JSON object'),('list','parsed data array'),('DataFrame','records in columns')]
for i,(title,detail) in enumerate(stages):
    x=15+i*325;b+=text(x,100,title,35,RED)+text(x,155,detail,26)
    if i<3:b+=arrow(x+240,105,x+300,105)
b+=text(285,235,'response.json()',28,RED,'middle')+text(610,235,'payload["data"]',28,RED,'middle')+text(970,235,'pd.DataFrame(...)',27,RED,'middle')
save('response-types.svg',b,280,title='JSON text is parsed into Python dictionaries and lists before a DataFrame is constructed')

b=text(20,40,'HTML from Books to Scrape',34)
for i,(value,c) in enumerate([('<article class="product_pod">',RED),('  <h3>…</h3>',INK),('  <p class="price_color">',TEAL),('    £51.77',TEAL),('  </p>',TEAL),('</article>',RED)]):
    b+=text(20,95+i*48,value,29,c)
b+=arrow(665,205,765,205)+text(815,105,'article.product_pod',29,RED)+text(815,175,'.price_color',31,TEAL)+text(815,255,'text → "£51.77"',31)+text(815,330,'numeric price → 51.77',29)
save('html-tree.svg',b,title='The public book page stores each price in a paragraph with class price_color')

b=''
for x,label,detail in [(25,'Raw','Original JSON / HTML'),(470,'Processed','Selected, typed columns'),(930,'Result','Table or plot')]:
    b+=text(x,100,label,36,RED)+text(x,165,detail,28)
b+=arrow(300,120,420,120)+arrow(795,120,900,120)
b+=text(25,275,'Keep the source URL, parameters and retrieval time.',31)+text(25,345,'A saved raw response lets you repeat the processing.',31)
save('raw-processed.svg',b,title='Preserve raw data separately from processed data and results')

plt.rcParams.update({'font.family':'Arial','font.size':15,'axes.spines.top':False,'axes.spines.right':False,'axes.prop_cycle':plt.cycler(color=[RED,TEAL,GOLD])})
t=pd.read_csv(ROOT/'data/bristol_traffic_2023.csv')
counts=['bicycles','cars','buses','vans','lorries','motor_vehicles']
s=t.groupby(['count_point_id','count_date','hour'],as_index=False)[counts].sum()
m=s.groupby('count_point_id',as_index=False)[counts].mean()
day=s[s.count_point_id==6401].sort_values('hour')
fig,ax=plt.subplots(2,3,figsize=(17,6.5),layout='constrained')
ax[0,0].plot(day.hour,day.cars,'o-',color=RED);ax[0,0].set(title='Line · change over time',xlabel='Hour starting',ylabel='Cars + taxis counted')
ax[0,1].scatter(m.cars,m.bicycles,color=TEAL,alpha=.8);ax[0,1].set(title='Scatter · relationship',xlabel='Mean cars + taxis / hour',ylabel='Mean bicycles / hour')
ax[0,2].hist(s.bicycles,bins=15,color=RED,edgecolor='white');ax[0,2].set(title='Histogram · distribution',xlabel='Bicycles / observed site-hour',ylabel='Number of site-hours')
v=s[['cars','buses','vans','lorries']].sum()
ax[1,0].bar(v.index,v.values,color=TEAL);ax[1,0].set(title='Bar · category totals',ylabel='Vehicles counted')
top=m.nlargest(5,'bicycles').sort_values('bicycles');ax[1,1].barh(top.count_point_id.astype(str),top.bicycles,color=RED);ax[1,1].set(title='Horizontal bar · ranking',xlabel='Mean bicycles / hour',ylabel='Count-point ID')
ax[1,2].pie(v.values,labels=v.index,colors=[RED,TEAL,GOLD,'#888'],textprops={'fontsize':13});ax[1,2].set_title('Pie · shares of these four categories',fontsize=14)
fig.savefig(OUT/'chart-gallery.png',dpi=140);plt.close(fig)
fig,ax=plt.subplots(figsize=(10,4),layout='constrained');ax.plot(day.hour,day.cars,'o-',color=RED);ax.set(xlabel='Hour starting',ylabel='Cars and taxis counted',title='A38, site 6401 · 13 July 2023');fig.savefig(OUT/'traffic-line.png',dpi=150);plt.close(fig)
# This asset matches the displayed code: default plotting style and no title.
with plt.rc_context(plt.rcParamsDefault):
    fig,ax=plt.subplots()
    ax.plot(day['hour'],day['cars'],'o-')
    ax.set_xlabel('Hour starting')
    ax.set_ylabel('Cars and taxis counted')
    fig.savefig(OUT/'traffic-line-code.png',dpi=150,bbox_inches='tight')
    plt.close(fig)

fig,ax=plt.subplots(figsize=(10,4),layout='constrained');ax.bar(['A','B','C'],[15,40,25],color=[RED,TEAL,GOLD]);ax.set(xlabel='Site',ylabel='Mean bicycle count',title='Illustrative grouped observations');fig.savefig(OUT/'group-summary.png',dpi=120);plt.close(fig)
print('Rebuilt teaching diagrams and charts.')
