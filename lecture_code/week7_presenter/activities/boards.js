const mode=new URLSearchParams(location.search).get('mode')||'slice2';const $=s=>document.querySelector(s),C=$('#controls'),B=$('#board'),R=$('#result');
const titles={slice2:'2D slicing: rows, columns',slice3:'3D slicing: row, column, channel',dimensions:'Rows × columns × colour channels',broadcast:'Broadcasting shapes',table:'Select a labelled table',group:'Split → summarise → combine',hist:'The same data, different bins',map:'Bristol: traffic and measured air quality',matmul:'Matrix multiplication',mask:'Boolean masks',aggregate:'Aggregation methods',memory:'Names, objects and memory'};
$('#title').textContent=titles[mode];$('#reset').onclick=()=>location.reload();
function select(label,options,fn){let l=document.createElement('label');l.textContent=label;let s=document.createElement('select');for(let [v,t] of options){let o=new Option(t,v);s.add(o)}s.onchange=fn;l.append(s);C.append(l);return s}
function button(text,fn){let b=document.createElement('button');b.textContent=text;b.onclick=fn;C.append(b);return b}
function input(label,value){let l=document.createElement('label');l.textContent=label;let i=document.createElement('input');i.value=value;i.size=7;l.append(i);C.append(l);return i}
function indices(text,n){text=text.trim();if(!text.includes(':')){if(!/^-?\d+$/.test(text))throw Error('Enter an integer or start:stop:step');let v=Number(text);if(v<0)v+=n;if(v<0||v>=n)throw Error('Index out of bounds');return {ids:[v],scalar:true}}
 let parts=text.split(':');if(parts.length>3||parts.some(x=>x!==''&&!/^-?\d+$/.test(x)))throw Error('Use start:stop:step');let step=parts[2]?Number(parts[2]):1;if(!step)throw Error('Step cannot be zero');let pos=step>0;let bound=(s,def)=>{if(s===undefined||s==='')return def;let v=Number(s);if(v<0)v+=n;return pos?Math.max(0,Math.min(n,v)):Math.max(-1,Math.min(n-1,v))};let start=bound(parts[0],pos?0:n-1),stop=bound(parts[1],pos?n:-1),ids=[];for(let i=start;pos?i<stop:i>stop;i+=step)ids.push(i);return {ids,scalar:false}}
