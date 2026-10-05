# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 48: Explain it to the duck: the backup
route = ["A", "B", "C"]
backup = route
route.pop()
print(backup)

# %% Slide 49: Explain it to the duck: the return value
stops = ["A", "B"]
result = stops.append("C")
print(stops)
print(result)

# %% Slide 50: Explain it to the duck: missing deliveries
required = {"A", "B", "C", "D"}
visited = {"A", "C", "E"}
missing = required - visited
print(missing)

# %% Slide 53: Reference: copying and mutation
route = ["A", "B", "C", "D"]
for stop in route.copy():
    if stop in ["A", "B"]:
        route.remove(stop)
print(route)

# %% Slide 53: Reference: copying and mutation
route = ["A", "B", "C", "D"]
route = [stop for stop in route
         if stop not in ["A", "B"]]
print(route)

# %% Slide 54: Reference: dictionaries
by_key = {42: "A", 2.5: "B",
          True: "C"}
print(by_key[42], by_key[2.5],
      by_key[True])
by_position = {(0, 0): "A"}
print(by_position[(0, 0)])

# %% Slide 55: Reference: nesting collections
records = [{"stop": "A", "ducks": 2},
           {"stop": "B", "ducks": 1}]
print(records[1]["ducks"])

# %% Slide 55: Reference: nesting collections
delivery = {
    "stops": ["A", "C", "B"],
    "courier": {"name": "Duck"}
}
print(delivery["stops"][-1])
print(delivery["courier"]["name"])

# %% Slide 57: Reference: distance from coordinates
A, B, C, D = (0, 0), (4, 0), (4, 3), (0, 3)
route = [A, C, B, D]
closed = route + [route[0]]
total = 0
for i in range(len(closed) - 1):
    x1, y1 = closed[i]
    x2, y2 = closed[i + 1]
    total += ((x2 - x1)**2 + (y2 - y1)**2)**0.5
print(total)
