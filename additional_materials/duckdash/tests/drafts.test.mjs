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
  assert.equal(upgraded[1], stages[0].code);
  assert.equal(upgraded[2], stages[1].starter);
  assert.equal(upgraded[3], old[3]);
  assert.equal(old[1], previousStages[0].code);
});
