(() => {
  const $ = (id) => document.getElementById(id);
  const source = $('source'), expression = $('expression'), slots = $('slots');
  let tokens = [], cursor = 0, animation = 0, drag = null, suppressClick = false;
  const palette = ['-6', '-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', ':'];
  function hideAnswer() {
    animation += 1;
    $('answer').classList.remove('error');
    $('answer').textContent = 'Predict first, then press Slice.';
    $('explanation').textContent = 'Start included · stop excluded · default step 1';
    document.querySelectorAll('.selected').forEach((el) => el.classList.remove('selected'));
  }
  function drawCharacters() {
    $('characters').replaceChildren();
    const chars = ['A','B','C','D','E'];
    $('source-preview').textContent = source.value === 'tuple' ? '("A", "B", "C", "D", "E")' : '["A", "B", "C", "D", "E"]';
    if (!chars.length) {
      const empty = document.createElement('span');
      empty.className = 'empty'; empty.textContent = 'Empty string: no characters';
      $('characters').append(empty);
    }
    chars.forEach((char, i) => {
      const cell = document.createElement('div'); cell.className = 'character';
      cell.dataset.index = String(i);
      for (const [value, className] of [[i, 'index'], [char === ' ' ? '␣' : char, 'letter'], [i - chars.length, 'index']]) {
        const span = document.createElement('span'); span.className = className;
        span.textContent = String(value); cell.append(span);
      }
      cell.setAttribute('aria-label', `Index ${i}, negative index ${i - chars.length}: ${char === ' ' ? 'space' : char}`);
      $('characters').append(cell);
    });
    hideAnswer();
  }
  function drawSlots(sync = true) {
    slots.replaceChildren();
    for (let i = 0; i <= tokens.length; i++) {
      const gap = document.createElement('button'); gap.type = 'button';
      gap.className = `gap ${i === cursor ? 'active' : ''}`; gap.textContent = '';
      gap.dataset.slot = String(i); gap.setAttribute('aria-label', `Insert at position ${i + 1}`);
      gap.addEventListener('click', () => { cursor = i; drawSlots(false); });
      slots.append(gap);
      if (i < tokens.length) {
        const tile = document.createElement('button'); tile.type = 'button';
        tile.className = 'tile placed'; tile.textContent = tokens[i];
        tile.dataset.placed = String(i); tile.dataset.token = tokens[i];
        tile.setAttribute('aria-label', `Remove ${tokens[i]} at position ${i + 1}`);
        tile.addEventListener('click', () => {
          if (suppressClick) return;
          tokens.splice(i, 1); cursor = Math.min(cursor, tokens.length); drawSlots(); hideAnswer();
        });
        slots.append(tile);
      }
    }
    if (sync) expression.value = tokens.join('');
  }
  function insert(token, index = cursor, from = null) {
    if (from !== null) { tokens.splice(from, 1); if (from < index) index -= 1; }
    tokens.splice(index, 0, token); cursor = index + 1; drawSlots(); hideAnswer();
  }
  palette.forEach((token) => {
    const tile = document.createElement('button'); tile.type = 'button';
    tile.className = 'tile'; tile.textContent = token; tile.dataset.token = token;
    tile.setAttribute('aria-label', `Add ${token === ':' ? 'colon' : token}`);
    tile.addEventListener('click', () => { if (!suppressClick) insert(token); });
    $('palette').append(tile);
  });
  // Pointer events support mouse, stylus and touch. Click insertion remains available.
  document.addEventListener('pointerdown', (event) => {
    const tile = event.target.closest('.tile');
    if (!tile || event.button !== 0) return;
    drag = { tile, x: event.clientX, y: event.clientY, pointer: event.pointerId, ghost: null };
  });
  document.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
      drag.ghost = document.createElement('div'); drag.ghost.className = 'tile drag-ghost';
      drag.ghost.textContent = drag.tile.dataset.token; document.body.append(drag.ghost);
    }
    if (!drag.ghost) return;
    event.preventDefault();
    drag.ghost.style.left = `${event.clientX}px`; drag.ghost.style.top = `${event.clientY}px`;
    slots.querySelectorAll('.gap').forEach((el) => el.classList.remove('active'));
    document.elementFromPoint(event.clientX, event.clientY)?.closest('.gap')?.classList.add('active');
  }, { passive: false });
  function endDrag(event) {
    if (!drag || drag.pointer !== event.pointerId) return;
    const active = drag; drag = null;
    if (!active.ghost) return;
    active.ghost.remove(); suppressClick = true;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-slot]');
    if (target && event.type === 'pointerup') {
      insert(active.tile.dataset.token, Number(target.dataset.slot), active.tile.dataset.placed === undefined ? null : Number(active.tile.dataset.placed));
    } else drawSlots(false);
    setTimeout(() => { suppressClick = false; }, 0);
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  expression.addEventListener('input', () => {
    // Preserve invalid typed input for a useful error message rather than silently fixing it.
    tokens = expression.value.match(/[+-]?\d+|:|[^\s]/g) || [];
    cursor = tokens.length; drawSlots(false); hideAnswer();
  });
  expression.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  source.addEventListener('change', drawCharacters);
  document.querySelectorAll('[data-text]').forEach((button) => button.addEventListener('click', () => {
    source.value = button.dataset.text; drawCharacters();
  }));
  $('clear').addEventListener('click', () => { tokens = []; cursor = 0; drawSlots(); hideAnswer(); });
  async function run() {
    hideAnswer(); const runId = animation;
    try {
      const result = PythonSlice.evaluate('ABCDE', expression.value);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      for (const index of result.indices) {
        if (animation !== runId) return;
        $('characters').querySelector(`[data-index="${index}"]`).classList.add('selected');
        if (!reduced) await new Promise((resolve) => setTimeout(resolve, 110));
      }
      if (animation !== runId) return;
      const parts = result.indices.map(i => JSON.stringify('ABCDE'[i]));
      const value = result.kind === 'index' ? parts[0] : source.value === 'tuple' ? '(' + parts.join(', ') + (parts.length === 1 ? ',' : '') + ')' : '[' + parts.join(', ') + ']';
      $('answer').textContent = `s[${expression.value}] = ${value}`;
      $('explanation').textContent = result.indices.length ? `Selected indices: ${result.indices.join(', ')}${result.kind === 'slice' ? `. Step ${result.step}; stop excluded.` : '.'}` : 'Empty slice: no indices are selected.';
    } catch (error) {
      $('answer').classList.add('error'); $('answer').textContent = error.message.replace('string index', source.value + ' index');
      $('explanation').textContent = 'Adjust the expression and try again.';
    }
  }
  $('slice').addEventListener('click', run);
  $('fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { $('explanation').textContent = 'Use the separate activity link to open a larger view.'; }
  });
  document.addEventListener('fullscreenchange', () => { $('fullscreen').textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; });
  drawSlots(); drawCharacters();
})();
