#!/usr/bin/env python3
"""Execute Week 9 examples, render the teaching deck, and build week9_lecture + PDF.

    python generate_lecture.py             # complete build
    python generate_lecture.py --no-pdf    # both HTML decks only

Edit week9.qmd in this folder. The generated sibling is not the master.
Only explicitly delimited quiz solutions are removed; ordinary code outputs remain.
"""
from pathlib import Path
import argparse, contextlib, html, io, json, os, re, shutil, subprocess, sys
ROOT=Path(__file__).resolve().parent
os.environ.setdefault('MPLCONFIGDIR',str(ROOT/'output/.mpl-cache'))
CODE=re.compile(r'<!-- EXECUTE:([a-z][a-z0-9-]*) -->\s*```python\n(.*?)\n```',re.S)
ANSWERS=re.compile(r'<!-- QUIZ-ANSWER-START -->.*?<!-- QUIZ-ANSWER-END -->\s*',re.S)
NOTES=re.compile(r'(?ms)^::: \{\.notes\}\n.*?^:::\s*\n')
RAW=re.compile(r'```\{=html\}\n(.*?)\n```',re.S)

def run_examples(source):
    import numpy as np
    import pandas as pd
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    results=[]
    blocks=CODE.findall(source)
    if len(blocks)!=len(re.findall(r'^```python\s*$',source,re.M)):
        raise ValueError('Every Python example must have a unique <!-- EXECUTE:name --> marker.')
    if len({name for name,_ in blocks})!=len(blocks):raise ValueError('Duplicate code example names.')
    for name,code in blocks:
        plt.close('all')
        traffic=pd.read_csv(ROOT/'data/bristol_traffic_2023.csv')
        hourly=pd.read_csv(ROOT/'data/site_hours.csv')
        env={'np':np,'pd':pd,'plt':plt,'traffic':traffic,'hourly':hourly}
        stdout=io.StringIO()
        with contextlib.redirect_stdout(stdout):exec(compile(code,f'week9.qmd:{name}','exec'),env)
        output=stdout.getvalue()
        images=[]
        for index,num in enumerate(plt.get_fignums()):
            dest=ROOT/'output'/f'{name}-{index}.svg'
            plt.figure(num).savefig(dest,bbox_inches='tight');images.append(dest.name)
        content='<pre class="executed-output">'+html.escape(output)+'</pre>' if output else ''
        content+=''.join(f'<img src="output/{fn}" alt="Executed output of {name}">' for fn in images)
        (ROOT/'output'/f'{name}.qmd').write_text('```{=html}\n'+content+'\n```\n')
        results.append({'name':name,'code':code,'stdout':output,'images':images})
    plt.close('all')
    (ROOT/'output/execution-results.json').write_text(json.dumps(results,indent=2))
    # Editor-friendly cells execute exactly the same source snippets with the same setup.
    setup='''"""Week 9 worked examples. Run Setup, then any numbered cell."""\n# %% Setup\nfrom pathlib import Path\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nROOT = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()\ntraffic = pd.read_csv(ROOT / 'data/bristol_traffic_2023.csv')\nhourly = pd.read_csv(ROOT / 'data/site_hours.csv')\n'''
    (ROOT/'week9.py').write_text(setup+'\n'.join(f'\n# %% {r["name"]}\n{r["code"]}\n' for r in results))
    return results

def student_source(source):
    from bs4 import BeautifulSoup
    if source.count('<!-- QUIZ-ANSWER-START -->')!=source.count('<!-- QUIZ-ANSWER-END -->'):
        raise ValueError('Unbalanced quiz solution delimiters.')
    source=ANSWERS.sub('',source)
    source=NOTES.sub('',source)
    def static_scene(match):
        soup=BeautifulSoup(match[1],'html.parser')
        for scene in soup.select('.step-scene'):
            frames=scene.select('.scene-frame');step=int(scene.get('data-print-step','0'))
            if not 0<=step<len(frames):raise ValueError('Invalid print step')
            for i,frame in enumerate(frames):
                if i!=step:frame.decompose()
                else:frame['class']=['scene-frame','active']
            scene['data-print-step']='0'
        for cue in soup.select('.scene-cue'):cue.decompose()
        return '```{=html}\n'+str(soup)+'\n```'
    source=RAW.sub(static_scene,source)
    # Regular worked outputs are visible immediately in the handout HTML.
    source=re.sub(r'class="([^"]*)"',lambda m:'class="'+' '.join(c for c in m[1].split() if c!='fragment')+'"',source)
    source=source.replace('assets/gapminder-original.gif','assets/gapminder-still.png')
    source=source.replace('pagetitle: "Week 9: Exploratory data analysis"','pagetitle: "Week 9: Exploratory data analysis — advance handout"')
    if 'quiz-answer' in source or '{.notes}' in source or 'QUIZ-ANSWER' in source:
        raise ValueError('Private answer or notes markup remained in student source.')
    return source

