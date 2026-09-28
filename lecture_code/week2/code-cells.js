(() => {
  const cells = [];
  const files = fetch('data/names.csv').then(async response => {
    if(!response.ok) throw new Error('The example CSV could not be loaded. Use quarto preview to serve the whole folder.');
    return {'data/names.csv':await response.text()};
  });
  // Avoid an unhandled rejection before a user chooses Run.
  files.catch(()=>{});
  document.querySelectorAll('pre > code.python').forEach((code, index) => {
    const pre=code.parentElement;
    const original=code.textContent.replace(/\n$/,'');
    const originalMarkup=code.innerHTML;
    const block=pre.closest('div.sourceCode') || pre;
    const root=document.createElement('div');root.className='code-cell';
    root.dataset.cell=String(index);
    const robot=pre.classList.contains('robot-python') || !!pre.closest('.robot-python');
    root.dataset.robot=String(robot);
    block.before(root);root.append(block);
    const editor=document.createElement('textarea');editor.className='cell-editor';editor.hidden=true;
    editor.value=original;editor.spellcheck=false;
    editor.setAttribute('aria-label',`Python code ${index+1}`);
    editor.style.height=`${Math.min(450,Math.max(120,original.split('\n').length*37+26))}px`;
    root.append(editor);
    const controls=document.createElement('div');controls.className='cell-controls';root.append(controls);
    const buttons={};
    for(const [action,label] of [['run','Run'],['stop','Stop'],['edit','Edit'],['reset','Reset']]){
      const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.action=action;
      buttons[action]=button;controls.append(button);
    }
    buttons.stop.disabled=true;
    const status=document.createElement('span');status.className='cell-status';status.setAttribute('role','status');controls.append(status);
    const sensor=document.createElement('div');sensor.className='cell-sensor';sensor.hidden=!robot;
    sensor.textContent='Practice sensor: 80 cm';root.append(sensor);
    const output=document.createElement('div');output.className='cell-output';output.tabIndex=0;
    output.setAttribute('role','region');output.setAttribute('aria-label',`Python output ${index+1}`);root.append(output);
    const inputForm=document.createElement('form');inputForm.className='cell-input';inputForm.hidden=true;
    const label=document.createElement('label');const field=document.createElement('input');field.type='text';field.id=`cell-input-${index}`;
    label.htmlFor=field.id;field.autocomplete='off';
    const submit=document.createElement('button');submit.type='submit';submit.textContent='Send';
    inputForm.append(label,field,submit);root.append(inputForm);
    let worker=null, timer=null, runId=0;
    function stop(message='Stopped'){
      runId++;worker?.terminate();worker=null;clearTimeout(timer);inputForm.hidden=true;
      buttons.run.disabled=false;buttons.stop.disabled=true;editor.readOnly=false;
      if(message)status.textContent=message;
    }
    const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{output.classList.add('error');output.textContent+='\nRun stopped: Python did not respond.';stop('Stopped');},12000);};
    buttons.stop.onclick=()=>stop();
    buttons.edit.onclick=()=>{
      editor.hidden=!editor.hidden;block.hidden=!editor.hidden;
      buttons.edit.textContent=editor.hidden?'View code':'Edit';
      if(!editor.hidden){buttons.edit.textContent='View code';editor.focus();}
      else {buttons.edit.textContent='Edit';code.textContent=editor.value;}
      window.Reveal?.layout();
    };
    buttons.reset.onclick=()=>{
      stop('');editor.value=original;code.innerHTML=originalMarkup;output.textContent='';status.textContent='';
      editor.hidden=true;block.hidden=false;buttons.edit.textContent='Edit';sensor.textContent='Practice sensor: 80 cm';
    };
    buttons.run.onclick=async()=>{
      stop('Loading Python…');const id=runId;
      output.textContent='';output.classList.remove('error');buttons.run.disabled=true;
      buttons.stop.disabled=false;editor.readOnly=true;
      try {
        const virtualFiles=await files;if(runId!==id)return;
        worker=new Worker('runtime/cell-worker.js');status.textContent='Running';arm();
        worker.onerror=()=>{output.classList.add('error');output.textContent='Python could not start. Serve the complete folder with quarto preview.';stop('Error');};
        worker.onmessage=({data})=>{
          if(runId!==id)return;
          if(data.type==='output'){output.textContent+=data.text;output.scrollTop=output.scrollHeight;arm();}
          if(data.type==='command'){status.textContent=data.command;arm();}
          if(data.type==='sensor'){sensor.textContent=`Practice sensor: ${data.distance} cm; raw = ${JSON.stringify(data.raw)}`;arm();}
          if(data.type==='input'){
            clearTimeout(timer);status.textContent='Waiting for input';label.textContent=data.prompt;
            field.value='';inputForm.hidden=false;field.focus();window.Reveal?.layout();
          }
          if(data.type==='done'){if(!output.textContent)output.textContent='(No printed output)';stop('Complete');}
          if(data.type==='error'){output.classList.add('error');output.textContent+=`\n${data.text}`;output.scrollTop=output.scrollHeight;stop('Error');}
        };
        worker.postMessage({type:'run',code:editor.value,robot,files:virtualFiles});
      }catch(error){output.classList.add('error');output.textContent=error.message;stop('Error');}
      window.Reveal?.layout();
    };
    inputForm.onsubmit=(event)=>{
      event.preventDefault();if(!worker)return;
      output.textContent+=`${label.textContent}${field.value}\n`;
      worker.postMessage({type:'input',value:field.value});inputForm.hidden=true;status.textContent='Running';arm();
    };
    root.addEventListener('keydown',event=>{
      event.stopPropagation();
      if(event.target===editor && event.key==='Tab'){
        event.preventDefault();const pos=editor.selectionStart;editor.setRangeText('    ',pos,editor.selectionEnd,'end');
      }
    });
    cells.push({root,stop});
  });
  if(window.Reveal){
    Reveal.on('slidechanged',()=>cells.forEach(cell=>{if(!Reveal.getCurrentSlide().contains(cell.root))cell.stop('');}));
    Reveal.layout();
  }
})();
