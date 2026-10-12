"""Arguments, defaults, arbitrary arguments and tuple returns."""
# %% Positional and keyword calls.
def pizza_price(pizza, size="regular"):
    price = {"classic": 800, "pepperoni": 1000}[pizza]
    if size == "large":
        price += 200
    return price

print(pizza_price("classic"))
print(pizza_price("classic", size="large"))
print(pizza_price(size="large", pizza="classic"))
# Syntax error to discuss, then type separately:
# pizza_price(pizza="classic", "large")

# %% Extra positional arguments become a tuple.
def make_pizza(size, *toppings):
    return size, toppings

size, toppings = make_pizza(12, "olives", "mushrooms")
print(size, toppings)

# %% Extra keyword arguments become a dictionary.
def ticket(pizza, **details):
    return pizza, details

print(ticket("classic", customer="Sam", student=True))

# %% Lists are ordinary arguments too; avoid a mutable default list.
def extras_price(toppings=None):
    if toppings is None:
        toppings = []
    return 100 * len(toppings)

print(extras_price(["olives", "sweetcorn"]))
