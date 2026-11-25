/* Local, deterministic illustrations: no AI requests, file edits or execution. */
(() => {
  const specs = {
    chat: {
      duration: 15500,
      prompt: 'Write flag_force(readings, threshold). Flag values at or above the threshold. Return one Boolean per reading. Use only the standard library.',
      code: 'def flag_force(readings, threshold):\n    return [value >= threshold for value in readings]',
      intro: 'Here is a suggested implementation:',
      reply: 'Review the comparison and run your own tests before using it.'
    },
    agent: {
      duration: 28500,
      prompt: 'Implement flag_force; include equality. Run my existing tests. Only edit this demo folder. No installs or network access.',
      buggy: 'def flag_force(readings, threshold):\n    return [\n        value > threshold\n        for value in readings\n    ]',
      fixed: 'def flag_force(readings, threshold):\n    return [\n        value >= threshold\n        for value in readings\n    ]'
    }
  };
  const controllers = [];
  const part = (text, time, start, end) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor(text.length * (time - start) / (end - start)))));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const printing = () => new URLSearchParams(location.search).has('print-pdf');

  function controller(root) {
    const kind = root.dataset.demo, spec = specs[kind];
    let time = 0, playing = false, raf = null, last = null;
    const fields = Object.fromEntries([...root.querySelectorAll('[data-field]')].map(e => [e.dataset.field,e]));
    const pauseButton = root.querySelector('[data-action="pause"]');
    function set(name, text) { if(fields[name] && fields[name].textContent !== text) fields[name].textContent = text; }
    function draw() {
      set('prompt', part(spec.prompt, time, 350, kind === 'chat' ? 5200 : 5400));
      if (kind === 'chat') {
        root.querySelector('[data-panel="response"]').setAttribute('aria-hidden', String(time < 6000));
        set('intro', part(spec.intro,time,6000,7000));
        set('code',part(spec.code,time,7300,11900));
        set('reply',part(spec.reply,time,12300,15000));
        set('status',time < 5200 ? 'You specify the task.' : time < 6000 ? 'The assistant prepares a response…' : time < 15000 ? 'The assistant proposes code. Nothing has run.' : 'Response complete. You still need to run and check the code.');
        root.dataset.state = time >= 15000 ? 'complete' : 'running';
      } else {
        set('code',time < 22200 ? part(spec.buggy,time,7200,11600) : spec.fixed);
        set('fileStatus',time < 7200 ? 'waiting' : time < 11600 ? 'writing…' : time < 22200 ? 'generated' : 'comparison corrected');
        const first = '$ python -m unittest -v';
        const fail = first+'\nFAIL: test_at_threshold\nExpected [True]; got [False]\n4 tests; 1 failure';
        set('log', time < 12400 ? '' : time < 16000 ? first+'\nRunning four existing tests…' : time < 23800 ? fail : time < 26800 ? fail+'\n\n$ python -m unittest -v\nRunning again…' : fail+'\n\n$ python -m unittest -v\n4 tests; OK');
        const status = time < 5400 ? 'You define the task and permissions.' : time < 7200 ? 'Agent plan: implement, run the existing tests, inspect failures.' : time < 12400 ? 'Agent writes force.py.' : time < 16000 ? 'Agent runs the tests.' : time < 20000 ? 'Boundary failure: the requirement includes equality.' : time < 22200 ? 'Agent proposes a small fix. The test stays unchanged.' : time < 23800 ? 'Agent changes > to >= in force.py.' : time < 26800 ? 'Agent reruns the same four tests.' : 'Four tests pass. Human review remains pending.';
        set('status', status);
        set('runStatus',time < 12400 ? 'not run' : time < 16000 ? 'running' : time < 23800 ? '1 failure' : time < 26800 ? 'rerunning' : '4 passed');
        root.dataset.state = time >= 26800 ? 'complete' : time >= 16000 && time < 23800 ? 'failed' : 'running';
      }
      root.dataset.time = String(Math.round(time));
      pauseButton.textContent = playing ? 'Pause' : time >= spec.duration ? 'Play again' : 'Play';
      pauseButton.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
    }
    function stop() { playing = false; if(raf!==null) cancelAnimationFrame(raf); raf = null; last = null; draw(); }
    function tick(now) {
      if(!playing) return;
      if(last!==null) time = Math.min(spec.duration,time + now-last);
      last = now;
      if(time >= spec.duration) { stop(); return; }
      draw(); raf = requestAnimationFrame(tick);
    }
    function play() { if(time>=spec.duration) time=0; if(playing) return; playing=true;last=null;draw();raf=requestAnimationFrame(tick); }
    function replay() { stop();time=0;play(); }
    function finish() { stop();time=spec.duration;draw(); }
    function enter() { if(reduced()||printing()) finish(); else replay(); }
    root.querySelector('[data-action="pause"]').addEventListener('click',e=>{e.stopPropagation();playing?stop():play();});
    root.querySelector('[data-action="replay"]').addEventListener('click',e=>{e.stopPropagation();replay();});
    root.querySelector('[data-action="finish"]').addEventListener('click',e=>{e.stopPropagation();finish();});
    draw();
    return {root,kind,enter,stop,finish,seek(ms){stop();time=Math.max(0,Math.min(spec.duration,ms));draw();},getState(){return {time,playing,state:root.dataset.state};}};
  }
  function boot() {
    if(!window.Reveal?.isReady()) {setTimeout(boot,40);return;}
    document.querySelectorAll('.coding-demo').forEach(root=>controllers.push(controller(root)));
    function change() { controllers.forEach(c=>{if(c.root.closest('section')===Reveal.getCurrentSlide())c.enter();else c.stop();}); }
    Reveal.on('slidechanged',change);
    Reveal.on('paused',()=>controllers.forEach(c=>c.stop()));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(c=>c.stop());});
    window.addEventListener('beforeprint',()=>controllers.forEach(c=>c.finish()));
    if(printing())controllers.forEach(c=>c.finish());else change();
    window.aiDemos={get:kind=>controllers.find(c=>c.kind===kind)};
    window.aiDemosReady=true;
  }
  boot();
})();
