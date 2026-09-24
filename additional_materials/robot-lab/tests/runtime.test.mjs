import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { examples } from '../src/examples.js';

async function execute(code, initial = 80) {
  const sandbox = vm.createContext({ console, setTimeout, clearTimeout });
  for (const path of [
    'public/vendor/skulpt.min.js',
    'public/vendor/skulpt-stdlib.js',
    'public/python-runtime.js',
  ]) {
    vm.runInContext(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), sandbox);
  }
  let distance = initial;
  const output = [],
    commands = [],
    readings = [];
  await sandbox.RobotPython.run(code, {
    raw: () => `  d:${String(distance).padStart(3, '0')}  `,
    output: (text) => output.push(text),
    command: async (command) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      commands.push(command);
      distance -= command === 'FORWARD' ? 20 : command === 'SLOW' ? 10 : 0;
      readings.push(distance);
    },
  });
  return { distance, output: output.join(''), commands, readings };
}
test('one decision advances exactly once', async () => {
  assert.equal((await execute(examples.branching.code)).distance, 60);
  assert.equal((await execute(examples.branching.code, 40)).distance, 30);
  assert.equal((await execute(examples.branching.code, 20)).distance, 20);
});
test('while re-reads the measurement only after each acknowledged move', async () => {
  const result = await execute(examples.while.code);
  assert.deepEqual(result.commands, ['FORWARD', 'FORWARD', 'FORWARD', 'STOP']);
  assert.deepEqual(result.readings, [60, 40, 20, 20]);
});
test('for loop pauses, breaks at S and leaves the final FF unexecuted', async () => {
  const result = await execute(examples.for.code);
  assert.deepEqual(result.commands, ['FORWARD', 'FORWARD', 'PAUSE', 'FORWARD', 'STOP']);
  assert.equal(result.distance, 20);
});
test('normal print semantics, snapshots and raw after a command', async () => {
  const result = await execute(
    'saved = raw\nprint("FORWARD")\nprint(saved.strip(), raw.strip(), sep=" / ")\nprint(1 + 2, end="!")',
  );
  assert.equal(result.output, 'FORWARD\nd:080 / d:060\n3!');
});
test('commands match whole printed lines, including multiple lines', async () => {
  const result = await execute(
    'print("not FORWARD")\nprint("FORWARD\\nPAUSE")\nprint("SLOW", end="")',
  );
  assert.deepEqual(result.commands, ['FORWARD', 'PAUSE', 'SLOW']);
});
test('syntax errors are real Python errors', async () => {
  await assert.rejects(execute('if True\n    print("FORWARD")'), /SyntaxError/);
});
