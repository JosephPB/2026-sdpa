// Optional: node tests/slicing.test.cjs (no packages required).
const assert = require('node:assert/strict');
require('../activities/slicing-core.js');
const evaluate = globalThis.PythonSlice.evaluate;
for (const [text, slice, result, indices] of [
  ['PYTHON', ':3', 'PYT', [0,1,2]],
  ['PYTHON', ':5:2', 'PTO', [0,2,4]],
  ['PYTHON', '-4:', 'THON', [2,3,4,5]],
  ['PYTHON', '::-1', 'NOHTYP', [5,4,3,2,1,0]],
  ['PYTHON', ':-1:-1', '', []],
  ['PYTHON', '5:0:-2', 'NHY', [5,3,1]],
  ['PYTHON', '6:20', '', []],
  ['PYTHON', '-20:20', 'PYTHON', [0,1,2,3,4,5]],
  ['PYTHON', '-2', 'O', [4]],
  ['D:080', '2:', '080', [2,3,4]],
  ['  d:080  ', '2:7', 'd:080', [2,3,4,5,6]],
  ['', '::-1', '', []],
  ['A😊B', '1', '😊', [1]],
]) {
  const actual = evaluate(text,slice);
  assert.equal(actual.result,result,`${text}[${slice}]`);
  assert.deepEqual(actual.indices,indices);
}
for(const expression of ['6','-7','::0',':2:3:4','x','1 2','']) {
  assert.throws(()=>evaluate('PYTHON',expression));
}
console.log('Slicing checks passed.');
