import { stages } from "./examples.js";
import { previousStages } from "./previous-examples.js";
const withoutBlankLines = (code) =>
  typeof code === "string"
    ? code
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trimEnd())
        .join("\n")
    : code;
export function upgradeDrafts(saved = {}) {
  const drafts = { ...saved };
  for (const previous of previousStages) {
    if (
      withoutBlankLines(drafts[previous.id]) ===
      withoutBlankLines(previous.code)
    )
      drafts[previous.id] = stages[previous.id - 1].code;
    if (
      withoutBlankLines(drafts[previous.id]) ===
      withoutBlankLines(previous.starter)
    )
      drafts[previous.id] = stages[previous.id - 1].starter;
  }
  return drafts;
}
