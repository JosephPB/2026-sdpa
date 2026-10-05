(() => {
 const $=id=>document.getElementById(id);
 const scenes={
  rebind:{lines:['x = 4','y = x','x = 7'],messages:['Predict where each name will point.','x refers to the integer 4.','y refers to the same integer as x.','x now refers to 7. The name y still refers to 4.']},
  alias:{lines:['route = ["A", "C", "B", "D"]','trial = route','trial[1], trial[2] = trial[2], trial[1]'],messages:['Predict what trial = route creates.','route refers to one list.','Two names refer to the same list.','The one shared list changed. Both names see A, B, C, D.']},
  copy:{lines:['route = ["A", "C", "B", "D"]','trial = route.copy()','trial[1], trial[2] = trial[2], trial[1]'],messages:['Predict what .copy() creates.','route refers to one list.','A new outer list has the same contents.','Only the trial list changes. The original route is preserved.']},
  nested:{lines:['groups = [["A", "B"], ["C"]]','trial = groups.copy()','trial[0].append("D")'],messages:['Predict which objects a shallow copy duplicates.','The outer list refers to two inner lists.','The new outer list refers to the same inner lists.','The shared first inner list changes through both outer lists.']}
 };
 let scene=new URLSearchParams(location.search).get('scene')||'rebind',step=0;
 if(!scenes[scene])scene='rebind';$('scene').value=scene;
 const box=(x,y,w,label,cls='object')=>`<rect x="${x}" y="${y}" width="${w}" height="55" rx="2" class="${cls}"/><text x="${x+12}" y="${y+35}">${label}</text>`;
 const arrow=(x,y,x2,y2)=>`<path class="ref" d="M${x},${y} L${x2},${y2}"/>`;
 function draw(){
  const s=scenes[scene];$('code').textContent=s.lines.map((line,i)=>(i===step-1?'▶ ':i<step?'✓ ':'  ')+line).join('\n');
  let svg='<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#a71930"/></marker></defs>';
  if(step===0)svg+='<text x="25" y="110">Tap Step to execute the first line.</text>';
  else if(scene==='rebind'){
   svg+=box(25,35,100,'x','name')+box(460,35,220,'4 : int')+arrow(125,62,455,step===3?182:62);
   if(step>=2)svg+=box(25,155,100,'y','name')+arrow(125,182,455,62);
   if(step===3)svg+=box(460,155,220,'7 : int');
  }else if(scene==='nested'){
   svg+=box(15,35,130,'groups','name')+box(250,35,225,'[ref 1, ref 2]')+box(760,35,295,step===3?'["A", "B", "D"]':'["A", "B"]')+box(760,165,295,'["C"]')+arrow(145,62,245,62)+arrow(475,48,755,48)+arrow(475,78,755,190);
   if(step>=2)svg+=box(15,165,130,'trial','name')+box(250,165,225,'[ref 1, ref 2]')+arrow(145,192,245,192)+arrow(475,178,755,72)+arrow(475,206,755,210);
  }else{
   const changed=scene==='alias'&&step===3;
   svg+=box(25,35,140,'route','name')+box(460,35,500,changed?'["A", "B", "C", "D"]':'["A", "C", "B", "D"]')+arrow(165,62,455,62);
   if(step>=2){
    svg+=box(25,155,140,'trial','name');
    if(scene==='alias')svg+=arrow(165,182,455,62);
    else svg+=box(460,155,500,step===3?'["A", "B", "C", "D"]':'["A", "C", "B", "D"]')+arrow(165,182,455,182);
   }
  }
  $('diagram').innerHTML=svg;$('diagram').setAttribute('aria-label',s.messages[step]);
  $('status').textContent=s.messages[step];$('progress').textContent=`Line ${step} of 3`;$('step').disabled=step===3;
 }
 $('scene').onchange=()=>{scene=$('scene').value;step=0;draw();};
 $('step').onclick=()=>{if(step<3)step++;draw();};$('reset').onclick=()=>{step=0;draw();};draw();
})();
