"""Execute each slide example, refresh its output and render Quarto."""
from pathlib import Path
import re, os, subprocess, json, base64, sys, hashlib
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
os.environ.setdefault('MPLCONFIGDIR', str(ROOT / '.mpl-cache'))
source = (ROOT / 'week7.qmd').read_text()
source = re.sub(r'\n<!-- output-start -->.*?<!-- output-end -->\n', '\n', source, flags=re.S)

# Version embedded activity pages and their assets so revised boards replace cached copies.
activity_files = sorted((ROOT / 'activities').glob('*'))
activity_digest = hashlib.sha256()
for asset in activity_files:
    if asset.suffix in {'.html', '.js', '.css'}:
        activity_digest.update(re.sub(r'\?v=[a-f0-9]+', '', asset.read_text()).encode())
activity_version = activity_digest.hexdigest()[:12]
board_page = ROOT / 'activities/boards.html'
board_html = re.sub(r'((?:src|href)="[^"?]+\.(?:js|css))(?:\?v=[^" ]+)?"',
                    lambda m: m.group(1) + '?v=' + activity_version + '"', board_page.read_text())
board_page.write_text(board_html)
def version_activity(match):
    url = re.sub(r'&v=[a-f0-9]+', '', match.group(0))
    return url + '&v=' + activity_version
source = re.sub(r'activities/boards\.html\?[^\s"\')<>]+', version_activity, source)

subprocess.run([sys.executable, str(ROOT / 'make_diagrams.py')], check=True)
subprocess.run([sys.executable, str(ROOT / 'make_map.py')], check=True)
setup = (ROOT / 'live/setup.py').read_text()
exec((ROOT / 'live/output.py').read_text())
examples, results = [], []
def cell(match):
    code = match.group(1)
    index = len(examples) + 1
    examples.append(code)
    result = run_example(code, setup)
    if result['error']:
        raise RuntimeError(f'Example {index}:\n{code}\n{result["error"]}')
    images = []
    for number, data in enumerate(result['images'], 1):
        path = f'assets/output-{index}-{number}.png'
        (ROOT / path).write_bytes(base64.b64decode(data))
        images.append(path)
    body = ''.join(chunk['html'] for chunk in result['chunks'])
    body += ''.join(f'<img src="{path}" alt="Python plot">' for path in images)
    results.append({'example': index, 'text': result['text'], 'chunks': result['chunks'], 'images': images})
    header = re.findall(r'^## [^\n]+', source[:match.start()], re.M)[-1]
    is_answer = '.quiz-output' in header
    output = f'```{{=html}}\n<div class="run-result" data-example="{index}">{body}</div>\n```'
    if is_answer:
        output = '::: {.answer}\n' + output + '\n:::'
    return match.group(0) + '\n<!-- output-start -->\n' + output + '\n<!-- output-end -->\n'
source = re.sub(r'```python\n(.*?)\n```', cell, source, flags=re.S)
(ROOT / 'week7.qmd').write_text(source)
(ROOT / 'live/examples.py').write_text('"""Run from the week7 folder. Each cell starts with fresh setup."""\nfrom pathlib import Path\n\n' + '\n\n'.join(f'# %% Example {i}\nexec(Path("live/setup.py").read_text())\n' + code for i, code in enumerate(examples, 1)))
(ROOT / 'assets/execution-results.json').write_text(json.dumps(results, indent=2))
print(f'Executed {len(examples)} examples successfully', flush=True)
if '--no-render' not in sys.argv:
    subprocess.run(['quarto', 'render', 'week7.qmd'], check=True)
