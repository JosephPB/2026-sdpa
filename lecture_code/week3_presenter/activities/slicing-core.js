// A small evaluator for integer indexing and slicing, not arbitrary Python code.
// Python strings index Unicode code points; Array.from gives that same unit here.
(function (root) {
  function integer(text) {
    if (!/^[+-]?\d+$/.test(text)) throw new SyntaxError('Use whole numbers and colons only.');
    const value = Number(text);
    if (!Number.isSafeInteger(value)) throw new RangeError('Use an integer within JavaScript’s safe range.');
    return value;
  }
  function evaluate(text, expression) {
    const chars = Array.from(text);
    const n = chars.length;
    const fields = expression.trim().split(':').map((s) => s.trim());
    if (fields.length === 1) {
      if (!fields[0]) throw new SyntaxError('Add an index, or at least one colon for a slice.');
      let index = integer(fields[0]);
      if (index < 0) index += n;
      if (index < 0 || index >= n) throw new RangeError('IndexError: string index out of range');
      return { result: chars[index], indices: [index], kind: 'index', step: null };
    }
    if (fields.length > 3) throw new SyntaxError('A slice has at most two colons: start:stop:step.');
    const step = fields.length < 3 || fields[2] === '' ? 1 : integer(fields[2]);
    if (step === 0) throw new RangeError('ValueError: slice step cannot be zero');
    const forward = step > 0;
    const bound = (value, fallback) => {
      if (value === '') return fallback;
      let index = integer(value);
      if (index < 0) index += n;
      return Math.max(forward ? 0 : -1, Math.min(index, forward ? n : n - 1));
    };
    const start = bound(fields[0], forward ? 0 : n - 1);
    const stop = bound(fields[1], forward ? n : -1);
    const indices = [];
    for (let i = start; forward ? i < stop : i > stop; i += step) indices.push(i);
    return { result: indices.map((i) => chars[i]).join(''), indices, kind: 'slice', start, stop, step };
  }
  root.PythonSlice = { evaluate };
})(globalThis);
