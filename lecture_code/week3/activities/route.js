(() => {
 const $=id=>document.getElementById(id),coords={A:[0,0],B:[4,0],C:[4,3],D:[0,3]},pixels={A:[95,255],B:[375,255],C:[375,45],D:[95,45]};
 let route=['A','C','B','D'],reveal=false,walk=0;
 function draw(){
  const complete=route.length===4,closed=complete?[...route,'A']:route;
  let svg='<text x="205" y="315">x (model units)</text><text x="5" y="155">y</text>';
  const visible=reveal?closed:closed.slice(0,walk+1);
  if(visible.length>1)svg+=`<polyline class="tour" points="${visible.map(x=>pixels[x].join(',')).join(' ')}"/>`;
  for(const [name,p] of Object.entries(pixels))svg+=`<circle class="station" cx="${p[0]}" cy="${p[1]}" r="21"/><text x="${p[0]}" y="${p[1]+7}" text-anchor="middle">${name}</text><text x="${p[0]}" y="${p[1]+(p[1]>150?44:-30)}" text-anchor="middle">(${coords[name].join(', ')})</text>`;
  const courier=pixels[closed[Math.min(walk,closed.length-1)]];
  svg+=`<circle class="courier" cx="${courier[0]+26}" cy="${courier[1]-21}" r="9"/><text x="${courier[0]+(courier[0]>250?-32:40)}" y="${courier[1]-20}" text-anchor="${courier[0]>250?'end':'start'}">Duck</text>`;
  $('map').innerHTML=svg;$('stops').replaceChildren();
  for(const name of ['B','C','D']){const b=document.createElement('button');b.textContent=name;b.disabled=route.includes(name);b.onclick=()=>{route.push(name);reveal=false;walk=0;draw();};$('stops').append(b);}
  $('route').textContent='route = '+JSON.stringify(route)+(complete?'\nReturn to A':'\nChoose the next stop');
  $('undo').disabled=route.length<=1;$('reveal').disabled=!complete;$('walk').disabled=!complete||walk>=4;
  let status='Build a complete tour, then predict its length.';
  if(complete)status='Predict the total distance, including the return to A.';
  if(reveal){const lengths=closed.slice(1).map((name,i)=>Math.hypot(coords[name][0]-coords[closed[i]][0],coords[name][1]-coords[closed[i]][1]));status=`${closed.join(' → ')}. Distance: ${lengths.join(' + ')} = ${lengths.reduce((a,b)=>a+b,0)} model units.`;}
  else if(walk>0)status=`Courier at ${closed[walk]}. ${walk} of 4 legs completed.`;
  $('status').textContent=status;$('map').setAttribute('aria-label',status);
 }
 const preset=r=>{route=r;reveal=false;walk=0;draw();};
 $('crossed').onclick=()=>preset(['A','C','B','D']);$('perimeter').onclick=()=>preset(['A','B','C','D']);$('clear').onclick=()=>preset(['A']);
 $('undo').onclick=()=>{if(route.length>1)route.pop();reveal=false;walk=0;draw();};$('reveal').onclick=()=>{reveal=true;draw();};$('walk').onclick=()=>{walk=Math.min(4,walk+1);if(walk===4)reveal=true;draw();};draw();
})();
