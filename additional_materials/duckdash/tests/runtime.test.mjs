import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { stages } from "../src/examples.js";
import { MENU } from "../src/menu.js";
import { freshKitchen, submit } from "../src/kitchen.js";
async function execute(code, order = {}) {
  const sandbox = vm.createContext({ console, setTimeout, clearTimeout });
  for (const path of [
    "public/vendor/skulpt.min.js",
    "public/vendor/skulpt-stdlib.js",
    "public/python-runtime.js",
  ])
    vm.runInContext(
      readFileSync(new URL("../" + path, import.meta.url), "utf8"),
      sandbox,
    );
  let state = freshKitchen(),
    output = "";
  await sandbox.DuckDashPython.run(code, {
    context: {
      order: {
        customer: "Sam",
        pizza: "classic",
        size: "regular",
        toppings: [],
        student: false,
        coupon: "",
        quantity: 1,
        ...order,
      },
      menu_prices: Object.fromEntries(MENU.map((p) => [p.id, p.price])),
      menu_names: Object.fromEntries(MENU.map((p) => [p.id, p.name])),
      vegetarian: MENU.filter((p) => p.vegetarian).map((p) => p.id),
      last_order_number: 100,
      orders: [],
    },
    output: (text) => (output += text),
    submit: async (request) => {
      const result = submit(state, request, 0);
      state = result.state;
      return result.order.number;
    },
  });
  return { state, output };
}
for (const stage of stages)
  test(`worked example ${stage.id}: ${stage.title}`, async () => {
    const result = await execute(stage.code);
    assert.equal(result.state.orders.length, stage.id === 6 ? 3 : 1);
    assert.equal(result.state.orders[0].number, 101);
    if (stage.id === 5) assert.equal(result.state.orders[0].total, 2700);
  });
test("keyword/default arguments and discount do real Python computation", async () => {
  const result = await execute(stages[2].code, {
    pizza: "pepperoni",
    size: "large",
    toppings: ["olives"],
    student: true,
    coupon: "DUCK10",
  });
  assert.equal(result.state.orders[0].total, 1040);
});
test("print cannot create an order; None is rejected as a price", async () => {
  const result = await execute("print(101)");
  assert.equal(result.state.orders.length, 0);
  assert.equal(result.output, "101\n");
  await assert.rejects(
    execute('def price():\n    print(800)\nsubmit_order("classic", price())'),
    /whole number/,
  );
});
test("duplicate custom tickets are rejected", async () => {
  await assert.rejects(
    execute(
      'submit_order("classic",800,order_number=101)\nsubmit_order("classic",800,order_number=101)',
    ),
    /at least 102/,
  );
});
test("Python syntax errors and scope errors are preserved", async () => {
  await assert.rejects(execute("if True\n    print(1)"), /SyntaxError/);
  await assert.rejects(
    execute("x = 3\ndef f():\n    x += 1\nf()"),
    /UnboundLocalError/,
  );
});
test("args, kwargs, enumerating sets, map, filter and multiple iterables", async () => {
  const { output } = await execute(
    'def receipt(size, *extras, **details):\n    return size, extras, details["customer"]\nprint(receipt(12, "olives", customer="Jo"))\nprint(list(map(pow,[2,3],[3])))\nprint(list(filter(lambda x: x > 2,[1,3,4])))\nprint(list(enumerate(sorted({"C","A","A"}),start=1)))',
  );
  assert.match(output, /\[8\]/);
  assert.match(output, /\[3, 4\]/);
  assert.match(output, /\(1, 'A'\)/);
});

test("the kitchen uses the returned dictionary, not input globals or printed output", async () => {
  const result = await execute(`def price():
    return 725

def make_order():
    return {"customer": "Returned customer", "items": ["garden"], "total": price()}

receipt = make_order()
print("classic", 9999)
number = send_to_kitchen(receipt)
print(number)`);
  assert.equal(result.state.orders[0].customer, "Returned customer");
  assert.equal(result.state.orders[0].items[0].pizza, "garden");
  assert.equal(result.state.orders[0].total, 725);
  assert.match(result.output, /101/);
});
test("building and printing an order does not send it", async () => {
  const result = await execute(
    'def make_order():\n    return {"customer":"Sam","items":["classic"],"total":800}\ndetails = make_order()\nprint(details)',
  );
  assert.equal(result.state.orders.length, 0);
});
test("missing return and missing fields give useful contract errors", async () => {
  await assert.rejects(
    execute("def make_order():\n    print(800)\nsend_to_kitchen(make_order())"),
    /forget return/,
  );
  await assert.rejects(
    execute('send_to_kitchen({"customer":"Sam","items":["classic"]})'),
    /missing: total/,
  );
  await assert.rejects(
    execute(
      'send_to_kitchen({"customer":"Sam","items":["classic"],"total":800,"price":800})',
    ),
    /Unexpected order fields: price/,
  );
});

test("kitchen validation points to the student call, not the hidden bridge", async () => {
  await assert.rejects(
    execute(
      "def make_order():\n    print(800)\n\nsend_to_kitchen(make_order())",
    ),
    (error) => {
      assert.equal(error.studentLine, 4);
      return true;
    },
  );
});
