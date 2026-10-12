import { MENU } from "./menu.js";
import { stages } from "./examples.js";
import { pythonValue } from "./format-details.js";
export const DEFAULT_ORDER = {
  customer: "Guest",
  pizza: "classic",
  size: "regular",
  toppings: [],
  student: false,
  coupon: "",
  quantity: 1,
};
export function effectiveChoices(stage, input) {
  const order = { ...DEFAULT_ORDER, ...input };
  if (stage !== 2 && stage !== 3)
    Object.assign(order, { size: "regular", toppings: [] });
  if (stage !== 3)
    Object.assign(order, { student: false, coupon: "", quantity: 1 });
  if (stage === 1 && !["classic", "pepperoni"].includes(order.pizza))
    order.pizza = "classic";
  return order;
}
const block = /# Counter inputs\n[\s\S]*?# End counter inputs/;
export function counterInputs(stage, input, previousNumber = 10) {
  const order = effectiveChoices(stage, input);
  const keys = stage === 5 ? ["customer"] : ["customer", "pizza"];
  if (stage === 2 || stage === 3) keys.push("size", "toppings");
  if (stage === 3) keys.push("quantity", "student", "coupon");
  let text =
    "# Counter inputs\norder = " +
    pythonValue(Object.fromEntries(keys.map((key) => [key, order[key]])));
  if (stage === 4) text += "\nlast_order_number = " + previousNumber;
  return text + "\n# End counter inputs";
}
export function syncInputs(code, stage, input, previousNumber = 10) {
  return code.replace(block, () => counterInputs(stage, input, previousNumber));
}
export function syncOrderNumber(code, previousNumber) {
  return code.replace(block, (text) =>
    text.replace(
      /^last_order_number = .*$/m,
      () => "last_order_number = " + previousNumber,
    ),
  );
}
export function exampleCode(
  stage,
  kind,
  input = DEFAULT_ORDER,
  previousNumber = 10,
) {
  return syncInputs(stages[stage - 1][kind], stage, input, previousNumber);
}
// Keep a custom program's logic while making any old supplied bindings visible.
export function declareLegacyInputs(
  code,
  stage,
  input,
  previousNumber = 10,
  tickets = [],
) {
  const definitions = {
    menu_prices: Object.fromEntries(MENU.map((p) => [p.id, p.price])),
    menu_names: Object.fromEntries(MENU.map((p) => [p.id, p.name])),
    vegetarian: MENU.filter((p) => p.vegetarian).map((p) => p.id),
    order: effectiveChoices(stage, input),
    last_order_number: previousNumber,
    orders: tickets,
  };
  const prefix = [];
  for (const name of ["send_to_kitchen", "submit_order", "submit_basket"]) {
    if (
      new RegExp("\\b" + name + "\\b").test(code) &&
      !new RegExp(
        "^(?:def " + name + "\\b|from duckdash import .*\\b" + name + "\\b)",
        "m",
      ).test(code)
    )
      prefix.push("from duckdash import " + name);
  }
  for (const [name, value] of Object.entries(definitions)) {
    if (
      new RegExp("\\b" + name + "\\b").test(code) &&
      !new RegExp("^" + name + "\\s*=", "m").test(code)
    )
      prefix.push(name + " = " + pythonValue(value));
  }
  return prefix.length ? prefix.join("\n") + "\n\n" + code : code;
}
