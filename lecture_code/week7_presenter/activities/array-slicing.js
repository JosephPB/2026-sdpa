function setupArraySlicing({mode,indices}) {
 const C=document.querySelector('#controls'),B=document.querySelector('#board'),R=document.querySelector('#result');
 document.body.classList.add('slice-mode');C.hidden=true;document.querySelector('#instruction').hidden=true;
 const dims=mode==='slice2'?[4,5]:[3,4,3];
 const labels=dims.length===2?['Row','Column']:['Row','Column','Channel'];
 let tokens=dims.map((_,i)=>i===0?['1',':']:[':']),axis=0,cursor=2,revealed=false,flat=false;
 const editor=document.createElement('div');editor.className='array-slice-editor';B.after(editor);
 const expression=document.createElement('div');expression.className='array-expression';editor.append(expression);
 const palette=document.createElement('div');palette.className='array-palette';editor.append(palette);
 const actions=document.createElement('div');actions.className='slice-actions';editor.append(actions);
 function resetResult(){revealed=false;R.textContent='';drawBoard();}
 function drawExpression(){
  expression.replaceChildren();
  const bracket=s=>{const span=document.createElement('span');span.className='bracket';span.textContent=s;expression.append(span);};bracket('a[');
  tokens.forEach((list,a)=>{
   if(a)bracket(',');const group=document.createElement('div');group.className='slice-axis';
   const label=document.createElement('button');label.className='axis-label';label.textContent=labels[a];label.setAttribute('aria-label','Select '+labels[a].toLowerCase()+' axis');label.onclick=()=>{axis=a;cursor=list.length;drawExpression();};group.append(label);
   const slots=document.createElement('div');slots.className='token-slots';group.append(slots);
   for(let i=0;i<=list.length;i++){
    const gap=document.createElement('button');gap.className='gap'+(axis===a&&cursor===i?' active':'');gap.setAttribute('aria-label',`Insert in ${labels[a].toLowerCase()} at position ${i+1}`);gap.onclick=()=>{axis=a;cursor=i;drawExpression();};slots.append(gap);
    if(i<list.length){const tile=document.createElement('button');tile.className='tile placed';tile.textContent=list[i];tile.setAttribute('aria-label',`Remove ${list[i]===':'?'colon':list[i]} from ${labels[a].toLowerCase()} at position ${i+1}`);tile.onclick=()=>{list.splice(i,1);axis=a;cursor=Math.min(i,list.length);drawExpression();resetResult();};slots.append(tile);}
   }
   expression.append(group);
  });bracket(']');
 }
 for(const value of ['-5','-4','-3','-2','-1','0','1','2','3','4','5',':']){
  const tile=document.createElement('button');tile.className='tile';tile.textContent=value;tile.setAttribute('aria-label','Add '+(value===':'?'colon':value));tile.onclick=()=>{tokens[axis].splice(cursor,0,value);cursor++;drawExpression();resetResult();};palette.append(tile);
 }
 const clear=document.createElement('button');clear.textContent='Clear';clear.onclick=()=>{tokens=dims.map(()=>[]);axis=0;cursor=0;drawExpression();resetResult();};actions.append(clear);
 if(dims.length===3){const view=document.createElement('button');view.textContent='Show flat layers';view.onclick=()=>{flat=!flat;view.textContent=flat?'Show 3D layers':'Show flat layers';drawBoard();};actions.append(view);}
 const run=document.createElement('button');run.className='primary';run.textContent='Slice';run.onclick=()=>{revealed=true;drawBoard();};actions.append(run);
 function drawBoard(){
  let slices=null,shape=[],selected=[];
  if(revealed){try{if(tokens.some(x=>!x.length))throw Error('Add a number or colon for each axis.');slices=tokens.map((x,i)=>indices(x.join(''),dims[i]));shape=slices.filter(x=>!x.scalar).map(x=>x.ids.length);}catch(e){R.textContent=e.message;revealed=false;}}
  if(dims.length===2){
   B.innerHTML='<table class="indexed-array"><thead><tr><th></th>'+Array.from({length:5},(_,c)=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+Array.from({length:4},(_,r)=>'<tr><th>'+r+'</th>'+Array.from({length:5},(_,c)=>`<td class="${slices&&slices[0].ids.includes(r)&&slices[1].ids.includes(c)?'selected':''}">${r*5+c}</td>`).join('')+'</tr>').join('')+'</tbody></table>';
   if(slices)for(let r of slices[0].ids)for(let c of slices[1].ids)selected.push(r*5+c);
  }else{
   let svg='<svg viewBox="0 0 900 310" role="img" aria-label="Three indexed array layers">';
   for(let l=0;l<3;l++){
    const ox=l*295+25,oy=flat?65:150-l*47;
    svg+=`<text x="${ox}" y="${oy-33}" font-size="23">channel ${l}</text>`;
    for(let c=0;c<4;c++)svg+=`<text x="${ox+c*48+15}" y="${oy-10}" font-size="16" fill="#666">${c}</text>`;
    for(let r=0;r<3;r++){
     svg+=`<text x="${ox-20+(flat?0:r*12)}" y="${oy+r*42+27}" font-size="16" fill="#666">${r}</text>`;
     for(let c=0;c<4;c++){
      const x=ox+c*48+(flat?0:r*12),y=oy+r*42;
      const hit=slices&&slices[0].ids.includes(r)&&slices[1].ids.includes(c)&&slices[2].ids.includes(l);
      svg+=`<rect x="${x}" y="${y}" width="45" height="39" fill="${hit?'#a71930':'#f4f4f4'}" stroke="#888"/><text x="${x+13}" y="${y+27}" fill="${hit?'white':'#242424'}" font-size="20">${r*12+c*3+l}</text>`;
     }
    }
   }B.innerHTML=svg+'</svg>';
   if(slices)for(let r of slices[0].ids)for(let c of slices[1].ids)for(let l of slices[2].ids)selected.push(r*12+c*3+l);
  }
  if(slices)R.textContent=`a[${tokens.map(x=>x.join('')).join(', ')}] → shape (${shape.join(', ')}${shape.length===1?',':''})\nValues: [${selected.join(', ')}]`;
 }
 drawExpression();drawBoard();
}
