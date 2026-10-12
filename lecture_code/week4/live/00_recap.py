"""Week 4 recap. Each # %% block is an IDE cell."""
# %% Sets retain distinct choices, not duplicate portions.
requested = {"olives", "mushrooms"}
available = {"olives", "sweetcorn"}
print("Can supply:", requested & available)
print("Missing:", requested - available)
print("Combined:", requested | available)
print("Either, but not both:", requested ^ available)
print("Everything available?", requested <= available)
available.add("mushrooms")
available.add("olives")
available.discard("pineapple")
print(len(available))

# %% Enumerate provides index and element; default start is zero.
customers = ["Sam", "Alex", "Jo"]
for position, customer in enumerate(customers, start=1):
    print(position, customer)
customers.pop(0)
for position, customer in enumerate(customers, start=1):
    print(position, customer)
# Positions changed. Permanent order IDs should not be assigned this way.

# %% Deterministic enumeration of a set.
for number, topping in enumerate(sorted(available), start=1):
    print(number, topping)
