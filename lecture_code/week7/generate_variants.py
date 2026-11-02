"""Regenerate Week 7 student/presenter siblings from week7.qmd.

python3 make_lecture.py                 # refresh examples, HTML and student PDF
python3 make_presenter.py               # refresh examples and presenter HTML
python3 generate_variants.py            # both variants plus student PDF
Use --no-render for source folders only, or --no-pdf for HTML without the PDF.
"""
from pathlib import Path
import argparse
import re
import shutil
import subprocess
import sys

SOURCE = Path(__file__).resolve().parent
MARKER = '.generated-from-week7-master'
ANSWERS = re.compile(r'(?ms)^::: \{\.answer[^}\n]*\}\n.*?^:::[ \t]*\n')
OUTPUTS = re.compile(r'(?s)<!-- output-start -->.*?<!-- output-end -->')
CODE = re.compile(r'```python\n(.*?)\n```', re.S)


def replace_presenter_output(match):
    index = re.search(r'data-example="(\d+)"', match.group())
    if not index:
        raise ValueError('Output block without an example number')
    return ('<!-- output-start -->\n```{=html}\n'
            f'<div class="run-result" data-example="{index[1]}"></div>\n'
            '```\n<!-- output-end -->')


def local_examples(source):
    setup = (SOURCE / 'live/setup.py').read_text().replace("import matplotlib\nmatplotlib.use('Agg')\n", '')
    header = '''"""Week 7 live examples. Run the first cell, then any numbered cell in an IDE.

Each example starts with fresh lecture data. Run from this folder with:
    python week7.py
The plots use your local Matplotlib backend. Install requirements.txt first.
"""
# %% Setup
from pathlib import Path
import os
ROOT = Path(__file__).resolve().parent if '__file__' in globals() else Path.cwd()
os.chdir(ROOT)
LOCAL_SETUP = (ROOT / 'live/local_setup.py').read_text()
'''
    cells = []
    for number, code in enumerate(CODE.findall(source), 1):
        cells.append(f'# %% Example {number}\nexec(LOCAL_SETUP, globals())\n{code}\nplt.show()\nplt.close("all")')
    return setup, header + '\n\n' + '\n\n'.join(cells) + '\n'


def generate(kind, render=True, pdf=True):
    target = SOURCE.parent / f'week7_{kind}'
    if target.exists() and any(target.iterdir()) and not (target / MARKER).is_file():
        raise RuntimeError(f'{target} is not marked as generated; refusing to replace it')
    target.mkdir(parents=True, exist_ok=True)
    source = (SOURCE / 'week7.qmd').read_text()
    if kind == 'lecture':
        source, removed = ANSWERS.subn('', source)
        if removed < 3:
            raise RuntimeError('Expected explicit .answer blocks in the master')
        source = re.sub(r'(<iframe[^>]*src="activities/boards.html\?[^"\n]+)', r'\1&handout=1', source)
        source = re.sub(r'(\[Open activity\]\(activities/boards.html\?[^)\n]+)', r'\1&handout=1', source)
        # Removed quiz outputs do not receive Run buttons. Keep ordinary worked outputs.
        source = re.sub(r'<!-- output-start -->\s*<!-- output-end -->', '', source)
    else:
        source = OUTPUTS.sub(replace_presenter_output, source)
        # Preserve the closing six-fragment sequence; turn other answers into fragments.
        source = source.replace('.answer .fragment', '.fragment').replace('{.answer', '{.fragment')
    source = source.replace('pagetitle: "Week 7: Introduction to Scientific Python"',
                            f'pagetitle: "Week 7: Introduction to Scientific Python ({kind})"')
    (target / 'week7.qmd').write_text(source)
    (target / MARKER).write_text('Generated from week7/week7.qmd; edit the master, not this folder.\n')
    for name in ['assets', 'data', 'live', 'activities', 'runtime']:
        shutil.copytree(SOURCE / name, target / name, dirs_exist_ok=True)
    # Do not distribute cached quiz results or plots through the student folder.
    used_outputs = set(re.findall(r'assets/(output-\d+-\d+\.png)', source))
    for file in (target / 'assets').glob('output-*-*.png'):
        if file.name not in used_outputs:
            file.unlink()
    (target / 'assets/execution-results.json').unlink(missing_ok=True)
    if kind == 'lecture':
        page = target / 'activities/boards.html'
        page.write_text(page.read_text().replace('</body>', '<script src="handout.js"></script></body>'))
        shutil.copy2(SOURCE / 'handout.js', target / 'activities/handout.js')
    for name in ['theme.scss', 'week7.css', 'includes.html', 'runner.js', 'worker.js', 'requirements.txt', 'export-pdf.mjs']:
        shutil.copy2(SOURCE / name, target / name)
    (target / '_quarto.yml').write_text((SOURCE / '_quarto.yml').read_text())
    setup, examples = local_examples(source)
    (target / 'live/local_setup.py').write_text(setup)
    (target / 'week7.py').write_text(examples)
    (target / 'live/examples.py').write_text(examples.replace("Path(__file__).resolve().parent if", "Path(__file__).resolve().parent.parent if"))
    (target / 'pdf-config.json').write_text('{"kind":"' + kind + '","output":"output/pdf/week7-' + kind + '.pdf"}\n')
    (target / '.gitignore').write_text('.quarto/\n__pycache__/\n.DS_Store\n.mpl-cache/\n')
    (target / 'README.md').write_text(
        f'# Week 7 {kind}\n\nGenerated from ../week7/week7.qmd. Do not edit this folder directly.\n\n'
        f'Regenerate: python3 ../week7/make_{kind}.py\n\n'
        + ('The student HTML and PDF retain ordinary worked outputs. Explicit .answer blocks and quiz-output results are omitted. Exercise reveal controls are unavailable.\n\n' if kind == 'lecture' else
           'All 65 Python outputs start empty. Run buttons execute the displayed code with fresh setup and local data. Answers to discussion questions reveal as fragments.\n\n')
        + 'Serve this folder with python3 -m http.server 4208 --bind 127.0.0.1 and open http://127.0.0.1:4208/week7.html. '
        'Keep the assets, activities, data, runtime and week7_files folders together.\n\n'
        'For local Python, install requirements.txt, open week7.py, run the Setup cell, then any numbered cell. '
        'Each example is independent and reads the same bundled CSV files. Matplotlib uses your local display backend.\n\n'
        'HTML only: quarto render week7.qmd. PDF: node export-pdf.mjs. The Python generator exports the student PDF by default.\n'
    )
    if render:
        subprocess.run(['quarto', 'render', 'week7.qmd'], cwd=target, check=True)
        if pdf and kind == 'lecture':
            subprocess.run(['node', 'export-pdf.mjs'], cwd=target, check=True)
    return target


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', choices=['lecture', 'presenter'])
    parser.add_argument('--no-render', action='store_true')
    parser.add_argument('--no-pdf', action='store_true')
    args = parser.parse_args(argv)
    # Regenerate saved examples and diagrams from any edits before deriving a variant.
    refresh_python = SOURCE / '.venv/bin/python'
    subprocess.run([str(refresh_python) if refresh_python.exists() else sys.executable, str(SOURCE / 'build.py'), '--no-render'], cwd=SOURCE, check=True)
    for kind in ([args.only] if args.only else ['lecture', 'presenter']):
        print(f'Generating week7_{kind}', flush=True)
        print(generate(kind, render=not args.no_render, pdf=not args.no_pdf), flush=True)


if __name__ == '__main__':
    main()
