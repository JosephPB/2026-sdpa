from pathlib import Path
import json,shutil
import pandas as pd
p=Path(__file__).resolve().parent
raw=json.loads((p/'data/raw/traffic-2023.json').read_text());assert raw['last_page']==1
x=pd.DataFrame(raw['data']);assert x.local_authority_id.eq(144).all();assert x.longitude.astype(float).between(-2.8,-2.4).all()
cols=['count_point_id','count_date','hour','direction_of_travel','pedal_cycles','cars_and_taxis','buses_and_coaches','lgvs','all_hgvs','all_motor_vehicles']
x[cols].rename(columns={'pedal_cycles':'bicycles','cars_and_taxis':'cars','buses_and_coaches':'buses','lgvs':'vans','all_hgvs':'lorries','all_motor_vehicles':'motor_vehicles','direction_of_travel':'direction'}).sort_values(['count_point_id','count_date','hour','direction']).to_csv(p/'data/bristol_traffic_2023.csv',index=False)
x[['count_point_id','road_name','latitude','longitude','start_junction_road_name','end_junction_road_name']].drop_duplicates().to_csv(p/'data/count_points.csv',index=False)
j=json.loads((p/'data/raw/air-quality-2023.geojson').read_text());rows=[]
for f in j['features']:
 a=f['properties'];c=f['geometry']['coordinates'];rows.append({'site_id':a['SITEID'],'location':a['LOCATION'],'no2_ugm3':a['UGM3_2023'],'sample_count':a['COUNT_2023'],'year':2023,'longitude':c[0],'latitude':c[1]})
a=pd.DataFrame(rows);a.to_csv(p/'data/bristol_no2_2023.csv',index=False)
# Rebuild the compact geometry and the browser activity payload.
lines=[]
for feature in json.loads((p/'data/raw/bristol-classified-streets.geojson').read_text())['features']:
 g=feature['geometry']
 for path in ([g['coordinates']] if g['type']=='LineString' else g['coordinates']):
  lines.append({'coordinates':path,'river':False})
(p/'data/bristol_roads.json').write_text(json.dumps(lines,separators=(',',':')))
import os
os.chdir(p)
os.environ.setdefault('MPLCONFIGDIR',str(p/'.mpl-cache'))
ns={};exec((p/'live/setup.py').read_text(),ns)
activity={'hist':ns['site_hour'].bicycles.tolist(),'traffic':json.loads(ns['mapped'].to_json(orient='records')),'air':json.loads(ns['air'].to_json(orient='records')),'roads':lines,'mask':ns['traffic'][['count_point_id','hour','bicycles','cars']].head(6).to_dict('records')}
(p/'data/activities.json').write_text(json.dumps(activity,separators=(',',':')))
print('traffic',len(x),'sites',x.count_point_id.nunique(),'hours',sorted(x.hour.unique()),'dates',x.count_date.nunique(),'air',len(a),a.no2_ugm3.describe().to_dict());print(x.groupby('count_point_id').size().head());print(a.head().to_string(index=False))
