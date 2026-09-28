# Paste into Robot Lab. Reset to 80 cm before this demonstration.
message = raw.strip()
distance_cm = int(message[2:])

route = "FFPFSFF"
for instruction in route:
    if instruction == "S":
        print("STOP")
        break
    if instruction == "P":
        print("PAUSE")
        continue

    print("FORWARD")
    message = raw.strip()
    distance_cm = int(message[2:])
