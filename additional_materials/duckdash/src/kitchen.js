import { MENU, TOPPINGS } from "./menu.js";
export const FIRST_ORDER_NUMBER = 11;
export const freshKitchen = () => ({
  version: 1,
  nextNumber: FIRST_ORDER_NUMBER,
  orders: [],
});
export function restoreKitchen(raw, now = Date.now()) {
  try {
    const saved = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (
      saved?.version !== 1 ||
      !Array.isArray(saved.orders) ||
      !Number.isSafeInteger(saved.nextNumber)
    )
      return freshKitchen();
    const valid = saved.orders.filter(
      (o) =>
        Number.isSafeInteger(o.number) &&
        Number.isFinite(o.readyAt) &&
        Number.isSafeInteger(o.total) &&
        Array.isArray(o.items) &&
        o.items.length &&
        o.items.every((i) => MENU.some((p) => p.id === i.pizza)) &&
        ["preparing", "ready", "collected"].includes(o.status),
    );
    return advanceKitchen(
      {
        ...saved,
        orders: valid,
        nextNumber: Math.max(
          FIRST_ORDER_NUMBER,
          saved.nextNumber,
          ...valid.map((o) => o.number + 1),
        ),
      },
      now,
    );
  } catch {
    return freshKitchen();
  }
}
export function advanceKitchen(state, now = Date.now()) {
  let changed = false;
  const orders = state.orders.map((o) => {
    if (o.status === "preparing" && o.readyAt <= now) {
      changed = true;
      return { ...o, status: "ready" };
    }
    return o;
  });
  return changed ? { ...state, orders } : state;
}
export function submit(state, request, now = Date.now(), speed = 1) {
  if (!request || typeof request !== "object" || Array.isArray(request))
    throw new Error(
      "send_to_kitchen expects a dictionary returned by make_order, with customer, items and total. Did you forget return?",
    );
  const required = ["customer", "items", "total"];
  const missing = required.filter((key) => !Object.hasOwn(request, key));
  if (missing.length)
    throw new Error(
      "Order details are missing: " +
        missing.join(", ") +
        ". Return customer, items and total from make_order.",
    );
  const unexpected = Object.keys(request).filter(
    (key) => ![...required, "order_number"].includes(key),
  );
  if (unexpected.length)
    throw new Error(
      "Unexpected order fields: " +
        unexpected.join(", ") +
        ". The kitchen expects customer, items, total and optionally order_number.",
    );
  if (
    !Number.isSafeInteger(request.total) ||
    request.total < 0 ||
    request.total > 1000000
  )
    throw new Error(
      "The total must be a whole number of pence from 0 to 1000000. Did your pricing function return a number?",
    );
  if (
    !Array.isArray(request.items) ||
    !request.items.length ||
    request.items.length > 20
  )
    throw new Error("An order needs between 1 and 20 pizzas.");
  const items = request.items.map((raw) => {
    const item = typeof raw === "string" ? { pizza: raw } : raw;
    if (!item || !MENU.some((p) => p.id === item.pizza))
      throw new Error(
        "Unknown pizza. Use an ID from menu_prices, such as classic.",
      );
    const size = item.size ?? "regular",
      toppings = item.toppings ?? [];
    if (!["regular", "large"].includes(size))
      throw new Error("Size must be regular or large.");
    if (!Array.isArray(toppings) || toppings.some((t) => !TOPPINGS.includes(t)))
      throw new Error("Use toppings from the menu.");
    if (toppings.length > 10)
      throw new Error("Choose no more than ten extra toppings per pizza.");
    return { pizza: item.pizza, size, toppings: [...toppings] };
  });
  const number = request.order_number ?? state.nextNumber;
  if (
    !Number.isSafeInteger(number) ||
    number < state.nextNumber ||
    number > 999999
  )
    throw new Error(
      `Order number must be an unused whole number, at least ${state.nextNumber}.`,
    );
  if (typeof request.customer !== "string" || request.customer.length > 60)
    throw new Error("Customer must be a name of at most 60 characters.");
  const seconds = Math.max(
    ...items.map(
      (i) =>
        MENU.find((p) => p.id === i.pizza).seconds +
        (i.size === "large" ? 10 : 0) +
        i.toppings.length * 5,
    ),
  );
  const duration = (seconds * 1000) / ([1, 5, 10].includes(speed) ? speed : 1);
  const order = {
    number,
    customer: request.customer.trim() || "Guest",
    items,
    total: request.total,
    createdAt: now,
    readyAt: now + duration,
    status: "preparing",
  };
  return {
    state: {
      ...state,
      nextNumber: number + 1,
      orders: [...state.orders, order],
    },
    order,
  };
}
export const collect = (state, number) => ({
  ...state,
  orders: state.orders.map((o) =>
    o.number === number && o.status === "ready"
      ? { ...o, status: "collected" }
      : o,
  ),
});
