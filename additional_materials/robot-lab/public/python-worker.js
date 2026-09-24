importScripts('./vendor/skulpt.min.js', './vendor/skulpt-stdlib.js', './python-runtime.js');
let raw = '';
let waiting;
let sequence = 0;
self.onmessage = async ({ data }) => {
  if (data.type === 'ack' && waiting && data.id === waiting.id) {
    raw = data.raw;
    waiting.resolve();
    waiting = null;
  }
  if (data.type !== 'run') return;
  raw = data.raw;
  try {
    await RobotPython.run(data.code, {
      raw: () => raw,
      output: (text) => self.postMessage({ type: 'output', text }),
      command: (command) =>
        new Promise((resolve) => {
          const id = ++sequence;
          waiting = { id, resolve };
          self.postMessage({ type: 'command', command, id });
        }),
    });
    self.postMessage({ type: 'done' });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.toString(),
      line: error.traceback?.[0]?.lineno,
    });
  }
};
self.postMessage({ type: 'ready' });
