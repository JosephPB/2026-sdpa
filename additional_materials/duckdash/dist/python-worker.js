importScripts(
  "./vendor/skulpt.min.js",
  "./vendor/skulpt-stdlib.js",
  "./python-runtime.js",
);
let pending = new Map(),
  sequence = 0;
self.onmessage = async ({ data }) => {
  if (data.type === "ack") {
    const p = pending.get(data.id);
    if (p) {
      pending.delete(data.id);
      data.error ? p.reject(new Error(data.error)) : p.resolve(data.number);
    }
    return;
  }
  if (data.type !== "run") return;
  try {
    await DuckDashPython.run(data.code, {
      output: (text) => postMessage({ type: "output", text }),
      submit: (request) =>
        new Promise((resolve, reject) => {
          const id = ++sequence;
          pending.set(id, { resolve, reject });
          postMessage({ type: "submit", request, id });
        }),
    });
    postMessage({ type: "done" });
  } catch (error) {
    postMessage({
      type: "error",
      message: error.toString(),
      line: error.studentLine,
    });
  }
};
postMessage({ type: "ready" });
