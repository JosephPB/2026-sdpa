/* Teaching diagrams. All state changes are local; no API calls are made here. */
(() => {
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const red='#a71930',teal='#167b83',gold='#bf881c',ink='#242424';
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Native Reveal fragments make keyboard, clicker and slide-arrow navigation
  // advance the diagram as part of the slide, without embedded board controls.
  function controls(el, render, max) {
    let step=0;
    el.innerHTML='<div class="anim-stage"></div><div class="anim-status" role="status" aria-live="polite"></div><div class="animation-cues" aria-hidden="true"></div>';
    const stage=el.querySelector('.anim-stage'),status=el.querySelector('.anim-status');
    const cues=el.querySelector('.animation-cues');
    for(let i=1;i<=max();i++){
      const marker=document.createElement('span');marker.className='fragment animation-cue';
      marker.dataset.fragmentIndex=i-1;marker.dataset.step=i;cues.append(marker);
    }
    el.setStep=n=>{step=Math.max(0,Math.min(max(),n));render(step,stage,status);};
    el.getStep=()=>step;el.maxStep=max;el.setStep(0);
  }
  function memory(el) {
    const scenes=[
      {name:'Strings',lines:['word = "duck"','alias = word','upper = word.upper()'],message:['word refers to a string object.','Both names refer to the same string.','upper() returns a new string. The original remains unchanged.']},
      {name:'Lists',lines:['numbers = [10, 20, 30]','alias = numbers','alias.append(40)'],message:['numbers refers to a list.','Both names refer to the same list.','append changes the shared list. Both names see 40.']},
      {name:'Arrays',lines:['values = np.array([10, 20, 30])','alias = values','alias[1] = 99'],message:['values refers to a numeric array.','Both names refer to the same array.','Assignment changes its data. Both names see 99.']}
    ];
    controls(el,(s,stage,status)=>{
      const scene=Math.floor(s/3),phase=s%3,info=scenes[scene];
      const box=(x,y,w,label)=>`<rect x="${x}" y="${y}" width="${w}" height="55" fill="white" stroke="${red}" stroke-width="2"/><text x="${x+12}" y="${y+36}" font-size="28">${esc(label)}</text>`;
      const arrow=(x,y,x2,y2)=>`<path d="M${x},${y} L${x2},${y2}" fill="none" stroke="${red}" stroke-width="3" marker-end="url(#memory-pointer)"/>`;
      const name=scene===0?'word':scene===1?'numbers':'values';
      const content=scene===0?'str: "duck"':scene===1?(phase===2?'list: [10, 20, 30, 40]':'list: [10, 20, 30]'):(phase===2?'ndarray: [10 99 30]':'ndarray: [10 20 30]');
      let svg='<svg viewBox="0 0 1050 350" role="img" aria-label="Names referring to '+info.name.toLowerCase()+'"><defs><marker id="memory-pointer" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="'+red+'"/></marker></defs>';
      svg+=box(10,40,175,name)+box(450,40,570,content)+arrow(185,67,445,67);
      if(phase>=1)svg+=box(10,150,175,'alias')+arrow(185,177,445,67);
      if(scene===0&&phase===2)svg+=box(10,260,175,'upper')+box(450,260,570,'str: "DUCK"')+arrow(185,287,445,287);
      svg+='</svg>';
      stage.innerHTML='<h3 class="memory-kind">'+info.name+'</h3><div class="memory-layout"><pre class="trace-code">'+info.lines.map((l,i)=>'<span class="'+(i===phase?'active':i<phase?'done':'')+'">'+esc(l)+'</span>').join('')+'</pre>'+svg+'</div>';
      status.textContent=info.message[phase];
    },()=>8);
  }
  function matrix(el) {
    const a=[[1,2],[3,4]],b=[[2,1],[0,3]],c=[[2,7],[6,15]];
    controls(el,(step,stage,status)=>{
      const s=[0,2,3,5,6,8,9,11,12][step];
      const k=Math.min(3,Math.floor(Math.max(0,s-1)/3)),r=Math.floor(k/2),col=k%2,phase=s===0?0:(s-1)%3+1;
      function grid(x,values,which){let t='';for(let i=0;i<2;i++)for(let j=0;j<2;j++){
        const hit=which==='a'?i===r:which==='b'?j===col:i===r&&j===col;
        const filled=which!=='c'||i*2+j<k||(i*2+j===k&&phase===3);
        t+=`<rect x="${x+j*95}" y="${75+i*92}" width="95" height="92" fill="${hit?'#f6e4e8':'white'}" stroke="${hit?red:'#bbb'}"/><text x="${x+j*95+47}" y="${133+i*92}" text-anchor="middle" fill="${hit?red:ink}" font-size="43">${filled?values[i][j]:'?'}</text>`;
      }return t;}
      stage.innerHTML=`<svg viewBox="0 0 1250 310" role="img" aria-label="Row ${r} of A multiplied by column ${col} of B"><g font-family="Arial"><text x="205" y="40" font-size="30">A</text><text x="595" y="40" font-size="30">B</text><text x="985" y="40" font-size="30">A @ B</text>${grid(120,a,'a')}${grid(510,b,'b')}${grid(900,c,'c')}<text x="398" y="187" font-size="50">×</text><text x="790" y="187" font-size="50">=</text></g></svg><div class="anim-math">${phase>=2?`${a[r][0]} × ${b[0][col]} + ${a[r][1]} × ${b[1][col]}${phase===3?' = '+c[r][col]:''}`:'row '+r+' × column '+col}</div>`;
      status.textContent=phase===0?'Each output cell uses one row and one column.':phase===1?`Select row ${r} and column ${col}.`:phase===2?'Multiply each pair. Add the two products.':`Store ${c[r][col]} at output position [${r}, ${col}].`;
    },()=>8);
  }
  function windowAnimation(el) {
    const values=[5,2,4,6,3,1],width=2,trace=el.dataset.trace==='true';
    controls(el,(s,stage,status)=>{
      const k=Math.floor(s/2),revealed=s%2===1,stop=k+width;
      const window=values.slice(k,stop),mean=window.reduce((a,b)=>a+b,0)/width;
      const done=k+(revealed?1:0),out=Array.from({length:done},(_,i)=>values.slice(i,i+width).reduce((a,b)=>a+b,0)/width);
      const fmt=x=>Number(x.toFixed(3));
      stage.innerHTML='<div class="window-array">'+values.map((v,i)=>`<span class="${i>=k&&i<stop?'selected':''}"><small>${i}</small>${v}</span>`).join('')+'</div>';
      if(trace){
        const lines=['for start in range(5):','    stop = start + width','    window = values[start:stop]','    average = window.mean()','    averages.append(float(average))'];
        stage.innerHTML+='<div class="window-layout"><pre class="trace-code">'+lines.map(l=>'<span class="done">'+esc(l)+'</span>').join('')+'</pre><div class="trace-quiz"><p class="quiz-prompt">After iteration '+(k+1)+', what are the variables?</p><div class="state-values quiz-answer '+(revealed?'revealed':'')+'" aria-hidden="'+!revealed+'">'+`start = ${k}<br>stop = ${stop}<br>window = [${window.join(', ')}]<br>average = ${fmt(mean)}`+'</div></div></div>';
        stage.innerHTML+=`<div class="output ${revealed?'':'quiz-pending'}">averages = [${out.map(fmt).join(', ')}]</div>`;
      }else{
        stage.innerHTML+=`<div class="anim-math">${revealed?'('+window.join(' + ')+') / '+width+' = '+fmt(mean):'What is the mean of the highlighted values?'}</div><div class="output">averages = [${out.map(fmt).join(', ')}]</div>`;
      }
      status.textContent=revealed?(k===values.length-width?'Append the final mean. There are no more complete windows.':'Append the mean, then move the window one position to the right.'):trace?'Predict the values on the right and the next value in averages.':`Take values[${k}:${stop}]. Stop ${stop} is excluded.`;
    },()=>9);
  }
  function classify(el) {
    const discrete=el.dataset.kind==='discrete';
    const names=discrete?['Discrete','Continuous']:['Quantitative','Qualitative'];
    const defs=discrete?['Values occur in distinct steps.','The underlying quantity varies over a continuum.']:['Counts or measurements: how many or how much.','Categories or descriptions: what kind.'];
    const items=discrete?[
      ['Vehicle count',0,'Counts take whole-number values.'],['Journey duration',1,'Duration can vary continuously.'],['Shoe size',0,'Half sizes are still fixed steps.'],['NO₂ concentration',1,'Recording a rounded value does not change the underlying quantity.']
    ]:[['Road name',1,'A road name is a label.'],['Vehicle count',0,'The value tells us how many.'],['NO₂ concentration',0,'The value is a measurement.'],['Count-point ID: 6401',1,'The number identifies a site. Averaging IDs has no useful meaning.']];
    let last=-1;
    controls(el,(s,stage,status)=>{
      const k=Math.min(items.length-1,Math.floor(s/2)),placed=Math.floor((s+1)/2),isPrompt=s%2===0&&s<items.length*2;
      const before=stage.querySelector('.sort-prompt')?.getBoundingClientRect();
      stage.innerHTML=`<div class="sort-prompt ${isPrompt?'arrive':''}">${isPrompt?esc(items[k][0]):s===items.length*2?'Which example was easiest to misclassify?':'✓'}</div><div class="sort-columns">`+names.map((n,col)=>`<div><h3>${n}</h3><div class="definition">${defs[col]}</div><div class="placed">${items.slice(0,placed).map((item,i)=>item[1]===col?`<div class="sort-item" data-item="${i}">${esc(item[0])}</div>`:'').join('')}</div></div>`).join('')+'</div>';
      if(s%2===1&&s>last&&before&&!reduced()){
        const target=stage.querySelector(`[data-item="${placed-1}"]`),to=target.getBoundingClientRect();
        target.animate([{transform:`translate(${before.left-to.left}px,${before.top-to.top}px)`,color:red},{transform:'translate(0,0)',color:ink}],{duration:650,easing:'ease-out'});
      }
      status.textContent=s===items.length*2?(discrete?'A decimal can belong to a discrete set.':'A number can be a category label.'):isPrompt?'Choose a column before revealing the answer.':items[Math.floor(s/2)][2];last=s;
    },()=>items.length*2);
  }
  function bins(el) {
    const values=[10.2,12.5,13.1,15.8,18.3,22.6,25.4,27.8,31.1,36.9,43.5,49.2],colors=[red,teal,gold];
    controls(el,(s,stage,status)=>{
      const edges=s>=4?[10,17.05,29.45,50]:[10,23.333,36.667,50],x=v=>70+(v-10)/40*1100;
      const group=v=>v<edges[1]?0:v<edges[2]?1:2,collapsed=s===3;
      let svg='<svg viewBox="0 0 1250 340" role="img" aria-label="Measurements placed into three bins"><g font-family="Arial"><line x1="70" x2="1170" y1="190" y2="190" stroke="#444" stroke-width="2"/>';
      if(collapsed){
        for(let i=0;i<3;i++)svg+=`<text x="${x((edges[i]+edges[i+1])/2)}" y="225" text-anchor="middle" font-size="26">Bin ${i+1}</text>`;
      }else{
        [10,20,30,40,50].forEach(v=>svg+=`<text x="${x(v)}" y="225" text-anchor="middle" font-size="26">${v}</text>`);
      }
      if(s>=1)for(let i=0;i<3;i++)svg+=`<rect x="${x(edges[i])}" y="65" width="${x(edges[i+1])-x(edges[i])}" height="115" fill="${colors[i]}" fill-opacity=".07"/><line x1="${x(edges[i])}" x2="${x(edges[i])}" y1="60" y2="195" stroke="${colors[i]}" stroke-width="2"/><text x="${x((edges[i]+edges[i+1])/2)}" y="45" text-anchor="middle" font-size="25">${s>=4?'4 observations':'Bin '+(i+1)}</text>`;
      values.forEach((v,i)=>{const g=group(v),cx=collapsed?x((edges[g]+edges[g+1])/2):x(v),cy=collapsed?80+values.filter((w,j)=>j<i&&group(w)===g).length*18:125+(i%2)*22;
        svg+=`<circle data-group="${g}" cx="${cx}" cy="${cy}" r="9" fill="${s>=2?colors[g]:'#666'}">${collapsed&&!reduced()?`<animate attributeName="cx" from="${x(v)}" to="${cx}" dur=".7s"/><animate attributeName="cy" from="${125+(i%2)*22}" to="${cy}" dur=".7s"/>`:''}</circle>`;
      });
      svg+=`<text x="620" y="285" text-anchor="middle" font-size="25">${collapsed?'Bin labels replace the exact measurements.':'Illustrative NO₂ measurements (µg/m³)'}</text></g></svg>`;stage.innerHTML=svg;
      status.textContent=['Each dot is a measurement. Position preserves its numeric value.','Equal-width bins divide the numeric range into three equal intervals.','Assign each measurement to a bin. The bins have different counts.','Replace measurements with bin labels. The exact values have been lost.','Equal-count bins move the boundaries: four observations per group.','The observations are unchanged. The grouping rule has changed.'][s];
    },()=>5);
  }
  function http(el) {
    controls(el,(step,stage,status)=>{
      const post=step>=5,method=post?'POST':'GET',s=[0,1,3,4,5][step%5];
      const stored=post&&s>=3,rows=[{id:1,site:'A38',cars:182},{id:2,site:'A38',cars:233}];
      if(stored)rows.push({id:3,site:'A38',cars:286});
      const packet=s===1?`<div class="http-packet request">${method} /observations ${post?'→<br>{"site":"A38",<br>"cars":286}':'?site=A38 →'}</div>`:s>=4?`<div class="http-packet response${s===5?' settled':''}">← ${post?'201 Created':'200 OK'}<br>${post?'Location: /observations/3':'2 observation records'}</div>`:'';
      const table=`<table class="server-table" aria-label="Stored observations on the server"><thead><tr><th scope="col">id</th><th scope="col">site</th><th scope="col">cars</th></tr></thead><tbody>${rows.map(row=>`<tr class="http-record${row.id===3?' new-record':''}" data-record-id="${row.id}"><td>${row.id}</td><td>${row.site}</td><td>${row.cars}</td></tr>`).join('')}</tbody></table>`;
      stage.innerHTML=`<h3 class="http-method">${method}</h3><div class="http-stage"><div class="http-endpoint"><h3>Python client</h3><p>${post?'Submit a new observation.':'Ask for observations.'}</p>${s>=5?`<p>Response received</p><div class="http-body">${post?'id = 3<br>cars = 286':'2 records'}</div>`:''}</div><div class="http-middle"><div class="wire"></div>${packet}<div class="http-subtitle">${s===3?post?'Store 286 cars and assign ID 3.':'Read the matching records.':''}</div></div><div class="http-endpoint"><h3>Server</h3><p>Stored observations</p>${table}</div></div>`;
      status.textContent=[post?'POST commonly creates a resource.':'GET retrieves a representation.',post?'The request carries the new observation in its body.':'The request identifies a resource and a filter.','',post?'Add a row: id 3, site A38, cars 286.':'The stored observations remain unchanged.',post?'The response reports creation and identifies the new resource.':'The response carries a representation of the matching observations.','Python receives a Response object. Parsing the body is a separate step.'][s];
    },()=>9);
  }
  function pagination(el) {
    controls(el,(step,stage,status)=>{
      const current=Math.min(step,2),done=step===3;
      let svg='<svg viewBox="0 0 1250 300" role="img" aria-label="Three response pages, each containing two records"><g font-family="Arial">';
      for(let i=0;i<3;i++){
        const x=70+i*400,fetched=i<=current,active=i===current&&!done;
        svg+=`<rect x="${x}" y="25" width="290" height="210" fill="${active?'#f6e4e8':'white'}" stroke="${fetched?red:'#bbb'}" stroke-width="${active?3:2}"/><text x="${x+145}" y="75" text-anchor="middle" font-size="32">Page ${i+1}</text><text x="${x+35}" y="135" font-size="28">${fetched?'record '+(i*2+1):'?'}</text><text x="${x+35}" y="185" font-size="28">${fetched?'record '+(i*2+2):'?'}</text>`;
        if(i<2)svg+=`<text x="${x+345}" y="115" text-anchor="middle" font-size="34" fill="${red}">→</text><text x="${x+345}" y="155" text-anchor="middle" font-size="22">next</text>`;
      }
      svg+='<text x="625" y="285" text-anchor="middle" font-size="24">Illustrative paginated response</text></g></svg>';
      const records=Array.from({length:(current+1)*2},(_,i)=>i+1);
      const next=current<2?'"?page='+(current+2)+'"':'None';
      stage.innerHTML=svg+`<div class="pagination-values"><div><code>next_page_url = ${next}</code></div><div>Collected records: <strong>[${records.join(', ')}]</strong></div></div>`;
      status.textContent=done?'All six records are collected. A single page held only two.':current<2?'Save this page, append its records, then follow the next-page link.':'The documented next-page field is empty: this is the last page.';
    },()=>3);
  }
  function mount(){document.querySelectorAll('.animation').forEach(el=>{
    if(el.dataset.mounted)return;el.dataset.mounted='true';
    ({memory,matrix,window:windowAnimation,classify,bins,http,pagination}[el.dataset.animation])?.(el);
  });
    const bind=()=>{
      const sync=slide=>slide?.querySelectorAll('.animation').forEach(el=>{
        const visible=el.querySelectorAll('.animation-cue.visible').length;
        if(el.getStep()!==visible)el.setStep(visible);
      });
      Reveal.on('fragmentshown',e=>sync(e.fragment.closest('section')));
      Reveal.on('fragmenthidden',e=>sync(e.fragment.closest('section')));
      Reveal.on('slidechanged',e=>sync(e.currentSlide));
      Reveal.sync();sync(Reveal.getCurrentSlide());window.week8AnimationsReady=true;
    };
    if(window.Reveal?.isReady())bind();else window.Reveal?.on('ready',bind);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
