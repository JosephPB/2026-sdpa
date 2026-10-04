# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 36: Explain it to the duck: the backup
route = ["A", "B", "C"]
backup = route
route.pop()
print(backup)

# %% Slide 37: Explain it to the duck: the return value
stops = ["A", "B"]
result = stops.append("C")
print(stops)
print(result)

# %% Slide 38: Explain it to the duck: missing deliveries
required = {"A", "B", "C", "D"}
visited = {"A", "C", "E"}
missing = required - visited
print(missing)

# %% Slide 41: Reference: copying and mutation
route = ["A", "B", "C", "D"]
for stop in route.copy():
    if stop in ["A", "B"]:
        route.remove(stop)
print(route)

# %% Slide 41: Reference: copying and mutation
route = ["A", "B", "C", "D"]
route = [stop for stop in route
         if stop not in ["A", "B"]]
print(route)

# %% Slide 42: Reference: dictionaries
a = {"A": 2, "B": 1}
b = dict(A=2, B=1)
c = dict([("A", 2), ("B", 1)])
print(a == b == c)
by_position = {(0, 0): "A"}
print(by_position[(0, 0)])

# %% Slide 44: Reference: distance from coordinates
A, B, C, D = (0, 0), (4, 0), (4, 3), (0, 3)
route = [A, C, B, D]
closed = route + [route[0]]
total = 0
for i in range(len(closed) - 1):
    x1, y1 = closed[i]
    x2, y2 = closed[i + 1]
    total += ((x2 - x1)**2 + (y2 - y1)**2)**0.5
print(total)
