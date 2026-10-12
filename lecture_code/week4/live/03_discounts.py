"""Complete DuckDash pricing. Whole pence, best single eligible discount."""
MENU = {"classic": 800, "pepperoni": 1000, "garden": 900,
        "spicy": 1100, "pesto": 1000, "cheese": 1200}

def pizza_price(pizza, size="regular", toppings=None):
    if toppings is None:
        toppings = []
    price = MENU[pizza]
    if size == "large":
        price += 200
    return price + 100 * len(toppings)

def discounted(price, student=False, coupon=""):
    savings = [0]
    if student:
        savings.append((price * 20 + 50) // 100)
    if coupon.upper() == "DUCK10":
        savings.append((price * 10 + 50) // 100)
    if coupon.upper() == "FLOCK5" and price >= 2000:
        savings.append(500)
    return price - max(savings)

if __name__ == "__main__":
    subtotal = pizza_price("pepperoni", "large", ["olives"])
    total = discounted(subtotal, student=True, coupon="DUCK10")
    print("Subtotal:", subtotal, "pence")
    print("Total:", total, "pence")
    print("Enter in DuckDash's IDE-price drawer: £{:.2f}".format(total / 100))
    basket = pizza_price("classic") + pizza_price("cheese")
    print("Group with FLOCK5:", discounted(basket, coupon="FLOCK5"))
