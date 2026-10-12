"""Function definitions, calls and return values. Prices are pence."""
# %% Define once, call twice.
menu_prices = {"classic": 800, "pepperoni": 1000}

def pizza_price(pizza):
    """Return a regular pizza's price in pence."""
    price = menu_prices[pizza]
    return price

first = pizza_price("classic")
second = pizza_price("pepperoni")
print(first, second)

# %% Intentional mistake: output does not become the return value.
def broken_price():
    print(800)

total = broken_price()
print(total)
# Uncomment to demonstrate the error; then fix the function.
# print(total + 100)

# %% Return ends this invocation.
def quote(student):
    if student:
        return 640
    return 800
    print("Unreachable")

print(quote(True), quote(False))

# %% A returned dictionary is the input to the next function
def make_order(pizza, customer):
    return {"customer": customer, "items": [pizza],
            "total": pizza_price(pizza)}

returned_details = make_order("classic", "Sam")
print(returned_details)
# In DuckDash, the explicit next call is:
# number = send_to_kitchen(returned_details)
# The IDE has no live kitchen connection; inspect the dictionary here.
