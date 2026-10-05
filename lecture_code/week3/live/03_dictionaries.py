# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 30: Looking up a stop by name
names = ["A", "B", "C"]
positions = [(0, 0), (4, 0), (4, 3)]
print(positions[names.index("B")])

# %% Slide 30: Looking up a stop by name
locations = {"A": (0, 0),
             "B": (4, 0),
             "C": (4, 3)}
print(locations["B"])

print(type(locations))

# %% Slide 31: Three ways to create a dictionary
literal = {"A": (0, 0), "B": (4, 0)}
keywords = dict(A=(0, 0), B=(4, 0))
pairs = dict([("A", (0, 0)), ("B", (4, 0))])
print(literal == keywords == pairs)

# %% Slide 32: Creating and changing dictionaries
stock = {"A": 2, "B": 1}
print(stock["A"])
stock["B"] = 3
stock["C"] = 1
print(stock)
print(stock.get("D", 0))
print("D" in stock)

# %% Slide 33: Keys, values and membership
stock = {"A": 2, "B": 0}
print("B" in stock)
print(2 in stock)
print(2 in stock.values())

# %% Slide 33: Keys, values and membership
stock = {"A": 2, "B": 0}
print(list(stock.keys()))
print(list(stock.items()))
removed = stock.pop("B")
del stock["A"]
print(removed, stock)

# %% Slide 36: Nested dictionaries
deliveries = {
    "A": {"position": (0, 0), "ducks": 2},
    "B": {"position": (4, 0), "ducks": 1}
}
print(deliveries["B"]["position"])
deliveries["B"]["ducks"] += 1
print(deliveries["B"])

# %% Slide 37: Unpacking dictionaries
x, y = (4, 3)
first, second = ["A", "B"]
letter1, letter2 = "AB"
stock = {"A": 2, "B": 1}
a, b = stock
q1, q2 = stock.values()
item1, item2 = stock.items()
print(a, b)
print(q1, q2)
print(item1, item2)

# %% Slide 38: Merging dictionaries
stock = {"A": 2, "B": 1}
changes = {"B": 3, "C": 1}
combined = {**stock, **changes}
print(combined)

# %% Slide 38: Merging dictionaries
stock = {"A": 2, "B": 1}
changes = {"B": 3, "C": 1}
combined = stock.copy()
combined.update(changes)
print(combined)
