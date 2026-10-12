const send = `\nnumber = submit_order(order["pizza"], total,\n    customer=order["customer"], size=order["size"],\n    toppings=order["toppings"], quantity=order["quantity"])\nprint("Order", number, "sent to the kitchen")`;
export const previousStages = [
  {
    id: 1,
    title: "The first order",
    topic: "Define · call · return",
    brief: "Take an order, calculate a price, then send it to the kitchen.",
    code: `def pizza_price(pizza):\n    return menu_prices[pizza]\n\ntotal = pizza_price(order["pizza"])\nprint("Price in pence:", total)${send}`,
    starter: `# Write your pricing function here.\n# menu_prices holds prices in pence.\n\ndef pizza_price(pizza):\n    return 800\n\ntotal = pizza_price(order["pizza"])${send}`,
  },
  {
    id: 2,
    title: "Make it yours",
    topic: "Arguments · defaults · toppings",
    brief: "Regular or large? Extra toppings? The customer can now choose.",
    code: `def pizza_price(pizza, size="regular", toppings=None):\n    if toppings is None:\n        toppings = []\n    price = menu_prices[pizza]\n    if size == "large":\n        price += 200\n    return price + 100 * len(toppings)\n\ntotal = pizza_price(order["pizza"],\n    size=order["size"], toppings=order["toppings"])\nprint("Price in pence:", total)${send}`,
    starter: `def pizza_price(pizza, size="regular", toppings=None):\n    # Add the large-size charge and extra toppings.\n    return menu_prices[pizza]\n\ntotal = pizza_price(order["pizza"],\n    size=order["size"], toppings=order["toppings"])${send}`,
  },
  {
    id: 3,
    title: "Student specials",
    topic: "Decomposition · discounts",
    brief:
      "Use the best eligible discount. Student deals and coupons do not stack.",
    code: `def subtotal(pizza, size, toppings):\n    price = menu_prices[pizza]\n    if size == "large":\n        price += 200\n    return price + 100 * len(toppings)\n\ndef discounted(price, student=False, coupon=""):\n    savings = [0]\n    if student:\n        savings.append((price * 20 + 50) // 100)\n    if coupon.upper() == "DUCK10":\n        savings.append((price * 10 + 50) // 100)\n    if coupon.upper() == "FLOCK5" and price >= 2000:\n        savings.append(500)\n    return price - max(savings)\n\nprice = subtotal(order["pizza"], order["size"], order["toppings"])\ntotal = discounted(price * order["quantity"], order["student"], order["coupon"])\nprint("Price in pence:", total)${send}`,
    starter: `def discounted(price, student=False, coupon=""):\n    # Return the price after the best eligible discount.\n    return price\n\nprice = menu_prices[order["pizza"]]\ntotal = discounted(price * order["quantity"], order["student"], order["coupon"])${send}`,
  },
  {
    id: 4,
    title: "A duck with a number",
    topic: "Local scope · returned values",
    brief:
      "Generate the next order number, then write it underneath the customer’s rubber duck.",
    code: `def next_order_number(previous):\n    return previous + 1\n\ndef make_ticket(pizza, previous):\n    number = next_order_number(previous)\n    price = menu_prices[pizza]\n    return number, price\n\nnumber, total = make_ticket(order["pizza"], last_order_number)\naccepted = submit_order(order["pizza"], total,\n    customer=order["customer"], order_number=number)\nprint("Write", accepted, "under the rubber duck")`,
    starter: `def next_order_number(previous):\n    # Update this function so numbers increase.\n    return previous\n\nnumber = next_order_number(last_order_number)\nsubmit_order(order["pizza"], menu_prices[order["pizza"]],\n    customer=order["customer"], order_number=number)`,
  },
  {
    id: 5,
    title: "The group order",
    topic: "Recursion · base cases",
    brief:
      "A group orders three pizzas. Total the prices one smaller basket at a time.",
    code: `def basket_total(prices):\n    if prices == []:\n        return 0\n    return prices[0] + basket_total(prices[1:])\n\npizzas = ["classic", "pepperoni", "garden"]\nprices = [menu_prices[pizza] for pizza in pizzas]\ntotal = basket_total(prices)\nprint("Group price in pence:", total)\nnumber = submit_basket(pizzas, total, customer=order["customer"])\nprint("Group order", number)`,
    starter: `def basket_total(prices):\n    # What is the base case?\n    # What smaller problem can you ask this function to solve?\n    return 0\n\npizzas = ["classic", "pepperoni", "garden"]\ntotal = basket_total([menu_prices[p] for p in pizzas])\nsubmit_basket(pizzas, total, customer=order["customer"])`,
  },
  {
    id: 6,
    title: "The lunch rush",
    topic: "Lambda · map · filter · comprehensions",
    brief:
      "Process several requests with small functions. The kitchen keeps working between runs.",
    code: `requests = [\n    {"customer": "Sam", "pizza": "classic"},\n    {"customer": "Alex", "pizza": "pepperoni"},\n    {"customer": "Jo", "pizza": "garden"}\n]\nprices = list(map(lambda r: menu_prices[r["pizza"]], requests))\nveggie = list(filter(lambda r: r["pizza"] in vegetarian, requests))\nranked = sorted(requests, key=lambda r: menu_prices[r["pizza"]])\nprint("Prices:", prices)\nprint("Vegetarian requests:", veggie)\nprint("Cheapest first:", ranked)\n\nfor request in requests:\n    number = submit_order(request["pizza"],\n        menu_prices[request["pizza"]], customer=request["customer"])\n    print(request["customer"], "has order", number)`,
    starter: `requests = ["classic", "pepperoni", "garden"]\n# Build a list of prices. Filter the vegetarian pizzas.\n# Then submit one order for each pizza.\nprint(requests)`,
  },
];
