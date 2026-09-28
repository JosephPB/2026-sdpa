# Paste into Robot Lab. Reset to 80 cm before this demonstration.
message = raw.strip()
distance_cm = int(message[2:])

while distance_cm > 20:
    print("FORWARD")
    message = raw.strip()
    distance_cm = int(message[2:])

print("STOP")
