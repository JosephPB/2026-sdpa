import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshKitchen,
  submit,
  advanceKitchen,
  restoreKitchen,
  collect,
} from "../src/kitchen.js";
import { discountPrice, normalPrice } from "../src/menu.js";
const req = (pizza = "classic", total = 800) => ({
  items: [pizza],
  total,
  customer: "Sam",
});
test("tickets stay unique across a burst and restoration", () => {
  let state = freshKitchen();
  for (let i = 0; i < 5; i++) state = submit(state, req(), 1000).state;
  assert.deepEqual(
    state.orders.map((o) => o.number),
    [101, 102, 103, 104, 105],
  );
  assert.equal(restoreKitchen(JSON.stringify(state), 1000).nextNumber, 106);
  assert.throws(
    () => submit(state, { ...req(), order_number: 101 }),
    /at least 106/,
  );
});
test("different pizzas finish independently; refresh catches up", () => {
  let state = submit(freshKitchen(), req(), 0).state;
  state = submit(state, req("spicy", 1100), 0).state;
  state = advanceKitchen(state, 26000);
  assert.deepEqual(
    state.orders.map((o) => o.status),
    ["ready", "preparing"],
  );
  state = restoreKitchen(state, 51000);
  assert.deepEqual(
    state.orders.map((o) => o.status),
    ["ready", "ready"],
  );
  assert.equal(collect(state, 101).orders[0].status, "collected");
});
test("charged price is supplied by the learner, including incorrect zero", () => {
  const { order } = submit(freshKitchen(), req("pepperoni", 0), 0);
  assert.equal(order.total, 0);
  assert.throws(
    () => submit(freshKitchen(), req("classic", null)),
    /whole number/,
  );
  assert.throws(
    () => submit(freshKitchen(), req("classic", 800.5)),
    /whole number/,
  );
});
test("invalid input never takes a ticket", () => {
  const state = freshKitchen();
  for (const request of [
    { ...req(), items: ["unknown"] },
    { ...req(), items: [] },
    { ...req(), order_number: 100 },
    { ...req(), items: [{ pizza: "classic", toppings: ["unlisted"] }] },
    { ...req(), total: -1 },
  ])
    assert.throws(() => submit(state, request));
  assert.equal(state.nextNumber, 101);
  assert.equal(state.orders.length, 0);
});
test("large and toppings alter prep time; speed applies at submission", () => {
  const a = submit(
    freshKitchen(),
    {
      ...req(),
      items: [{ pizza: "classic", size: "large", toppings: ["olives"] }],
    },
    0,
    5,
  ).order;
  assert.equal(a.readyAt, 8000);
  const b = submit(
    freshKitchen(),
    { ...req(), items: ["classic", "spicy"] },
    0,
  ).order;
  assert.equal(b.readyAt, 50000);
});
test("discounts use best eligible deal, without stacking", () => {
  assert.equal(discountPrice(1000, true, "DUCK10"), 800);
  assert.equal(discountPrice(1900, false, "FLOCK5"), 1900);
  assert.equal(discountPrice(2000, true, "FLOCK5"), 1500);
  assert.equal(discountPrice(3000, true, "FLOCK5"), 2400);
  assert.equal(
    normalPrice({ pizza: "classic", size: "large", toppings: ["olives"] }),
    1100,
  );
});
