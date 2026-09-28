# Paste into Robot Lab. It supplies raw automatically.
message = raw.strip()
distance_cm = int(message[2:])

if distance_cm <= 20:
    print("STOP")
elif distance_cm <= 50:
    print("SLOW")
else:
    print("FORWARD")
