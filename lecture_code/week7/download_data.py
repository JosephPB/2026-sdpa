"""Explicitly refresh public source files. Rebuild teaching extracts afterwards."""
from pathlib import Path
import urllib.request,urllib.parse,json,hashlib
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'data/raw';RAW.mkdir(exist_ok=True)
manifest=[]
def download(name,base,params):
 url=base+'?'+urllib.parse.urlencode(params)
 with urllib.request.urlopen(url,timeout=90) as response: payload=response.read()
 data=json.loads(payload)
 if isinstance(data,dict) and 'error' in data:raise RuntimeError(data['error'])
 if isinstance(data,dict) and data.get('exceededTransferLimit'):raise RuntimeError('Source pagination needed; do not silently truncate')
 (RAW/name).write_bytes(payload)
 manifest.append({'file':name,'url':url,'sha256':hashlib.sha256(payload).hexdigest()})
 return data
traffic=download('traffic-2023.json','https://roadtraffic.dft.gov.uk/api/raw-counts',{'filter[local_authority_id]':144,'filter[year]':2023,'page[size]':10000})
assert traffic['last_page']==1,'Source pagination needed'
assert all(r['local_authority_id']==144 and -2.8<float(r['longitude'])<-2.4 for r in traffic['data'])
download('air-quality-2023.geojson','https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_environment_and_planning/MapServer/8/query',{'where':'UGM3_2023 IS NOT NULL','outFields':'SITEID,LOCATION,UGM3_2023,COUNT_2023','outSR':4326,'f':'geojson'})
base='https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_transport/MapServer/7'
download('roads-metadata.json',base,{'f':'json'})
download('bristol-classified-streets.geojson',base+'/query',{'where':'1=1','outFields':'*','outSR':4326,'f':'geojson'})
from datetime import datetime,timezone
(ROOT/'data/download-manifest.json').write_text(json.dumps({'downloaded_utc':datetime.now(timezone.utc).isoformat(),'sources':manifest},indent=2))
print('Downloaded and checked sources. Run prepare_data.py then build.py.')
