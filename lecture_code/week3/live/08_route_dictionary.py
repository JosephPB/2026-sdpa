"""The same exact route search, using dictionaries and named stops.
Run this entire file, or run its # %% cells in order in one IDE session.
locations maps stop names to coordinates; route_lengths maps route tuples
into total distances. Equal distances do not overwrite other routes.
This improves the representation, not the factorial search complexity.
"""

# %% 1. Generate candidate orders using the location dictionary's keys
locations = {"A": (0, 0), "B": (4, 0),
             "C": (4, 3), "D": (0, 3)}
routes = [["A"]]
for step in range(len(locations) - 1):
    longer_routes = []
    for route in routes:
        for stop in locations:
            if stop not in route:
                longer_routes.append(route + [stop])
    routes = longer_routes
print(len(routes))

# %% 2. Score every tour and store it by its hashable route tuple
route_lengths = {}
for route in routes:
    closed = route + [route[0]]
    total = 0
    for i in range(len(closed) - 1):
        x1, y1 = locations[closed[i]]
        x2, y2 = locations[closed[i + 1]]
        total += ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    route_lengths[tuple(route)] = total

# %% 3. Turn dictionary items into (distance, route) pairs, then sort
ranked = sorted([(distance, route)
                 for route, distance in route_lengths.items()])
best_distance, best_route = ranked[0]
print(best_distance)
print(best_route + (best_route[0],))

# %% 4. Inspect all results (both optimal tours are retained)
for distance, route in ranked:
    print(distance, route + (route[0],))
