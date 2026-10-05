# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 39: Sets
fav_animals = {'Alpaca', 'Kangaroo', 'Koala'}

# %% Slide 40: Sets record distinct locations
route = ["A", "B", "A", "C"]
visited = set(route)
print(len(route), len(visited))
print("B" in visited)
print(type(set()), type({}))

# %% Slide 41: Set membership check
visited = {"A", "B", "A"}
visited.add("B")
print(len(visited))
print("C" in visited)

# %% Slide 43: Looping through dictionary items
deliveries = {
    "A": {"position": (0, 0), "ducks": 2},
    "B": {"position": (4, 0), "ducks": 1}
}
for name, record in deliveries.items():
    print(name, record["ducks"])

# %% Slide 45: Pairing sequences with zip
stops = ["A", "B", "C"]
quantities = [2, 1]
for stop, quantity in zip(stops, quantities):
    print(stop, quantity)

# %% Slide 46: Numbering stops with enumerate
route = ["A", "C", "B", "D"]
for index, stop in enumerate(route):
    print(index, stop)

# %% Slide 46: Numbering stops with enumerate
route = ["A", "C", "B", "D"]
for visit, stop in enumerate(route, start=1):
    print(visit, stop)
