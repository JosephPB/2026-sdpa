/* Advance and reverse scenes with ordinary Reveal fragments, never a timer. */
(() => {
  function sync() {
    document.querySelectorAll('.scene').forEach(scene => {
      const frames = [...scene.querySelectorAll('.scene-frame')];
      const printing = new URLSearchParams(location.search).has('print-pdf');
      const index = printing ? Number(scene.dataset.printStep || frames.length - 1)
        : scene.querySelectorAll('.scene-cue.visible').length;
      frames.forEach((frame, i) => {
        frame.classList.toggle('active', i === index);
        frame.setAttribute('aria-hidden', String(i !== index));
      });
    });
  }
  function boot() {
    if (!window.Reveal?.isReady()) { setTimeout(boot, 40); return; }
    ['slidechanged', 'fragmentshown', 'fragmenthidden', 'ready'].forEach(e => Reveal.on(e, sync));
    sync(); window.aiCodingReady = true;
  }
  boot();
})();
