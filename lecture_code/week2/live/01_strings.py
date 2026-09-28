"""Run each # %% section in VS Code, or type its lines in the Python REPL."""

# %% Text, operators and casting
raw = "  d:080  "
label = 'robot'
print(label + " " + str(3))
print(label, 3)
print("F" * 3)
print(len(raw))  # 9, including the spaces
print("\N{winking face}")
# Try separately: "robot" + 3  # TypeError

# %% A sensor message becomes an integer
message = raw.strip()
digits = message[2:]
distance_cm = int(digits)
print(repr(raw), repr(message), repr(digits), distance_cm)
print(distance_cm + 20)
# Try separately: int("D:080")  # ValueError

# %% Case and whitespace: repr makes outside spaces visible
name = "  ada LOVELACE  "
print(repr(name.upper()))
print(repr(name.lower()))
print(repr(name.title()))
print(repr(name.lstrip()))
print(repr(name.rstrip()))
print(repr(name.strip()))
print(repr(name))  # The original value is unchanged
print(len(name), len(name.strip()))

# %% Indexing and slicing
s = "PYTHON"
print(s[0], s[-2])
print(s[:3], s[4:], s[:5:2], s[-4:], s[::-1])
print(repr(s[6:20]))  # An empty string
# Try separately: s[6]   # IndexError
# Try separately: s[::0] # ValueError

# %% Immutability
message = "d:080"
# Try separately: message[0] = "D"  # TypeError
message = "D" + message[1:]
print(message)

# %% Joining, chaining and a CSV row (run from the week2 folder)
message = " ada Lovelace "
print(" ".join(message.split()))
with open("data/names.csv") as f:
    line = f.readline()
print(repr(line.strip()))
name = line.split(",")[0]
print(name.strip().title())
