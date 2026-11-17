function setupMemory(){
 const C=document.querySelector('#controls'),B=document.querySelector('#board'),R=document.querySelector('#result');
 document.body.classList.add('memory-mode');document.querySelector('#instruction').hidden=true;
 const requested=new URLSearchParams(location.search).get('scene')||'strings';
 let scene=requested,step=0;
 const scenes={
 strings:{lines:['word = "duck"','alias = word','upper = word.upper()','alias.upper()'],messages:['','word refers to a string object.','Both names refer to the same string.','upper refers to a new string. The original string is unchanged.','alias.upper() returns "DUCK" without assigning it. The return value is discarded; alias still refers to "duck".']},
 lists:{lines:['numbers = [10, 20, 30]','alias = numbers','alias.append(40)'],messages:['','numbers refers to a list.','Both names refer to the same list.','append changes that list. Both names see the added value.']},
 arrays:{lines:['values = np.array([10, 20, 30])','alias = values','alias[1] = 99'],messages:['','values refers to an ndarray.','Both names refer to the same ndarray.','Assignment changes its data. Both names see 99.']},
 view:{lines:['a = np.arange(6).reshape(2, 3)','view = a[:, :2]','view[:] = 99','independent = a[:, :2].copy()','independent[:] = 0'],messages:['','a refers to an ndarray whose values occupy one data buffer.','view is a separate ndarray object that refers to the same data buffer.','Assignment through view changes the selected values in the shared buffer.','copy allocates a separate data buffer.','The copied buffer changes to zero. The original buffer still contains 99.']}
 };
 if(!scenes[scene])scene='strings';
 if(requested!=='view'){
  const label=document.createElement('label');label.textContent='Example';const select=document.createElement('select');
  for(let [key,name] of [['strings','Strings'],['lists','Lists'],['arrays','Arrays']])select.add(new Option(name,key));select.value=scene;select.onchange=()=>{scene=select.value;step=0;draw();};label.append(select);C.append(label);
 }
 const previous=document.createElement('button');previous.textContent='Previous';previous.onclick=()=>{step--;draw();};C.append(previous);
 const next=document.createElement('button');next.textContent='Step';next.onclick=()=>{step++;draw();};C.append(next);
 const box=(x,y,w,label,kind='object')=>`<rect x="${x}" y="${y}" width="${w}" height="52" rx="2" class="${kind}"/><text x="${x+12}" y="${y+34}">${label}</text>`;
 const arrow=(x,y,x2,y2)=>`<path class="ref" d="M${x},${y} L${x2},${y2}"/>`;
 function buffer(x,y,rows,cols,copied=false){let svg='';for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let value=copied?(step===5?0:99):(step>=3&&c<2?99:r*3+c);svg+=`<rect x="${x+c*74}" y="${y+r*47}" width="74" height="47" class="data ${!copied&&step>=2&&c<2?'shared':''}"/><text x="${x+c*74+18}" y="${y+r*47+31}">${value}</text>`;}return svg;}
 function draw(){
  const s=scenes[scene];let svg='<defs><marker id="pointer" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#a71930"/></marker></defs>';
  if(step>0&&scene==='strings'){
   svg+=box(20,30,125,'word','name')+box(470,30,420,'str: "duck"')+arrow(145,56,465,56);
   if(step>=2)svg+=box(20,135,125,'alias','name')+arrow(145,161,465,56);
   if(step===4)svg+='<text x="470" y="350" font-size="24">Unassigned return: &quot;DUCK&quot; (discarded)</text>';
   if(step>=3)svg+=box(20,245,125,'upper','name')+box(470,245,420,'str: "DUCK"')+arrow(145,271,465,271);
  }else if(step>0&&scene!=='view'){
   const arr=scene==='arrays',name=arr?'values':'numbers',content=arr?(step===3?'ndarray: [10 99 30]':'ndarray: [10 20 30]'):(step===3?'list: [10, 20, 30, 40]':'list: [10, 20, 30]');
   svg+=box(20,65,160,name,'name')+box(470,65,530,content)+arrow(180,91,465,91);
   if(step>=2)svg+=box(20,220,160,'alias','name')+arrow(180,246,465,91);
  }else if(step>0){
   svg+='<text x="745" y="23">data buffer</text>';
   svg+=box(10,45,175,'a','name')+box(275,45,300,'ndarray (2, 3)')+arrow(185,71,270,71)+arrow(575,71,735,71)+buffer(740,40,2,3);
   if(step>=2)svg+=box(10,155,175,'view','name')+box(275,155,300,'ndarray (2, 2)')+arrow(185,181,270,181)+arrow(575,181,735,85);
   if(step>=4)svg+=box(10,265,175,'independent','name')+box(275,265,300,'ndarray (2, 2)')+arrow(185,291,270,291)+arrow(575,291,735,291)+buffer(740,260,2,2,true);
  }
  B.innerHTML='<div class="memory-workspace"><pre class="memory-code">'+s.lines.map((line,i)=>`<span class="${i===step-1?'active':i<step?'done':''}">${i===step-1?'▶ ':'  '}${line}</span>`).join('')+'</pre><svg viewBox="0 0 1100 365" role="img" aria-label="Names, objects and reference arrows">'+svg+'</svg></div>';
  R.textContent=s.messages[step];previous.disabled=step===0;next.disabled=step===s.lines.length;
 }
 draw();
}
