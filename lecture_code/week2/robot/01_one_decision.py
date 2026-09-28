# Paste into Robot Lab. It supplies raw automatically.
message = raw.strip()
distance_cm = int(message[2:])
if distance_cm > 20:
    print("FORWARD")
print("Reading checked")
