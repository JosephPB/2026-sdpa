export const MENU = [
  {
    id: "classic",
    name: "The Classic Quack",
    description: "Tomato, mozzarella and basil. A pond favourite.",
    price: 800,
    seconds: 25,
    vegetarian: true,
    tag: "The original",
  },
  {
    id: "pepperoni",
    name: "Pepperoni Paddle",
    description: "Tomato, mozzarella and a generous paddle of pepperoni.",
    price: 1000,
    seconds: 40,
    vegetarian: false,
    tag: "Crowd favourite",
  },
  {
    id: "garden",
    name: "Garden Waddle",
    description: "Tomato, mozzarella, mushrooms, olives and sweetcorn.",
    price: 900,
    seconds: 35,
    vegetarian: true,
    tag: "Veggie",
  },
  {
    id: "spicy",
    name: "Hot Duck Summer",
    description: "Jalapeños, peppers, chilli flakes and mozzarella.",
    price: 1100,
    seconds: 50,
    vegetarian: true,
    tag: "A little heat",
  },
  {
    id: "pesto",
    name: "Pondside Pesto",
    description: "Basil pesto, cherry tomatoes, red onion and mozzarella.",
    price: 1000,
    seconds: 45,
    vegetarian: true,
    tag: "Green favourite",
  },
  {
    id: "cheese",
    name: "Four Cheese Float",
    description: "Mozzarella, cheddar, vegetarian hard cheese and blue cheese.",
    price: 1200,
    seconds: 55,
    vegetarian: true,
    tag: "Extra cheesy",
  },
];
export const TOPPINGS = ["olives", "mushrooms", "sweetcorn", "extra cheese"];
export const money = (pence) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    pence / 100,
  );
export function normalPrice(item) {
  return (
    MENU.find((p) => p.id === item.pizza).price +
    (item.size === "large" ? 200 : 0) +
    (item.toppings?.length || 0) * 100
  );
}
export function discountPrice(subtotal, student = false, coupon = "") {
  const reductions = [0];
  if (student) reductions.push(Math.floor((subtotal * 20 + 50) / 100));
  if (coupon.toUpperCase() === "DUCK10")
    reductions.push(Math.floor((subtotal * 10 + 50) / 100));
  if (coupon.toUpperCase() === "FLOCK5" && subtotal >= 2000)
    reductions.push(500);
  return subtotal - Math.max(...reductions);
}
