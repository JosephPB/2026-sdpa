"""Use one # %% section at a time. These terminal prints do not move a robot."""

# %% One conditional block: repeat with 80, 60, 40 and 20
distance_cm = 80
if distance_cm > 20:
    print("FORWARD")
print("Reading checked")

# %% One elif chain: try 20, 50, 51 and 80
raw = "  d:080  "
message = raw.strip()
distance_cm = int(message[2:])
if distance_cm <= 20:
    print("STOP")
elif distance_cm <= 50:
    print("SLOW")
else:
    print("FORWARD")
print("Reading checked")

# %% Independent if statements
distance_cm = 20
if distance_cm <= 20:
    print("STOP")
if distance_cm <= 50:
    print("SLOW")
print("Done")

# %% A nested condition: try armed = False as well
armed = True
distance_cm = 80
if armed:
    if distance_cm > 20:
        print("FORWARD")
    else:
        print("STOP")
else:
    print("PAUSE")

# %% Combining just the tests for movement
if armed and distance_cm > 20:
    print("Movement is permitted")

# %% Optional mathematics example from the source deck: a guard before division
x = 2
y = 2
if x == y:
    print("x and y are equal")
    if y != 0:
        print("x / y is", x / y)
elif x < y:
    print("x is smaller")
else:
    print("y is smaller")
print("done")
