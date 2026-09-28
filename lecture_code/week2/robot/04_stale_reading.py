# Deliberately incorrect: use ONLY to discuss a stale value in Robot Lab.
# At 80 cm it repeats FORWARD until the app cancels the run on collision.
# Use the toolbar Stop to interrupt it sooner.
message = raw.strip()
distance_cm = int(message[2:])

while distance_cm > 20:
    print("FORWARD")
