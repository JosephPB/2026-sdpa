/* Clicker-controlled poster camera and worked visual sequences. No quiz solutions live here. */
(()=>{
 const NS='http://www.w3.org/2000/svg';
 const views={
  full:[0,0,4724,3543], headings:[0,0,4724,3543], roots:[0,0,4724,3543],
  categorical:[990,70,1100,1600], onecat:[980,235,400,1410],
  numeric:[2630,1840,1910,1450], onenum:[2560,2020,540,900],
  mixed:[200,1840,2230,1570], groups:[220,2010,570,1390],
  twonum:[2990,2040,710,1120], many:[3730,1840,850,1460],
  time:[3900,60,720,1600], maps:[3500,60,400,1250], network:[2260,60,1090,1420]
 };
 const titles={full:'A set of possibilities',headings:'Categoric · Numeric · Categoric and numeric · Relational · Map · Time series',roots:'Number of variables, groups, order and connections narrow the choices',categorical:'Categorical data',onecat:'One categorical variable: several possible views',numeric:'Numerical data',onenum:'One numerical variable: distribution',mixed:'Categorical and numerical data',groups:'One numerical variable across groups',twonum:'Two numerical variables: relationship and order',many:'Several numerical variables',time:'Time series: one or several series',maps:'Locations and spatial questions',network:'Connections, hierarchies and flows'};
 const headingBoxes=[[1350,110,410,100],[2595,110,400,100],[3560,110,200,100],[3990,110,490,100],[790,1875,860,105],[3370,1875,390,105]];
 const rootBoxes=[[1050,285,970,245],[2335,285,920,245],[4025,285,470,125],[260,2060,2120,295],[2700,2060,1800,295]];
 const guides={
  onecat:['One category','Compare counts → bars','Show a simple whole → pie','The question still matters.'],
  onenum:['One measurement','Shape → histogram or density','Spread → boxplot','Detail → individual points'],
  groups:['Compare groups','Show each distribution','Keep sample sizes visible','Boxplot · violin · swarm'],
  twonum:['Two measurements','Relationship → scatter','Order matters → line','Look for curves and groups.'],
  many:['More variables','Position · colour · size','Use facets to separate groups','Keep every encoding explicit.'],
  time:['Time and order','One series or several?','Show gaps and sampling','Lines connect ordered values.'],
  maps:['A spatial question','Location or regional pattern?','A ranking may need bars','The denominator matters.'],
  network:['Connections','Nodes need explicit edges','Links, hierarchy or flows?','A table of points is not enough.']
 };
 let serial=0;
 function svgEl(tag,attrs={}){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;}
 function prepare(shell){
  if(shell._camera)return;
  const id=`poster-mask-${serial++}`;
  const svg=svgEl('svg',{viewBox:views.full.join(' '),role:'img','aria-label':'From Data to Viz chart decision tree by Yan Holtz and Conor Healy'});
  const defs=svgEl('defs');const mask=svgEl('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:4724,height:3543});mask.append(svgEl('rect',{x:0,y:0,width:4724,height:3543,fill:'white'}));
  const holes=svgEl('g');mask.append(holes);defs.append(mask);svg.append(defs);
  const clip=svgEl('clipPath',{id:id+'-crop',clipPathUnits:'userSpaceOnUse'});const crop=svgEl('rect',{x:0,y:0,width:4724,height:3543});clip.append(crop);defs.append(clip);
  const content=svgEl('g',{'clip-path':`url(#${id}-crop)`});svg.append(content);
  content.append(svgEl('image',{href:'assets/data-to-viz-poster.png',x:0,y:0,width:4724,height:3543}));
  const dim=svgEl('rect',{x:0,y:0,width:4724,height:3543,fill:'#e9eaec',opacity:0,mask:`url(#${id})`});content.append(dim);
  const outlines=svgEl('g');content.append(outlines);shell.prepend(svg);const guide=document.createElement('div');guide.className='poster-guide';guide.hidden=true;shell.append(guide);shell._camera={svg,dim,holes,outlines,crop,guide,box:[...views.full],raf:0};
 }
 function apply(shell,name,animate=true){
  prepare(shell);const c=shell._camera;const target=views[name]||views.full;
  c.holes.replaceChildren();c.outlines.replaceChildren();
  const boxes=name==='roots'?[...headingBoxes,...rootBoxes]:name==='headings'?headingBoxes:[];
  boxes.forEach(([x,y,w,h])=>{c.holes.append(svgEl('rect',{x,y,width:w,height:h,rx:10,fill:'black'}));c.outlines.append(svgEl('rect',{x,y,width:w,height:h,rx:10,fill:'none',stroke:'#a71930','stroke-width':7}));});
  c.dim.style.transition='opacity 650ms';c.dim.setAttribute('opacity',boxes.length?.92:0);
  const caption=shell.parentElement.querySelector('.poster-caption');if(caption)caption.textContent=titles[name]||name;
  c.guide.replaceChildren();c.guide.hidden=!guides[name];(guides[name]||[]).forEach((line,i)=>{const el=document.createElement(i?'p':'strong');el.textContent=line;c.guide.append(el);});
  cancelAnimationFrame(c.raf);const start=[...c.box];const began=performance.now();
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setBox(box){c.svg.setAttribute('viewBox',box.join(' '));['x','y','width','height'].forEach((key,i)=>c.crop.setAttribute(key,box[i]));}
  if(!animate||reduce){c.box=[...target];setBox(target);return;}
  function tick(now){const t=Math.min(1,(now-began)/1250);const e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;c.box=start.map((v,i)=>v+(target[i]-v)*e);setBox(c.box);if(t<1)c.raf=requestAnimationFrame(tick);}
  c.raf=requestAnimationFrame(tick);
 }
 function update(section,entering=false){
  if(!section)return;const print=document.documentElement.classList.contains('print-pdf');
  section.querySelectorAll('.poster-shell').forEach(shell=>{
   let name=shell.dataset.initial||'full';const cues=[...shell.querySelectorAll('.scene-cue.visible')];if(cues.length)name=cues.at(-1).dataset.view;
   if(print||document.body.dataset.student==='true')name=shell.dataset.printView||name;
   if(entering&&!print&&document.body.dataset.student!=='true'){apply(shell,shell.dataset.initial||'full',false);}
   apply(shell,name,!entering&&!print);
  });
  section.querySelectorAll('.step-scene').forEach(scene=>{const cues=scene.querySelectorAll('.scene-cue.visible');let n=cues.length;if(print||document.body.dataset.student==='true')n=Number(scene.dataset.printStep||0);scene.querySelectorAll('.scene-frame').forEach((f,i)=>f.classList.toggle('active',i===n));});
 }
 function init(){
  document.querySelectorAll('.poster-shell').forEach(prepare);
  Reveal.on('slidechanged',e=>update(e.currentSlide,true));Reveal.on('fragmentshown',()=>update(Reveal.getCurrentSlide()));Reveal.on('fragmenthidden',()=>update(Reveal.getCurrentSlide()));
  if(document.documentElement.classList.contains('print-pdf')||document.body.dataset.student==='true')document.querySelectorAll('.slides>section').forEach(s=>update(s,true));
  else update(Reveal.getCurrentSlide(),true);
  window.week9Ready=true;
 }
 if(window.Reveal?.isReady())init();else if(window.Reveal)Reveal.on('ready',init);else window.addEventListener('load',()=>{if(Reveal.isReady())init();else Reveal.on('ready',init);});
})();
