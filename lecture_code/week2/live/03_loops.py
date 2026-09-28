"""Run selected # %% sections during the lecture, not the whole file at once."""

# %% Countdown: the body changes the value tested by while
n = 5
while n > 0:
    print(n)
    n -= 1
print("Blastoff!")

# %% The same integer sequence with while and for
n = 0
while n < 5:
    print(n)
    n += 1
for n in range(5):
    print(n)

# %% Positive and negative range steps
for value in range(5, 40, 10):
    print(value)
for value in range(40, 5, -10):
    print(value)
print(range(5))  # range(0, 5), not a printed list of its values

# %% A range is created before its loop starts
x = 4
for i in range(x):
    print(i)
    x = 5

# %% Three ways to visit a string
route = "FFPFSFF"
for ch in route:
    print(ch)
for i in range(len(route)):
    print(i, route[i])
i = 0
while i < len(route):
    print(i, route[i])
    i += 1

# %% break exits only the inner loop
for trial in range(2):
    for instruction in "FSF":
        if instruction == "S":
            break
    print("Trial finished", trial)

# %% continue skips the remaining body; update the while counter first
current_number = 0
while current_number < 10:
    current_number += 1
    if current_number % 2 == 0:
        continue
    print(current_number)  # 1, 3, 5, 7, 9

# %% Truthiness, not positivity
print(bool(0), bool(-1), bool(1))  # False, True, True
