# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 13: Lists
A, B, C, D = (0, 0), (4, 0), (4, 3), (0, 3)
route = [A, C, B, D]
print(route[1])
print(route[-1])
print(route[1:3])
route[1], route[2] = route[2], route[1]
print(route)

# %% Slide 15: Iterating through a route
route = ["A", "C", "B", "D"]
for stop in route:
    print(stop)
for i in range(len(route)):
    print(i, route[i])

# %% Slide 15: Iterating through a route
legs = [5, 3, 5, 3]
total = 0
for distance in legs:
    total += distance
print(total)

# %% Slide 19: Ordering and method results
legs = [5, 3, 5, 3]
ordered = sorted(legs)
print(ordered)
print(legs)
result = legs.sort()
print(legs, result)

# %% Slide 19: Ordering and method results
stops = ["A", "B", "C", "A"]
stops.reverse()
print(stops.count("A"))

# %% Slide 20: List comprehensions
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
print(squares)

# %% Slide 20: List comprehensions
squares = [x ** 2 for x in range(1, 6)]
print(squares)
long_legs = [d for d in [5, 3, 5, 3]
             if d > 3]
print(long_legs)

# %% Slide 22: Copying a route
route = ["A", "C", "B", "D"]
trial = route.copy()
trial[1], trial[2] = trial[2], trial[1]
print(route)
print(trial)
print(route is trial)

# %% Slide 25: Copying check
a = ["A", "B"]
b = a.copy()
print(a == b)
print(a is b)
