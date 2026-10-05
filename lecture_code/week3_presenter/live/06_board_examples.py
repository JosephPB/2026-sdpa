# SDPA week 3: Python equivalents of the whiteboard demonstrations.
# Each # %% section is independent.

# %% Assignment and rebinding
x = 4
y = x
x = 7
print(x, y)

# %% Two names for one route
route = ["A", "C", "B", "D"]
trial = route
trial[1], trial[2] = trial[2], trial[1]
print(route, trial)

# %% A copied route
route = ["A", "C", "B", "D"]
trial = route.copy()
trial[1], trial[2] = trial[2], trial[1]
print(route, trial)

# %% A shallow nested copy
groups = [["A", "B"], ["C"]]
trial = groups.copy()
trial[0].append("D")
print(groups, trial)

# %% Append, extend and concatenate from separate starting lists
a = ["A", "B"]
result = a.append(["C", "D"])
print(a, result)
b = ["A", "B"]
result = b.extend(["C", "D"])
print(b, result)
c = ["A", "B"]
result = c + ["C", "D"]
print(c, result)

# %% Removal by index and by value
route = ["A", "B", "C", "B"]
removed = route.pop(2)
print(route, removed)
route = ["A", "B", "C", "B"]
result = route.remove("B")
print(route, result)

# %% A mutation bug, then its repair
route = ["A", "B", "C", "D"]
for stop in route:
    if stop in ["A", "B"]:
        route.remove(stop)
print(route)  # B survives
route = ["A", "B", "C", "D"]
for stop in route.copy():
    if stop in ["A", "B"]:
        route.remove(stop)
print(route)

# %% Sets: printed order can vary
required = {"A", "B", "C", "D"}
visited = {"A", "C", "E"}
print(required - visited)
print(required & visited)
print(required | visited)
print(required ^ visited)
