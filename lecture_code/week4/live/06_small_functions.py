"""Function values, lambda, map, filter, key and comprehensions."""
# %% A function value and a call are different.
def student_price(price):
    return price * 80 // 100

rule = student_price
print(rule(1000))

# %% Map yields results when its iterator is consumed.
prices = [800, 1000, 900]
results = map(student_price, prices)
print(list(results))
print(list(results))  # Already consumed.
print(list(map(lambda price: price * 80 // 100, prices)))
print(list(map(lambda p, q: p * q, prices, [2, 1])))

# %% Filter retains original qualifying elements.
print(list(filter(lambda price: price <= 900, prices)))
words = ["Alpaca", "SDPA", "", "apple"]
print(list(filter(lambda word: word.lower().startswith("a"), words)))

# %% Key functions select a comparison value.
orders = [(13, 900), (11, 1200), (12, 800)]
print(sorted(orders, key=lambda order: order[1]))
print(max(orders, key=lambda order: order[1]))

# %% Comprehensions express the same operations.
print([price * 80 // 100 for price in prices])
print([price for price in prices if price <= 900])
menu = {"classic": 800, "pepperoni": 1000}
print({pizza: price * 80 // 100 for pizza, price in menu.items()})
print([(pizza, size) for pizza in ["classic", "garden"]
       for size in ["regular", "large"]])
