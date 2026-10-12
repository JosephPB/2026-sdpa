(function (scope) {
  scope.DuckDashPython = {
    async run(code, io) {
      const Sk = scope.Sk;
      let printed = 0;
      const bridge = `def send_to_kitchen(details):\n    return _duckdash_submit(details)\n\ndef submit_order(pizza, total, customer="Guest", size="regular", toppings=None, order_number=None, quantity=1):\n    if toppings is None:\n        toppings = []\n    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1 or quantity > 20:\n        raise ValueError("Quantity must be a whole number from 1 to 20.")\n    return send_to_kitchen({"items": [{"pizza": pizza, "size": size, "toppings": toppings}] * quantity, "total": total, "customer": customer, "order_number": order_number})\n\ndef submit_basket(items, total, customer="Group", order_number=None):\n    return send_to_kitchen({"items": items, "total": total, "customer": customer, "order_number": order_number})\n\n`;

      Sk.configure({
        __future__: Sk.python3,
        output: (text) => {
          printed += text.length;
          if (printed > 50000)
            throw new Sk.builtin.RuntimeError(
              "Output limit reached. Check your loop.",
            );
          io.output(text);
        },
        read: (name) => {
          if (name === "src/lib/duckdash.py" || name === "duckdash.py")
            return bridge;
          if (Sk.builtinFiles?.files[name] !== undefined)
            return Sk.builtinFiles.files[name];
          throw new Error("Module not available: " + name);
        },
        inputfun: () => {
          throw new Sk.builtin.RuntimeError(
            "Use the customer order fields, or set variables in your code.",
          );
        },
        execLimit: 4000,
        yieldLimit: 100,
        timeoutMsg: () =>
          "Code ran for too long. Check your loop or recursive base case.",
      });
      Sk.builtins._duckdash_submit = new Sk.builtin.func((payload) =>
        Sk.misceval.promiseToSuspension(
          io.submit(Sk.ffi.remapToJs(payload)).then(
            (number) => {
              Sk.execStart = Date.now();
              return Sk.ffi.remapToPy(number);
            },
            (error) => {
              throw new Sk.builtin.ValueError(error.message || String(error));
            },
          ),
        ),
      );
      const offset = 0;
      try {
        return await Sk.misceval.asyncToPromise(() =>
          Sk.importMainWithBody("<student>", false, code, true),
        );
      } catch (error) {
        const studentFrame = error.traceback?.find(
          (frame) => frame.filename === "<student>.py" && frame.lineno > offset,
        );
        error.studentLine = studentFrame
          ? studentFrame.lineno - offset
          : undefined;
        throw error;
      }
    },
  };
})(globalThis);
