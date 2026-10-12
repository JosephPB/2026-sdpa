import { test } from "node:test";
import assert from "node:assert/strict";
import { exampleCode, syncInputs, syncOrderNumber } from "../src/inputs.js";
test("counter updates only the visible input block, preserving custom functions and prices", () => {
  const original =
    exampleCode(3, "code").replace('"classic": 800', '"classic": 750') +
    "\n# custom lesson";
  const updated = syncInputs(original, 3, {
    customer: "Sam $&",
    pizza: "garden",
    size: "large",
    toppings: ["olives"],
    student: true,
    quantity: 2,
  });
  assert.match(updated, /"classic": 750/);
  assert.match(updated, /"customer": "Sam \$&"/);
  assert.match(updated, /"quantity": 2/);
  assert.ok(updated.endsWith("# custom lesson"));
  assert.equal(
    updated.split("# End counter inputs")[1],
    original.split("# End counter inputs")[1],
  );
});
test("accepted tickets update only the counter, preserving manually edited customer literals", () => {
  const original = exampleCode(4, "code").replace(
    '"Guest"',
    '"Edited by hand"',
  );
  const updated = syncOrderNumber(original, 11);
  assert.equal(
    updated,
    original.replace("last_order_number = 10", "last_order_number = 11"),
  );
});
test("simpler stages discard hidden advanced choices in their visible input literals", () => {
  const code = exampleCode(1, "code", {
    pizza: "garden",
    size: "large",
    student: true,
  });
  assert.match(code, /"pizza": "classic"/);
  assert.doesNotMatch(code, /"large"|"student"/);
  assert.equal(syncInputs("print(42)", 1, {}), "print(42)");
});
