"""Render full deck, regenerate both variants, and export the requested PDFs."""
from pathlib import Path
import subprocess
import sys

root=Path(__file__).resolve().parent

def run(*args, cwd=root):
    print('Running:', ' '.join(args), flush=True)
    subprocess.run(args,cwd=cwd,check=True)

run('quarto','render','week5.qmd')
run(sys.executable,'generate_variants.py')
run('node','export-pdf.mjs')
run('node','export-pdf.mjs',cwd=root.parent/'week5_lecture')
print('Full and lecture HTML/PDF, and presenter HTML are ready.')
