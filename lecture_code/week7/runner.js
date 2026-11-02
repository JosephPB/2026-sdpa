(()=>{
 let worker,busy=false;
 const makeWorker=()=>new Worker('worker.js');
 document.querySelectorAll('pre code.sourceCode.python,pre code.language-python').forEach(code=>{
  const pre=code.closest('div.sourceCode')||code.closest('pre');
  const section=code.closest('section');
  const wrapper=pre.closest('.code-copy-outer-scaffold')||pre;
  const result=wrapper.nextElementSibling?.classList.contains('run-result')?wrapper.nextElementSibling:section.querySelector('.run-result');
  if(!result)return;if(result.querySelector('img'))section.classList.add('plot-slide');
  const mapOutput=section.querySelector('.map-output');if(mapOutput)mapOutput.append(result);
  const controls=document.createElement('div');controls.className='run-controls';
  const run=document.createElement('button');run.className='run-button';run.textContent='Run';
  const stop=document.createElement('button');stop.className='run-button';stop.textContent='Stop';stop.hidden=true;
  const status=document.createElement('span');status.className='run-status';status.setAttribute('aria-live','polite');
  controls.append(run,stop,status);pre.after(controls);
  run.onclick=()=>{
   if(busy)return;busy=true;
   document.querySelectorAll('.run-button').forEach(b=>{if(b.textContent==='Run')b.disabled=true;});stop.hidden=false;
   worker??=makeWorker();
   const finish=()=>{busy=false;stop.hidden=true;document.querySelectorAll('.run-button').forEach(b=>{if(b.textContent==='Run')b.disabled=false;});};
   worker.onmessage=event=>{
    const d=event.data;if(d.status){status.textContent=d.status;return;}
    if(d.result){
     result.replaceChildren();
     for(const chunk of d.result.chunks||[]){const template=document.createElement('template');template.innerHTML=chunk.html;result.append(template.content);}
     if(d.result.error){const error=document.createElement('div');error.className='print-output error';error.textContent=d.result.error;result.append(error);}
     for(const im of d.result.images){const img=new Image();img.src='data:image/png;base64,'+im;img.alt='Python plot';result.append(img);}
     status.textContent=d.result.error?'Python error':'';
    } else status.textContent=d.error;
    finish();
   };
   worker.onerror=e=>{status.textContent='Runtime error: '+e.message;worker.terminate();worker=null;finish();};
   stop.onclick=()=>{worker.terminate();worker=null;status.textContent='Stopped';finish();};
   worker.postMessage({code:code.textContent});
  };
 });
})();
