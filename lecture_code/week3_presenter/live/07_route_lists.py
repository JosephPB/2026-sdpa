"""Duck route optimisation using tuples, lists, loops and append.
Run this entire file, or run its # %% cells in order in one IDE session.
The four fixed coordinates are distinct. A is the start and final return.
No imports, recursion or permutation library are needed.
"""

# %% 1. Generate all candidate orders with A fixed
A, B, C, D = (0, 0), (4, 0), (4, 3), (0, 3)
stops = [B, C, D]
routes = [[A]]
for step in range(len(stops)):
    longer_routes = []
    for route in routes:
        for stop in stops:
            if stop not in route:
                longer_routes.append(route + [stop])
    routes = longer_routes
print(len(routes))

# %% 2. Practise calculating one complete tour length
A, B, C, D = (0, 0), (4, 0), (4, 3), (0, 3)
route = [A, C, B, D]
closed = route + [route[0]]
total = 0
for i in range(len(closed) - 1):
    x1, y1 = closed[i]
    x2, y2 = closed[i + 1]
    total += ((x2 - x1)**2 + (y2 - y1)**2)**0.5
print(total)

# %% 3. Score every candidate, sort, and select the first
scores = []
for route in routes:
    closed = route + [route[0]]
    total = 0
    for i in range(len(closed) - 1):
        x1, y1 = closed[i]
        x2, y2 = closed[i + 1]
        total += ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    scores.append((total, route))
ranked = sorted(scores)
best_distance, best_route = ranked[0]
print(best_distance)
print(best_route + [best_route[0]])

# %% 4. Inspect all results (both directions of the best tour remain)
for distance, route in ranked:
    print(distance, route + [route[0]])
