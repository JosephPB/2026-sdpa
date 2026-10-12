"""Scope, mutation and ticket numbers. App-assigned numbers are authoritative."""
# %% Rebinding a local scalar name.
def discounted(price):
    price -= 100
    return price

price = 800
quote = discounted(price)
print(price, quote)

# %% Mutating a shared object, then rebinding the local name.
def add_cheese(toppings):
    toppings.append("extra cheese")
    toppings = []

chosen = ["olives"]
result = add_cheese(chosen)
print(chosen, result)

# %% Reading a global name is different from assigning it.
def show_price():
    print(price)

def change_price():
    price += 100  # UnboundLocalError if called

show_price()
# change_price()

# %% Each invocation has its own local names.
def next_order_number(previous):
    return previous + 1

def make_ticket(previous, price):
    number = next_order_number(previous)
    return number, price

last_number = 10  # An illustrative terminal counter, not the live app's state.
number, total = make_ticket(last_number, 800)
last_number = number
print(number, total)
print(next_order_number(last_number))