function table(values,marked=()=>false){return '<table>'+values.map((row,r)=>'<tr>'+row.map((v,c)=>`<td class="${marked(r,c)?'selected':''}">${v}</td>`).join('')+'</tr>').join('')+'</table>'}
if(mode==='slice2'||mode==='slice3')setupArraySlicing({mode,indices});
if(mode==='memory')setupMemory();
if(mode==='dimensions'){
 const duck=[[0,0,0,0,0,1,1,1,0,0],[0,0,0,0,1,1,2,1,3,3],[0,0,0,0,1,1,1,1,0,0],[1,0,0,1,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,0,0,0,0]];
 let palette=[[240,247,255],[255,204,31],[31,31,31],[255,94,20]],ch=select('View',[['all','RGB image'],['0','Red'],['1','Green'],['2','Blue'],['layers','All channel planes']],draw);
 function grid(channel){return '<div class="grid" style="grid-template-columns:repeat(10,23px)">'+duck.flat().map(k=>{let color=palette[k];if(channel!=='all')color=color.map((v,i)=>i===Number(channel)?v:0);return `<div class="pixel" style="background:rgb(${color})"></div>`}).join('')+'</div>'}
 function draw(){B.innerHTML=ch.value==='layers'?['0','1','2'].map((c,i)=>'<div>'+['Red','Green','Blue'][i]+grid(c)+'</div>').join(''):grid(ch.value);R.textContent=ch.value==='all'||ch.value==='layers'?'rgb.shape = (7, 10, 3)':'rgb[:, :, '+ch.value+'].shape = (7, 10)';}draw();
}
if(mode==='broadcast'){
 let choice=select('Operation',[['scalar','(4, 3) + scalar 10'],['row','(4, 3) + (3,)'],['column','(4, 3) + (4, 1)'],['bad','(4, 3) + (4,)']],()=>draw(false));
 function draw(reveal){let a=Array.from({length:4},(_,r)=>Array.from({length:3},(_,c)=>r*3+c));let b=choice.value==='scalar'?[[10]]:choice.value==='row'?[[10,20,30]]:choice.value==='column'?[[10],[20],[30],[40]]:[[10,20,30,40]];B.innerHTML=table(a)+'<strong>+</strong>'+table(b);if(reveal&&choice.value!=='bad'){let out=a.map((row,r)=>row.map((v,c)=>v+(choice.value==='scalar'?10:choice.value==='row'?b[0][c]:b[r][0])));B.innerHTML+='<strong>=</strong>'+table(out);R.textContent='Match from the right: equal dimensions, or one is 1. Result: (4, 3).';}else R.textContent=reveal?'Incompatible: rightmost dimensions 3 and 4 do not match.':'';}button('Reveal result',()=>draw(true));draw(false);
}
if(mode==='table'){
 let values=[['A',30,100],['B',10,200],['C',20,150]],choice=select('Selection',[['pos','df.iloc[0:2, 0:1]'],['label',"df.loc['A':'B', ['cycles']]"],['mask',"df.loc[df.cycles >= 20, ['cycles']]"],['row',"df.loc['B']"]],draw);
 function draw(){B.innerHTML='<table><tr><th>index</th><th>cycles</th><th>cars</th></tr>'+values.map((row,r)=>'<tr>'+row.map((v,c)=>`<td class="${((choice.value==='row'&&r===1)||(c===1&&(choice.value==='mask'?row[1]>=20:r<2)))?'selected':''}">${v}</td>`).join('')+'</tr>').join('')+'</table>';R.textContent=choice.value==='row'?'One row as a Series (with a unique label).':choice.value==='pos'?'Positions 0 and 1; stop position 2 is excluded.':choice.value==='label'?'Labels A through B; stop label B is included.':'The Boolean condition selects rows A and C.';}draw();
}
if(mode==='matmul'){
 const a=[[1,2],[3,4]],b=[[2,1],[0,3]];
 let row=select('Result row',[['0','0'],['1','1']],()=>draw(false));
 let col=select('Result column',[['0','0'],['1','1']],()=>draw(false));
 function matrix(values,hit){return '<div class="matrix">'+table(values,hit)+'</div>';}
 function draw(reveal){let r=+row.value,c=+col.value,out=[[2,7],[6,15]];
  B.innerHTML=matrix(a,(i,j)=>i===r)+'<span class="operator">×</span>'+matrix(b,(i,j)=>j===c)+'<span class="operator">=</span>'+matrix(out.map((v,i)=>v.map((x,j)=>reveal||i!==r||j!==c?x:'?')),(i,j)=>i===r&&j===c);
  R.textContent=reveal?`Row ${r} × column ${c}: ${a[r][0]} × ${b[0][c]} + ${a[r][1]} × ${b[1][c]} = ${out[r][c]}`:'Multiply corresponding row and column values, then add. What belongs in the selected cell?';}
 button('Reveal calculation',()=>draw(true));draw(false);
}
if(mode==='group'){
 let step=0;const data=[['A',10],['B',30],['A',20],['B',50]];
 function groups(showMean){return ['A','B'].map(k=>'<div class="group"><strong>Site '+k+'</strong>'+table([['row','bicycles'],...data.map((x,i)=>[i,...x]).filter(x=>x[1]===k).map(x=>[x[0],x[2]])])+(showMean?'<p class="calculation">'+(k==='A'?'(10 + 20) / 2 = 15':'(30 + 50) / 2 = 40')+'</p>':'')+'</div>').join('');}
 function draw(){
  B.innerHTML=step===0?table([['row','site','bicycles'],...data.map((x,i)=>[i,...x])]):step===1?groups(false):step===2?'<pre class="dictionary">{<br>    "A": [10, 20],<br>    "B": [30, 50]<br>}</pre>':step===3?groups(true):table([['site','mean bicycles'],['A',15],['B',40]]);
  R.textContent=['Rows before grouping','groups = readings.groupby("site")\nSame key, same group. The values have not been summarised.','Recall a dictionary of lists. These are the values in each group.','groups["bicycles"].mean()\nCompute one mean for each group.','One result for each key: A → 15, B → 40'][step];
  prev.disabled=step===0;next.disabled=step===4;
 }
 const prev=button('Previous step',()=>{step--;draw()});const next=button('Next step',()=>{step++;draw()});draw();
}
if(mode==='aggregate'){
 let step=0;
 function draw(){
  let head=['site','bicycles'],a=['A','10, 20'],b=['B','30, 50'];
  if(step>=1){head.push('mean_cycles');a.push(15);b.push(40)}
  if(step>=2){head.push('peak_cycles');a.push(20);b.push(50)}
  if(step>=3){head.push('observations');a.push(2);b.push(2)}
  B.innerHTML=table([head,a,b]);
  R.textContent=['Start with the values in each site group',"mean_cycles=('bicycles', 'mean')\nA: (10 + 20) / 2 = 15; B: (30 + 50) / 2 = 40", "peak_cycles=('bicycles', 'max')\nA: max(10, 20) = 20; B: max(30, 50) = 50", "observations=('bicycles', 'size')\nCount the rows in each group: A has 2; B has 2"][step];
  prev.disabled=step===0;next.disabled=step===3;
 }
 const prev=button('Previous calculation',()=>{step--;draw()});const next=button('Next calculation',()=>{step++;draw()});draw();
}
if(mode==='mask')fetch('../data/activities.json').then(r=>r.json()).then(data=>{
 let revealed=false;
 const bicycleLimit=input('Bicycles at least','30'),carLimit=input('Cars fewer than','300');
 bicycleLimit.type='number';carLimit.type='number';
 function draw(){
  let rows=data.mask,selected=0;
  B.innerHTML='<table><thead><tr><th>row</th><th>site</th><th>hour</th><th>bicycles</th><th>cars</th><th>bicycles ≥ '+bicycleLimit.value+'</th><th>cars &lt; '+carLimit.value+'</th><th>&amp;</th></tr></thead><tbody>'+rows.map((d,i)=>{
   let bike=d.bicycles>=Number(bicycleLimit.value),car=d.cars<Number(carLimit.value),hit=bike&&car;if(hit)selected++;
   return '<tr class="'+(revealed?(hit?'keep-row':'reject-row'):'')+'"><th>'+i+'</th><td>'+d.count_point_id+'</td><td>'+d.hour+'</td><td>'+d.bicycles+'</td><td>'+d.cars+'</td><td class="truth '+(revealed&&bike?'true':'')+'">'+(revealed?bike:'?')+'</td><td class="truth '+(revealed&&car?'true':'')+'">'+(revealed?car:'?')+'</td><td class="truth '+(revealed&&hit?'true':'')+'">'+(revealed?hit:'?')+'</td></tr>';
  }).join('')+'</tbody></table>';
  R.textContent=revealed?`Both conditions must be True. Selected ${selected} of these ${rows.length} observed rows.`:'Predict the True and False values. Which rows survive both conditions?';
 }
 button('Reveal mask',()=>{revealed=true;draw()});bicycleLimit.oninput=carLimit.oninput=()=>{revealed=false;draw()};draw();
}).catch(e=>R.textContent='Could not load the data: '+e.message);
if(mode==='hist'||mode==='map')fetch('../data/activities.json').then(r=>r.json()).then(data=>{
 if(mode==='hist'){
  let slider=input('Bins','15');slider.type='range';slider.min=3;slider.max=40;slider.oninput=draw;
  function draw(){let n=+slider.value,values=data.hist,max=Math.max(...values)+1,bins=Array(n).fill(0);values.forEach(x=>bins[Math.floor(x/max*n)]++);let peak=Math.max(...bins);B.innerHTML='<svg viewBox="0 0 900 350">'+bins.map((b,i)=>`<rect x="${50+i*800/n}" y="${300-b/peak*250}" width="${800/n-2}" height="${b/peak*250}" fill="#a71930"/>`).join('')+`<text x="50" y="325">0</text><text x="780" y="325">${max-1}</text><text x="280" y="347">Bicycles per observed site-hour</text><text x="50" y="28">Count (maximum bin: ${peak})</text></svg>`;R.textContent=`${n} equal-width bins, ${values.length} observed site-hours, same data`;}draw();
 } else {
  B.className='map';let traffic=true,air=true;let col=select('Traffic',[['motor_vehicles','Motor vehicles'],['bicycles','Bicycles'],['cars','Cars'],['buses','Buses']],draw);button('Toggle traffic',()=>{traffic=!traffic;draw()});button('Toggle NO₂',()=>{air=!air;draw()});
  let roads=data.roads;const X=x=>280+(x+2.70)/.20*326,Y=y=>365-(y-51.40)/.13*340;
  function draw(){let svg='<svg viewBox="0 0 1050 400" role="img" aria-label="Map of Bristol traffic and NO2 measurement locations">';for(let l of roads){svg+=`<polyline points="${l.coordinates.map(c=>X(c[0])+','+Y(c[1])).join(' ')}" fill="none" stroke="${l.river?'#a7c9d8':'#d5d5d5'}" stroke-width="1"/>`;}
   if(traffic)data.traffic.forEach((d,i)=>{let radius=Math.sqrt(d[col.value]/5/Math.PI);svg+=`<circle class="plotdot" data-type="traffic" data-i="${i}" cx="${X(d.longitude)}" cy="${Y(d.latitude)}" r="${Math.max(2,radius)}" fill="#a71930" fill-opacity=".25" stroke="#777"/>`;});
   if(air)data.air.forEach((d,i)=>{let t=Math.max(0,Math.min(1,(d.no2_ugm3-10)/55)),color=`rgb(${255-70*t},${235-200*t},${140-100*t})`;svg+=`<rect class="plotdot" data-type="air" data-i="${i}" x="${X(d.longitude)-3}" y="${Y(d.latitude)-3}" width="6" height="6" fill="${color}"/>`;});
   svg+='<text x="820" y="35" font-size="17">Traffic: circle area</text><text x="820" y="58" font-size="14">mean / observed hour</text>';
   [100,500,1500].forEach((v,i)=>svg+=`<circle cx="845" cy="${90+i*45}" r="${Math.sqrt(v/5/Math.PI)}" fill="none" stroke="#777"/><text x="870" y="${96+i*45}" font-size="16">${v}</text>`);
   svg+='<text x="820" y="245" font-size="16">Annual NO₂, µg/m³</text>';
   for(let i=0;i<6;i++)svg+=`<rect x="${820+i*30}" y="260" width="30" height="18" fill="rgb(${255-70*i/5},${235-200*i/5},${140-100*i/5})"/>`;svg+='<text x="820" y="300">10</text><text x="975" y="300">65</text></svg>';B.innerHTML=svg;
   B.querySelectorAll('[data-type]').forEach(el=>el.onclick=()=>{let d=data[el.dataset.type][+el.dataset.i];R.textContent=el.dataset.type==='air'?`${d.location}: ${d.no2_ugm3} µg/m³ annual mean NO₂; ${d.sample_count} source samples (2023).`:`${d.road_name}, site ${d.count_point_id}: ${d[col.value].toFixed(1)} ${col.value} / observed hour (sampled dates in 2023).`;});
  }R.textContent='Two observation scales: sampled traffic hours and annual pollution means. No interpolation between monitors.';draw();
 }
}).catch(e=>R.textContent='Could not load local data. Open the deck through its local web server. '+e.message);
