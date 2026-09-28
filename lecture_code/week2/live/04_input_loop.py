"""Run in a terminal, where input() is supported: python3 live/04_input_loop.py"""
turn = input("Turn left or right? ").strip().lower()
while turn != "left":
    turn = input("Turn left or right? ").strip().lower()
print("Route confirmed")
