"""Build the master, runnable presenter deck, and student HTML/PDF.

python generate_variants.py            # real requests for request/scrape outputs
python generate_variants.py --saved    # explicitly use the bundled source bodies
Add --no-pdf to build HTML only. Edit week8.qmd, then regenerate.
"""
from pathlib import Path
import argparse
import base64
import html
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'live'))
from capture_slide import run_example

CODE = re.compile(r'```python\n(.*?)\n```', re.S)
NOTES = re.compile(r'(?ms)^::: \{\.notes\}\n.*?^:::\s*\n')
OLD_OUTPUT = re.compile(r'<pre class="output">.*?</pre>\s*', re.S)
GENERATED = re.compile(r'<!-- generated-example-start -->.*?<!-- generated-example-end -->', re.S)
QUIZ_CODE = {'slice-code', 'ref-window'}


def section_id(section):
    match = re.search(r'\{#([^\s}]+)', section)
    return match[1] if match else None


def result_html(result, number):
    content = ''.join(chunk['html'] for chunk in result['chunks'])
    for index, data in enumerate(result['images']):
        name = f'output-{number}-{index}.png'
        (ROOT / 'assets' / name).write_bytes(base64.b64decode(data))
        content += f'<img src="assets/{name}" alt="Output from the displayed Python code">'
    return content


def decorate(section, kind, examples):
    sid = section_id(section)
    index = 0
    def replace(match):
        nonlocal index
        example = examples[(sid, index)]
        index += 1
        number = example['number']
        if kind == 'lecture' and sid in QUIZ_CODE:
            return match[0]
        content = '' if kind == 'presenter' else example['html']
        return (f'<div class="code-example" data-example="{number}">\n\n'
                '<div class="code-source">\n\n' + match[0] + '\n\n</div>\n\n'
                f'```{{=html}}\n<div class="run-result" data-example="{number}">{content}</div>\n```\n\n</div>')
    return CODE.sub(replace, section)


def student_section(section, states):
    sid = section_id(section)
    section = NOTES.sub('', section)
    if sid == 'slice':
        section = re.sub(r'<div class="fragment"><img src="assets/slice-answer.svg".*?</div>', '', section)
    elif sid == 'window-question':
        section = re.sub(r'(?ms)^::: \{\.fragment\}\n.*?^:::\s*\n', '', section)
    elif sid in {'window', 'window-trace'}:
        prompt = '<div class="window-array">' + ''.join(f'<span>{v}</span>' for v in [5,2,4,6,3,1]) + '</div>'
        prompt += '<p>Width = 2. Predict the window and mean at each position.</p>'
        if sid == 'window-trace':
            prompt += '<pre class="trace-code">for start in range(5):\n    stop = start + width\n    window = values[start:stop]\n    average = window.mean()\n    averages.append(float(average))</pre><p>After an iteration: <code>start = ?</code>, <code>stop = ?</code>, <code>window = ?</code>, <code>average = ?</code></p>'
        section = re.sub(r'<div class="animation".*?</div>', prompt, section)
    elif sid in {'qualitative', 'discrete'}:
        names = ['Quantitative','Qualitative'] if sid == 'qualitative' else ['Discrete','Continuous']
        definitions = ['Counts or measurements: how many or how much.','Categories or descriptions: what kind.'] if sid == 'qualitative' else ['Values occur in distinct steps.','The underlying quantity varies over a continuum.']
        items = ['Road name','Vehicle count','NO₂ concentration','Count-point ID: 6401'] if sid == 'qualitative' else ['Vehicle count','Journey duration','Shoe size','NO₂ concentration']
        prompt = '<div class="sort-columns">' + ''.join(f'<div><h3>{name}</h3><p class="definition">{definition}</p></div>' for name,definition in zip(names,definitions)) + '</div>'
        prompt += '<p>Which column does each example belong in?</p><ul>' + ''.join(f'<li>{item}</li>' for item in items) + '</ul>'
        section = re.sub(r'<div class="animation".*?</div>', prompt, section)
    elif sid == 'questions':
        questions = re.findall(r'data-answer="false"><h3>.*?</h3><p class="exit-question">(.*?)</p>', section)
        section = '## Questions {#questions}\n\n```{=html}\n<ol class="student-questions">' + ''.join(f'<li>{q}</li>' for q in questions) + '</ol>\n```\n\n'
    elif sid == 'ref-window':
        section = re.sub(r'(?m)^Width [23]:.*\n', '', section)
    elif sid == 'ref-classification':
        rows = re.findall(r'^\| ([^|]+) \| [^|]+ \|$', section, re.M)[1:]
        section = '## Reference: classification practice {#ref-classification .reference-slide}\n\n| Example | Your classification |\n|---|---|\n' + ''.join(f'| {row.strip()} | |\n' for row in rows) + '\n'
    elif sid in states:
        content = states[sid][0]
        if sid == 'binning':
            content = '<div class="binning-pair"><h3>Equal-width bins</h3>' + states[sid][0] + '<h3>Equal-count bins</h3>' + states[sid][1] + '</div>'
        elif sid == 'http':
            content = ('<p><strong>GET</strong> retrieves the two existing observations. The stored rows stay unchanged.</p>'
                       '<p><strong>POST</strong> submits a new observation: site A38, cars 286. The server adds row 3 before returning 201 Created.</p>' + states[sid][1])
        section = re.sub(r'<div class="animation".*?</div>', lambda _: '\n```{=html}\n' + content + '\n```\n', section)
    return section


