"""Generate Week 5 lecture and presenter decks from this folder's week5.qmd.

The generated folders are siblings of week5. Rendered HTML is refreshed by default.
Generated source folders carry a marker so the script never overwrites an
unrelated hand-edited folder.
"""
from pathlib import Path
import argparse
import re
import shutil
import subprocess

SOURCE = Path(__file__).resolve().parent
ANSWERS = re.compile(r'(?ms)^::: \{\.answer\}\n.*?^:::\s*\n')
MARKER = '.generated-from-week5-master'


def generate(kind: str, render: bool = True) -> Path:
    if kind not in {'lecture', 'presenter'}:
        raise ValueError(kind)
    target = SOURCE.parent / f'week5_{kind}'
    if target.exists() and any(target.iterdir()) and not (target / MARKER).is_file():
        raise RuntimeError(f'{target} is not marked as generated; refusing to replace it')
    target.mkdir(parents=True, exist_ok=True)
    source = (SOURCE / 'week5.qmd').read_text()
    if '{.notes}' in source:
        raise RuntimeError('Remove speaker notes from the full version before generating variants')
    if kind == 'lecture':
        source, removed = ANSWERS.subn('', source)
        if removed == 0:
            raise RuntimeError('No quiz answers found in full version; check source structure')
        assert '{.answer}' not in source
        includes = (SOURCE / 'includes.html').read_text()
    else:
        # Quarto's fragment syntax keeps answers click-to-reveal, without a button.
        source = source.replace('::: {.answer}', '::: {.fragment}')
        includes = (SOURCE / 'includes.html').read_text().replace('<script src="code-cells.js"></script>\n', '')
    source = source.replace('pagetitle: "Week 5: Objects, testing and debugging"',
                            f'pagetitle: "Week 5: Objects, testing and debugging ({kind})"')
    (target / 'week5.qmd').write_text(source)
    (target / 'includes.html').write_text(includes)
    (target / '_quarto.yml').write_text(
        'project:\n  type: default\n  render: [week5.qmd]\n'
        '  resources: ["assets/**", "live/**", "runtime/**", "config.js", "deck.js", "code-cells.js"]\n'
        'execute:\n  eval: false\n' +
        ('format:\n  revealjs:\n    chalkboard:\n      buttons: true\n' if kind == 'presenter' else '')
    )
    for name in ['assets', 'live', 'runtime']:
        dst = target / name
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(SOURCE / name, dst)
    for name in ['theme.scss', 'config.js', 'deck.js', 'code-cells.js', 'export-pdf.mjs']:
        shutil.copy2(SOURCE / name, target / name)
    (target / 'pdf-config.json').write_text('''{"kind":"lecture","output":"output/pdf/week5-lecture.pdf"}\n''' if kind == 'lecture' else '''{"kind":"presenter","output":"output/pdf/week5-presenter.pdf"}\n''')
    (target / '.gitignore').write_text('.quarto/\n__pycache__/\n.DS_Store\n')
    (target / 'README.md').write_text(
        f'# Week 5 {kind} deck\n\nGenerated from `../week5/week5.qmd`. '
        'Edit the full deck, then run `python3 ../week5/generate_variants.py`. '
        'This folder is regenerated and should not be edited directly.\n\n'
        + ('Quiz questions remain, but answer blocks are removed from both HTML and PDF. '
           'Runnable Python cells remain for students.\n\n' if kind == 'lecture' else
           'Quiz answers reveal as slide fragments. This version has no Python Run/Edit buttons and enables the Reveal chalkboard.\n\n')
        + 'Run `quarto render week5.qmd` for HTML. '
        + ('Run `node export-pdf.mjs` for a PDF.\n' if kind == 'lecture' else
           'The presenter PDF is optional; run `node export-pdf.mjs` if needed.\n')
    )
    (target / MARKER).write_text('Generated from week5/week5.qmd; regenerate from there.\n')
    if render:
        subprocess.run(['quarto', 'render', 'week5.qmd'], cwd=target, check=True)
    return target


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', choices=['lecture', 'presenter'])
    parser.add_argument('--no-render', action='store_true')
    args = parser.parse_args(argv)
    for kind in ([args.only] if args.only else ['lecture', 'presenter']):
        print(f'Generating week5_{kind}', flush=True)
        print(generate(kind, render=not args.no_render))

if __name__ == '__main__':
    main()
