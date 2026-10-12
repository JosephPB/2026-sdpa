import { previousStages } from "./previous-examples.js";
import { returnStages } from "./previous-return-examples.js";
import { exampleCode, declareLegacyInputs, DEFAULT_ORDER } from "./inputs.js";
const normalized = (code) =>
  typeof code === "string"
    ? code
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trimEnd())
        .join("\n")
    : code;
export function upgradeDrafts(
  saved = {},
  order = DEFAULT_ORDER,
  previousNumber = 10,
  tickets = [],
) {
  const drafts = { ...saved };
  for (const [id, code] of Object.entries(drafts)) {
    let matched = false;
    for (const stage of [...previousStages, ...returnStages].filter(
      (s) => s.id === Number(id),
    )) {
      for (const kind of ["code", "starter"])
        if (normalized(code) === normalized(stage[kind])) {
          drafts[id] = exampleCode(Number(id), kind, order, previousNumber);
          matched = true;
          break;
        }
      if (matched) break;
    }
    if (!matched)
      drafts[id] = declareLegacyInputs(
        code,
        Number(id),
        order,
        previousNumber,
        tickets,
      );
  }
  return drafts;
}
