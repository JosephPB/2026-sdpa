let ready;
async function boot(){
 importScripts('runtime/pyodide.js');
 const py=await loadPyodide({indexURL:'runtime/'});
 await py.loadPackage(['numpy','pandas','matplotlib']);
 py.FS.mkdirTree('/home/pyodide/data');
 py.FS.mkdirTree('/home/pyodide/assets');
 for(const name of ['data/bristol_traffic_2023.csv','data/count_points.csv','data/bristol_no2_2023.csv','data/bristol_roads.json','assets/duck.png']){
  const response=await fetch(name);if(!response.ok)throw Error('Missing local file: '+name);
  py.FS.writeFile('/home/pyodide/'+name,new Uint8Array(await response.arrayBuffer()));
 }
 const setup=await (await fetch('live/setup.py')).text();
 const capture=await (await fetch('live/output.py')).text();
 py.runPython(capture);
 return {py,setup};
}
onmessage=async e=>{
 try{
  postMessage({status:'Loading Python'});
  ready??=boot();const {py,setup}=await ready;
  postMessage({status:'Running'});
  py.globals.set('_source',e.data.code);py.globals.set('_setup',setup);
  const result=await py.runPythonAsync('import json\njson.dumps(run_example(_source, _setup))');
  postMessage({result:JSON.parse(result)});
 }catch(error){ready=null;postMessage({error:String(error)});}
};