def build(args):
    os.chdir(ROOT)
    source = (ROOT / 'week8.qmd').read_text()
    source = GENERATED.sub('', source)
    sections = re.split(r'(?m)(?=^## )', source)
    examples = {}
    setup = (ROOT / 'live/slide_setup.py').read_text()
    number = 0
    for position, section in enumerate(sections):
        if section_id(section) == 'plot-code':
            code = CODE.search(section)[0]
            notes = NOTES.search(section)[0]
            section = '## Build a plot {#plot-code}\n\n' + code + '\n\n`Figure`: whole canvas. `Axes`: plotting area.\n\n' + notes
        section = OLD_OUTPUT.sub('', section)
        sections[position] = section
        sid = section_id(section)
        for index, match in enumerate(CODE.finditer(section)):
            number += 1
            result = run_example(match[1], setup, saved=args.saved)
            if result['error']:
                raise RuntimeError(f'Example {number} ({sid}): {result["error"]}')
            content = result_html(result,number)
            if sid == 'request-code':
                content += '<p class="source-note">Saved DfT preview · 9 November 2026</p>' if args.saved else '<p class="source-note">Live output checked · 9 November 2026</p>'
            elif sid == 'scrape-code':
                content += '<p class="source-note">Saved practice page · 8 November 2026</p>' if args.saved else '<p class="source-note">Live output checked · 9 November 2026</p>'
            examples[(sid,index)] = {'number':number,'code':match[1],'html':content,'result':result}
    subprocess.run(['quarto','render','week8.qmd'], cwd=ROOT, check=True)
    subprocess.run(['node','snapshot-animations.mjs'], cwd=ROOT, check=True)
    states = json.loads((ROOT / 'assets/animation-states.json').read_text())
    for kind in ['presenter','lecture']:
        target = ROOT.parent / f'week8_{kind}'
        marker = target / '.generated-from-week8-master'
        if target.exists() and any(target.iterdir()) and not marker.exists():
            raise RuntimeError(f'Refusing to overwrite unmarked folder {target}')
        target.mkdir(exist_ok=True)
        marker.write_text('Generated from week8/week8.qmd. Edit the master and regenerate.\n')
        for name in ['assets','data']:
            shutil.copytree(ROOT / name, target / name, dirs_exist_ok=True)
        for name in ['theme.scss','week8.css','requirements.txt','browser-tools.mjs','export-pdf.mjs']:
            shutil.copy2(ROOT / name, target / name)
        if kind == 'presenter':
            shutil.copytree(ROOT / 'live', target / 'live', dirs_exist_ok=True)
            for name in ['serve.py','runner.js','animations.js']:
                shutil.copy2(ROOT / name, target / name)
        parts = []
        for section in sections:
            sid = section_id(section)
            if kind == 'lecture':
                section = student_section(section, states)
                if sid == 'request-code':
                    # The printed handout gives each URL construction its own page.
                    for index, title in enumerate(['The full request URL','Build the URL with an f-string','Build the query with params']):
                        ex = examples[(sid,index)]
                        code = '```python\n'+ex['code']+'\n```'
                        parts.append(f'## {title} {{#request-method-{index}}}\n\n<div class="code-example"><div class="code-source">\n\n{code}\n\n</div>\n\n```{{=html}}\n<div class="run-result">{ex["html"]}</div>\n```\n\n</div>\n\n')
                    continue
            parts.append(decorate(section, kind, examples))
        content = ''.join(parts).replace('pagetitle: "Week 8: Data types and sources"',f'pagetitle: "Week 8: Data types and sources ({kind})"')
        (target / 'week8.qmd').write_text(content)
        includes = (ROOT / 'includes.html').read_text()
        includes = includes + '\n<script src="runner.js"></script>\n' if kind == 'presenter' else includes.replace('<script src="animations.js"></script>','')
        (target / 'includes.html').write_text(includes)
        (target / '_quarto.yml').write_text('project:\n  type: default\n  render: [week8.qmd]\nexecute:\n  eval: false\n')
        (target / '.gitignore').write_text('.quarto/\n__pycache__/\n.DS_Store\n')
        if kind == 'lecture':
            (target / 'assets/slice-answer.svg').unlink(missing_ok=True)
            (target / 'assets/build_assets.py').unlink(missing_ok=True)
            for private in ['animation-states.json','execution-results.json']:
                (target / 'assets' / private).unlink(missing_ok=True)
            for quiz in [v['number'] for (sid,_),v in examples.items() if sid in QUIZ_CODE]:
                for file in (target / 'assets').glob(f'output-{quiz}-*.png'): file.unlink()
        local_setup = setup.replace("matplotlib.use('Agg')\n",'')
        if kind == 'presenter':
            (target / 'live/local_setup.py').write_text(local_setup)
            cells = ['"""Week 8 examples. Run Setup, then any numbered cell. Request cells make real GETs."""\n# %% Setup\nfrom pathlib import Path\nimport os\nROOT = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()\nos.chdir(ROOT)\nSETUP = (ROOT / "live/local_setup.py").read_text()']
            for (sid,index),example in examples.items():
                cells.append(f'# %% {example["number"]}: {sid}\nexec(SETUP, globals())\n'+example['code']+'\nplt.show()\nplt.close("all")')
            (target / 'week8.py').write_text('\n\n'.join(cells)+'\n')
        (target / 'README.md').write_text(f'# Week 8 {kind}\n\nGenerated from ../week8/week8.qmd. Edit the master, then run `python ../week8/generate_variants.py`.\n\n' + (
            f'{number} code examples have Run buttons and start with empty output. Install requirements.txt, then run `python serve.py` and open http://127.0.0.1:4218/week8.html. Request/scrape cells make real GETs. Use `python serve.py --saved` to explicitly select bundled source responses. Other cells start with fresh prepared variables, including the saved two-record API preview; they do not depend on earlier clicks. Open week8.py for the same independent editor cells, or live/bristol_traffic_pipeline.py for the complete pipeline. Keep the whole folder together.\n' if kind == 'presenter' else
            'Student HTML and PDF contain ordinary executed code outputs. Quiz results, answer images, classifications, answer-reveal code and speaker notes are omitted. The three URL methods each have a separate page for legibility. Serve with `python -m http.server 4219 --bind 127.0.0.1`, then open http://127.0.0.1:4219/week8.html. The Blackboard upload is output/pdf/week8-lecture.pdf. No Python server or internet is required to read the PDF.\n'))
        subprocess.run(['quarto','render','week8.qmd'],cwd=target,check=True)
        if kind == 'lecture' and not args.no_pdf:
            subprocess.run(['node','export-pdf.mjs'],cwd=target,check=True)
    print(f'Built both variants: {number} runnable examples; source mode: {"saved" if args.saved else "live"}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--saved', action='store_true')
    parser.add_argument('--no-pdf', action='store_true')
    build(parser.parse_args())
