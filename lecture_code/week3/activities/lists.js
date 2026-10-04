(() => {
 const $=id=>document.getElementById(id);
 let scene=new URLSearchParams(location.search).get('scene')||'add';if(!['add','remove','iterate'].includes(scene))scene='add';
 let operation=0,route=[],source=[],index=0,phase=0,current=null,overCopy=false,done=false;
 const operations={add:['route.append(["C", "D"])','route.extend(["C", "D"])','route + ["C", "D"]'],remove:['route.insert(1, "D")','route.pop(2)','route.remove("B")','del route[2]','route.pop()','route.remove("E")']};
 function setup(){
  $('scene').value=scene;$('choices').replaceChildren();
  if(scene==='iterate'){
   ['Original list','Copy of the list'].forEach((label,i)=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',String(overCopy===(i===1)));b.onclick=()=>{overCopy=i===1;setup();};$('choices').append(b);});
  }else operations[scene].forEach((text,i)=>{const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-pressed',String(operation===i));b.onclick=()=>{operation=i;setup();};$('choices').append(b);});
  reset();
 }
 function reset(){
  route=scene==='add'?['A','B']:scene==='remove'?['A','B','C','B']:['A','B','C','D'];source=overCopy?route.slice():route;
  index=0;phase=0;current=null;done=false;$('run').disabled=false;$('run').textContent=scene==='iterate'?'Step loop':'Run operation';
  $('left-label').textContent=scene==='iterate'?'List being read':'Before';$('right-label').textContent=scene==='iterate'?'route':'After';
  $('code').textContent=scene==='iterate'?`route = ["A", "B", "C", "D"]\nfor stop in route${overCopy?'.copy()':''}:\n    if stop in ["A", "B"]:\n        route.remove(stop)`:`route = ${JSON.stringify(route)}\n${operations[scene][operation]}`;
  drawSequence($('before'),scene==='iterate'?source:route);$('after').textContent='Predict first';if(scene==='iterate')drawSequence($('after'),route);
  $('status').className='output';$('status').textContent=scene==='iterate'?'Next loop index: 0. Predict the first stop.':'Predict the list contents and the return value.';
 }
 function run(){
  if(scene==='iterate'){
   if(done)return;
   if(phase===0){
    if(index>=source.length){done=true;$('run').disabled=true;$('status').textContent=`Loop finished. route = ${JSON.stringify(route)}`;drawSequence($('before'),source);drawSequence($('after'),route);return;}
    current=source[index];phase=1;drawSequence($('before'),source,index);$('status').textContent=`Read index ${index}: stop = "${current}". Will it be removed?`;
   }else{
    const remove=['A','B'].includes(current);if(remove)route.splice(route.indexOf(current),1);
    index++;phase=0;drawSequence($('before'),source);drawSequence($('after'),route);
    $('status').textContent=(remove?`Removed ${current}.`:`Kept ${current}.`)+` Next loop index: ${index}.`;
   }return;
  }
  let result='None',output=route.slice();
  if(scene==='add'){
   if(operation===0)output.push(['C','D']);
   if(operation===1)output.push('C','D');
   if(operation===2){output.push('C','D');result=JSON.stringify(output);}
  }else{
   if(operation===0)output.splice(1,0,'D');
   if(operation===1)result=JSON.stringify(output.splice(2,1)[0]);
   if(operation===2)output.splice(output.indexOf('B'),1);
   if(operation===3){output.splice(2,1);result='no expression result (del is a statement)';}
   if(operation===4)result=JSON.stringify(output.pop());
   if(operation===5){$('status').textContent='ValueError: E is not in the list. route is unchanged.';$('status').classList.add('error');drawSequence($('after'),output);$('run').disabled=true;return;}
  }
  drawSequence($('after'),output);$('right-label').textContent=scene==='add'&&operation===2?'New list returned':'route after the operation';
  $('status').textContent=scene==='add'&&operation===2?`Return: ${result}. Original route stays ["A","B"].`:`Return: ${result}. Length: ${output.length}.`;
  $('run').disabled=true;
 }
 $('scene').onchange=()=>{scene=$('scene').value;operation=0;setup();};$('run').onclick=run;$('reset').onclick=reset;setup();
})();
