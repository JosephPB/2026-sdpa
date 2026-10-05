(() => {
 document.getElementById('fullscreen')?.addEventListener('click',async()=>{
  try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { document.getElementById('status').textContent='Open the separate activity link for a larger view.'; }
 });
 window.drawSequence=(element,values,active=-1)=>{
  element.replaceChildren();
  values.forEach((value,i)=>{
   const item=document.createElement('div');item.className='item'+(i===active?' active':'');
   const index=document.createElement('small');index.textContent=i;
   const card=document.createElement('span');card.className='value'+(Array.isArray(value)?' nested-value':'');
   card.textContent=Array.isArray(value)?JSON.stringify(value):String(value);
   item.append(index,card);element.append(item);
  });
  if(!values.length)element.textContent='[]';
 };
})();