def build(args):
    os.chdir(ROOT)
    (ROOT/'output').mkdir(exist_ok=True)
    if not args.skip_assets:subprocess.run([sys.executable,str(ROOT/'build_assets.py')],check=True)
    source=(ROOT/'week9.qmd').read_text()
    results=run_examples(source)
    quarto=shutil.which('quarto')
    node=shutil.which('node')
    if not quarto:raise RuntimeError('Quarto is required. Install from https://quarto.org/')
    if not node and not args.no_pdf:raise RuntimeError('Node.js is required for the PDF export.')
    subprocess.run([quarto,'render','week9.qmd'],cwd=ROOT,check=True)
    target=ROOT.parent/'week9_lecture';marker=target/'.generated-from-week9'
    if target.exists() and any(target.iterdir()) and not marker.exists():
        raise RuntimeError(f'Refusing to overwrite an existing unmarked folder: {target}')
    target.mkdir(exist_ok=True)
    marker.write_text('Generated from ../week9/week9.qmd by generate_lecture.py\n')
    content=student_source(source)
    (target/'week9.qmd').write_text(content)
    for name in ['theme.scss','week9.css','animations.js','browser-tools.mjs','export-pdf.mjs','_quarto.yml','week9.py']:
        shutil.copy2(ROOT/name,target/name)
    # Copy only public assets used by the student source (including the poster used in JS).
    refs=set(re.findall(r'assets/[A-Za-z0-9_./-]+',content))
    refs.update(['assets/bristol-slide-original.jpeg','assets/data-to-viz-poster.png'])
    for rel in refs:
        dst=target/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/rel,dst)
    shutil.copytree(ROOT/'data',target/'data',dirs_exist_ok=True)
    (target/'output').mkdir(exist_ok=True)
    for result in results:
        for name in [result['name']+'.qmd',*result['images']]:shutil.copy2(ROOT/'output'/name,target/'output'/name)
    (target/'includes.html').write_text('<div class="brand-logo" role="img" aria-label="University of Bristol"><img src="assets/bristol-slide-original.jpeg" alt=""></div>\n<script>document.body.dataset.student="true";</script>\n<script src="animations.js"></script>\n')
    (target/'README.md').write_text('''# Week 9 advance handout\n\nGenerated from ../week9/week9.qmd. Edit the master and run `python ../week9/generate_lecture.py`.\n\nThe HTML and `output/pdf/week9-lecture.pdf` contain executed worked examples. Explicit quiz solutions and private speaker notes are removed from the source before rendering. Quiz prompts remain. The poster uses legible fixed branch views and worked animations use their specified print state. This folder contains no source solution text. Keep the entire folder together for HTML; the PDF is standalone.\n''')
    (target/'.gitignore').write_text('.quarto/\n__pycache__/\n.DS_Store\n')
    subprocess.run([quarto,'render','week9.qmd'],cwd=target,check=True)
    html_source=(target/'week9.html').read_text()
    if re.search(r'<aside[^>]+class="notes"',html_source) or re.search(r'class="[^"]*quiz-answer',html_source):
        raise ValueError('A solution or notes element reached the student HTML.')
    if not args.no_pdf:subprocess.run([node,'export-pdf.mjs'],cwd=target,check=True)
    print(f'Built teaching HTML and {target}: {len(results)} executed code examples; {source.count("<!-- QUIZ-ANSWER-START -->")} quiz solutions removed.')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--no-pdf',action='store_true',help='Render HTML without PDF')
    parser.add_argument('--skip-assets',action='store_true',help='Reuse already generated figures')
    build(parser.parse_args())
