"""Regenerate the presenter deck after editing the student source. Python stdlib only."""
from pathlib import Path
import re
import shutil

source = Path(__file__).resolve().parent
target = source.parent / "week2_presenter"
target.mkdir(exist_ok=True)
text = (source / "week2.qmd").read_text()
front, body = text.split("\n---\n", 1)
front = front.replace("student version", "presenter version")
sections = re.split(r"(?m)(?=^## )", body)
slides = []
for section in sections:
    if not section.strip():
        continue
    heading, content = section.split("\n", 1)
    if ".terminal-demo" in heading or ".ide-demo" in heading:
        cue = "Terminal" if ".terminal-demo" in heading else "VS Code/IDE"
        content = f'\n::: {{.presenter-cue}}\n{cue}\n:::\n'
        if ".with-robot" in heading:
            content += '\n::: {.fragment .presenter-robot-cue}\n[Then Robot Lab](https://josephpb.github.io/2026-sdpa/additional_materials/robot-lab/){.robot-link .demo-link target="robot-lab"}\n:::\n'
    elif ".robot-demo" in heading:
        content = re.sub(r"```[^\n]*\n[\s\S]*?```\n?", "", content)
        content = re.sub(r"(?m)^::: \{\.student-only[^\n]*\}\n[\s\S]*?^:::\s*$", "", content)
        # Robot demos read better at full width when the student code column is removed.
        if "#robot-route" in heading:
            content = '\nReset to **80 cm**. Build a `for` loop for `"FFPFSFF"`.\n\n**F** means FORWARD. **S** means STOP and `break`. **P** means PAUSE and `continue`.\n\nFinal distance: **A** 0  **B** 20  **C** 40  **D** 60 cm\n\n::: {.answer}\n**B.** Three moves, one pause, then STOP. The final two `F`s are skipped.\n:::\n\n[Open Robot Lab](https://josephpb.github.io/2026-sdpa/additional_materials/robot-lab/){.robot-link .demo-link target="robot-lab"}\n' 
    # Source answers remain visible in the study deck; reveal them during class.
    content = content.replace('{.answer}', '{.fragment}')
    if "#independent-if" in heading:
        content = content.replace('```{.python}', '```{.python code-line-numbers="1|2-3|4-5|6"}')
    if "#stale-reading" in heading:
        content = re.sub(r"(?m)^::: \{\.student-only[^\n]*\}\n[\s\S]*?^:::\s*$", "", content)
        content = content.replace('```{.python}', '```{.python code-line-numbers="1-3|5-6"}')
    if "#fixed-range" in heading:
        content = content.replace('```{.python}', '```{.python code-line-numbers="1-2|3-4"}')
    slides.append(heading + '\n' + content.strip() + '\n')
(target / "week2.qmd").write_text(front + '\n---\n\n' + '\n'.join(slides))
for folder in ["assets", "activities"]:
    shutil.copytree(source / folder, target / folder, dirs_exist_ok=True)
for name in ["theme.scss", "config.js", "deck.js"]:
    shutil.copy2(source / name, target / name)
(target / "includes.html").write_text((source / "includes.html").read_text().replace('<script src="code-cells.js"></script>\n', ''))
(target / "_quarto.yml").write_text('project:\n  type: default\n  render: [week2.qmd]\n  resources: ["assets/**", "activities/**", config.js, deck.js]\nexecute:\n  eval: false\nformat:\n  revealjs:\n    chalkboard:\n      buttons: true\n')
(target / ".gitignore").write_text('.quarto/\n.DS_Store\n__pycache__/\n')
print(f'Created {target / "week2.qmd"}')
