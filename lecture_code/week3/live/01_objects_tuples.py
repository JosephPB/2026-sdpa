# SDPA week 3. Each # %% section is an independent IDE cell.

# %% Slide 2: Questions from week two
s = "PYTHON"
print(s[1:5:2])
for letter in s[:2]:
    print(letter)

# %% Slide 4: Objects: identity, type and value
number = 4
print(number)
print(type(number))
print(id(number))
print(isinstance(number, object))

# %% Slide 6: Equality and identity
a = 1
b = a
c = 1.0
print(a == c)
print(a is c)
print(a is b)

# %% Slide 9: Tuples: coordinates example
A = (0, 0)
B = (4, 0)
C = (4, 3)
D = (0, 3)
print(B[0], B[1])
print(type(B), len(B))
print(type((4,)), type((4)))

# %% Slide 11: Tuple mutation and reassignment
A = (0, 0)
# A[0] = 2  # Uncomment separately: intentional TypeError

# %% Slide 11: Tuple mutation and reassignment
A = (0, 0)
A = (2, 0)
print(A)

# %% Slide 12: Packing and unpacking tuples
B = (4, 0)  # Also written B = 4, 0
x, y = B
print(x, y)
for coordinate in B:
    print(coordinate)

# %% Slide 12: Packing and unpacking tuples
first = (1, 2)
second = (3, 4)
print(first + second)
print((first, second))
