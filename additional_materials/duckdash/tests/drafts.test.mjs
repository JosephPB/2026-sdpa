import { test } from "node:test";
import assert from "node:assert/strict";
import { upgradeDrafts } from "../src/drafts.js";
import { previousStages } from "../src/previous-examples.js";
import { stages } from "../src/examples.js";
test("untouched examples migrate while custom teaching code is preserved", () => {
  const old = {
    1: previousStages[0].code,
    2: previousStages[1].starter.replace(/\n\n/g, "\n\n\n"),
    3: 'print("my own example")',
  };
  const upgraded = upgradeDrafts(old);
  assert.equal(upgraded[1], exampleCode(1, "code"));
  assert.equal(upgraded[2], exampleCode(2, "starter"));
  assert.equal(upgraded[3], old[3]);
  assert.equal(old[1], previousStages[0].code);
});

import { returnStages } from "../src/previous-return-examples.js";
import { exampleCode } from "../src/inputs.js";
test("returned-order drafts migrate with current visible inputs and counter", () => {
  const saved = { 4: returnStages[3].code };
  const upgraded = upgradeDrafts(
    saved,
    { customer: "Jo", pizza: "garden" },
    17,
  );
  assert.equal(
    upgraded[4],
    exampleCode(4, "code", { customer: "Jo", pizza: "garden" }, 17),
  );
});
test("custom legacy logic retains its body with missing bindings declared", () => {
  const body =
    'total = menu_prices[order["pizza"]] - 50\nsubmit_order(order["pizza"], total)';
  const code = upgradeDrafts({ 1: body })[1];
  assert.ok(code.endsWith(body));
  assert.match(code, /from duckdash import submit_order/);
  assert.match(code, /menu_prices = /);
  assert.match(code, /order = /);
  assert.equal(upgradeDrafts({ 1: code })[1], code);
});
