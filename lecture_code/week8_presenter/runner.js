/* Real local Python execution. Serve this deck with python serve.py. */
(() => {
  let busy = false;
  const mode = fetch('/runner-config').then(r => {
    if (!r.ok) throw Error('Start the deck with python serve.py to use Run.');
    return r.json();
  }).catch(() => ({mode:'unavailable'}));
  document.querySelectorAll('.code-example').forEach(example => {
    const code = example.querySelector('pre code'), result = example.querySelector('.run-result');
    if (!code || !result) return;
    const controls = document.createElement('div'); controls.className = 'run-controls';
    const button = document.createElement('button'); button.className = 'run-button'; button.textContent = 'Run';
    const status = document.createElement('span'); status.className = 'run-status'; status.setAttribute('aria-live','polite');
    controls.append(button,status); example.querySelector('.code-source').append(controls);
    mode.then(config => {status.textContent = config.mode === 'saved' ? 'Saved source data' : config.mode === 'unavailable' ? 'Start with python serve.py' : '';});
    button.onclick = async () => {
      if (busy) return;
      busy = true; document.querySelectorAll('.run-button').forEach(b => b.disabled = true);
      status.textContent = 'Running…';
      try {
        const config = await mode;
        const response = await fetch('/run', {method:'POST',headers:{'Content-Type':'application/json','X-SDPA-Run':'1'},body:JSON.stringify({code:code.textContent})});
        const output = await response.json();
        result.replaceChildren();
        for (const chunk of output.chunks || []) {
          const template = document.createElement('template'); template.innerHTML = chunk.html; result.append(template.content);
        }
        for (const data of output.images || []) {const img = new Image();img.src='data:image/png;base64,'+data;img.alt='Python plot';result.append(img);}
        if(output.error) {const pre=document.createElement('pre');pre.className='print-output error';pre.textContent=output.error;result.append(pre);}
        status.textContent = output.error ? 'Python error' : config.mode === 'saved' ? 'Done · saved source data' : 'Done';
      } catch(error) {status.textContent='Could not run: '+error.message;}
      finally {busy=false;document.querySelectorAll('.run-button').forEach(b=>b.disabled=false);}
    };
  });
})();
