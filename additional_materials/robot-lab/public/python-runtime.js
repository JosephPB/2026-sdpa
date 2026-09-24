/* Skulpt stays inside a disposable worker. A print suspension resumes only
   after the UI acknowledges the completed movement and the new sensor value. */
(function (scope) {
  const commands = new Set(['FORWARD', 'SLOW', 'STOP', 'PAUSE']);
  scope.RobotPython = {
    async run(code, io) {
      const Sk = scope.Sk;
      let prints = 0;
      Sk.configure({
        __future__: Sk.python3,
        output: (text) => io.output(text),
        read: (name) => {
          if (Sk.builtinFiles?.files[name] !== undefined) return Sk.builtinFiles.files[name];
          throw new Error('Python module not available: ' + name);
        },
        inputfun: () => {
          throw new Sk.builtin.RuntimeError('Read the detector using raw instead of input().');
        },
        execLimit: 5000,
        yieldLimit: 100,
        timeoutMsg: () =>
          'No robot command for 5 seconds. Check your loop condition and re-read raw inside the loop.',
      });
      Object.defineProperty(Sk.builtins, 'raw', {
        configurable: true,
        enumerable: true,
        get: () => new Sk.builtin.str(io.raw()),
      });
      const normalWrite = Sk.builtin.file.prototype.write;
      Sk.builtin.file.prototype.write = new Sk.builtin.func(function (file, value) {
        if (file.fileno !== 1) return Sk.misceval.callsimOrSuspendArray(normalWrite, [file, value]);
        if (++prints > 1000)
          throw new Sk.builtin.RuntimeError(
            'Output limit reached. Check the loop, then run again.',
          );
        const text = Sk.ffi.remapToJs(value);
        io.output(text);
        const actions = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => commands.has(line));
        if (!actions.length) return Sk.builtin.none.none$;
        return Sk.misceval.promiseToSuspension(
          (async () => {
            for (const command of actions) await io.command(command);
            // Do not count the animation's wall-clock time as Python computation.
            Sk.execStart = Date.now();
            return Sk.builtin.none.none$;
          })(),
        );
      });
      try {
        return await Sk.misceval.asyncToPromise(() =>
          Sk.importMainWithBody('<student>', false, code, true),
        );
      } finally {
        Sk.builtin.file.prototype.write = normalWrite;
      }
    },
  };
})(globalThis);
