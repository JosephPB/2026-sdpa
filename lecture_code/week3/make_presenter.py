"""Derive a week 3 presenter source from the student master, following week 2.

Uses the Python standard library only. Does not render, publish or make a website.
"""
from pathlib import Path
import argparse
import re
import shutil


def convert(text):
    front, body = text.split("\n---\n", 1)
    front = front.replace("student draft", "presenter draft")
    slides = []
    for section in re.split(r"(?m)(?=^## )", body):
        if not section.strip():
            continue
        heading, content = section.split("\n", 1)
        if ".terminal-demo" in heading or ".ide-demo" in heading:
            notes = re.findall(r"(?ms)^::: \{\.notes\}\n.*?^:::\s*$", content)
            cue = "Terminal" if ".terminal-demo" in heading else "VS Code/IDE"
            content = f"\n::: {{.presenter-cue}}\n{cue}\n:::\n"
            if notes:
                content += "\n" + "\n\n".join(notes) + "\n"
        # Native Reveal fragments preserve the week 2 presenter reveal behaviour.
        content = content.replace("{.answer}", "{.fragment}")
        slides.append(heading + "\n" + content.strip() + "\n")
    return front + "\n---\n\n" + "\n".join(slides)


def main():
    source = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=source.parent / "week3_presenter")
    args = parser.parse_args()
    target = args.output.resolve()
    if target == source or source in target.parents or target in source.parents:
        parser.error("Choose a separate output directory, outside the student source.")
    marker = target / ".generated-from-week3-student"
    if target.exists() and any(target.iterdir()) and not marker.is_file():
        parser.error("Output is not an existing generated presenter deck. Choose an empty directory.")
    result = convert((source / "week3.qmd").read_text())
    target.mkdir(parents=True, exist_ok=True)
    (target / "week3.qmd").write_text(result)
    for folder in ["assets", "activities", "live"]:
        shutil.copytree(source / folder, target / folder, dirs_exist_ok=True)
    for name in ["theme.scss", "deck.js", "cards.html"]:
        shutil.copy2(source / name, target / name)
    includes = (source / "includes.html").read_text()
    (target / "includes.html").write_text(includes.replace('<script src="code-cells.js"></script>\n', ""))
    (target / "_quarto.yml").write_text(
        "project:\n  type: default\n  render: [week3.qmd]\n"
        '  resources: ["assets/**", "activities/**", "live/**", cards.html, deck.js]\n'
        "execute:\n  eval: false\nformat:\n  revealjs:\n    chalkboard:\n      buttons: true\n"
    )
    (target / ".gitignore").write_text(".quarto/\n.DS_Store\n__pycache__/\n")
    (target / "README.md").write_text(
        "# Week 3 presenter deck\n\nGenerated from the student `week3.qmd`. "
        "Edit the student master and rerun `python3 make_presenter.py` there. "
        "Regeneration replaces generated presenter files.\n\n"
        "Use `quarto preview week3.qmd --port 4204` to preview, or "
        "`quarto render week3.qmd` to render. Keep the entire folder together.\n\n"
        "Live-code slides show Terminal/IDE cues. Prediction code and boards remain. "
        "Answers reveal with the next slide step. Brief notes remain in speaker view (S). "
        "No website landing page is generated.\n"
    )
    marker.write_text("Generated from the week 3 student master.\n")
    print(f"Created {target / 'week3.qmd'}")


if __name__ == "__main__":
    main()
