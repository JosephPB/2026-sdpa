importScripts('skulpt.min.js', 'skulpt-stdlib.js');
let waitingInput = null;
onmessage = async (event) => {
  const message = event.data;
  if (message.type === 'input' && waitingInput) {
    waitingInput(message.value); waitingInput = null; return;
  }
  if (message.type !== 'run') return;
  let distance = 80, writes = 0, printed = 0;
  const raw = () => `  d:${String(Math.round(distance)).padStart(3, '0')}  `;
  const output = (text) => {
    printed += text.length;
    if (++writes > 200 || printed > 16000) throw new Sk.builtin.RuntimeError('Run stopped after excessive output. Check the loop condition.');
    postMessage({type:'output', text});
  };
  const sensor = () => postMessage({type:'sensor', distance, raw:raw()});
  Sk.configure({
    __future__: Sk.python3,
    output,
    read: (name) => {
      if (Object.prototype.hasOwnProperty.call(message.files || {}, name)) return message.files[name];
      if (Sk.builtinFiles?.files[name] !== undefined) return Sk.builtinFiles.files[name];
      throw new Error(`File or module not available: ${name}`);
    },
    inputfunTakesPrompt: true,
    inputfun: (prompt) => new Promise((resolve) => {
      waitingInput = (value) => { Sk.execStart = Date.now(); resolve(value); };
      postMessage({type:'input', prompt});
    }),
    execLimit: 5000,
    yieldLimit: 100,
    timeoutMsg: () => 'Run stopped after 5 seconds of computation. Check the loop condition.',
  });
  if (message.robot) {
    sensor();
    Object.defineProperty(Sk.builtins, 'raw', {configurable:true, enumerable:true, get:()=>new Sk.builtin.str(raw())});
    const normalWrite = Sk.builtin.file.prototype.write;
    Sk.builtin.file.prototype.write = new Sk.builtin.func((file, value) => {
      if (file.fileno !== 1) return Sk.misceval.callsimOrSuspendArray(normalWrite, [file, value]);
      const text = Sk.ffi.remapToJs(value); output(text);
      const commands = text.split(/\r?\n/).map(t=>t.trim()).filter(t=>['FORWARD','SLOW','STOP','PAUSE'].includes(t));
      if (!commands.length) return Sk.builtin.none.none$;
      return Sk.misceval.promiseToSuspension((async()=>{
        for (const command of commands) {
          postMessage({type:'command', command});
          await new Promise(resolve=>setTimeout(resolve,2000));
          if (command === 'FORWARD') distance -= 20;
          if (command === 'SLOW') distance -= 10;
          if (distance <= 0) {
            distance = 80; sensor();
            throw new Sk.builtin.RuntimeError('CRASH! Practice sensor reset to 80 cm.');
          }
          sensor();
        }
        Sk.execStart = Date.now();
        return Sk.builtin.none.none$;
      })());
    });
  }
  try {
    await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody('<slide>',false,message.code,true));
    postMessage({type:'done'});
  } catch(error) {
    postMessage({type:'error', text:String(error)});
  }
};
