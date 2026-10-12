export function pythonValue(value, depth = 0) {
  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value))
    return "[" + value.map((v) => pythonValue(v, depth + 1)).join(", ") + "]";
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "{}";
    if (depth)
      return (
        "{" +
        entries
          .map(([k, v]) => JSON.stringify(k) + ": " + pythonValue(v, depth + 1))
          .join(", ") +
        "}"
      );
    return (
      "{\n" +
      entries
        .map(
          ([k, v]) =>
            "  " + JSON.stringify(k) + ": " + pythonValue(v, depth + 1),
        )
        .join(",\n") +
      "\n}"
    );
  }
  return String(value);
}
