export const examples = {
  branching: {
    label: '1 · One decision',
    code: `# Read the detector
message = raw.strip().upper()
distance_cm = int(message[2:])

if distance_cm <= 20:
    print("STOP")
elif distance_cm <= 50:
    print("SLOW")
else:
    print("FORWARD")
`,
  },
  while: {
    label: '2 · While loop',
    code: `# Read the detector
message = raw.strip().upper()
distance_cm = int(message[2:])

while distance_cm > 20:
    print("FORWARD")

    # Read the NEW measurement after moving
    message = raw.strip().upper()
    distance_cm = int(message[2:])

print("STOP")
`,
  },
  for: {
    label: '3 · For loop',
    code: `# Read the detector
message = raw.strip().upper()
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
    message = raw.strip().upper()
    distance_cm = int(message[2:])
`,
  },
  blank: {
    label: 'Write your own',
    code: '',
  },
};
