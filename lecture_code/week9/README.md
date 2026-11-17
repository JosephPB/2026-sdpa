# Week 9: Exploratory data analysis

Edit `week9.qmd`. This is the teaching master, with speaker notes and click-to-reveal quiz solutions. `week9.html` is the rendered lecture. Keep its assets and `week9_files` directory beside it.

## Build everything

From this folder, using the course Python environment:

```sh
python generate_lecture.py
```

On the current teaching machine:

```sh
/Users/er26343/miniconda3/envs/2026-sdpa/bin/python generate_lecture.py
```

The script regenerates the data figures, executes every marked Python example, renders the teaching deck, creates the sibling `../week9_lecture` folder, and exports `../week9_lecture/output/pdf/week9-lecture.pdf`. It can be run from another working directory using its full path. The generated folder should not be edited directly.

Use `--skip-assets` after text-only edits, or `--no-pdf` to build both HTML decks without exporting the PDF. A failed build stops with an error; do not distribute an older PDF after a failed rebuild.

Requirements: Python packages in `requirements.txt`, Quarto, Node.js, Google Chrome and Playwright. The current machine already has these. `browser-tools.mjs` checks the course/runtime Playwright locations; `SDPA_PLAYWRIGHT_MODULE` can specify another installed module. The build uses a temporary loopback-only server for PDF export. It does not fetch teaching data from the network.

## Presenting

- Advance with the right arrow or the on-screen next button. The poster first appears in full, then dims around its original headings and top decisions. Later slides zoom into the relevant branch on successive advances. Reverse steps work too.
- `S` opens Reveal speaker view; notes contain timing, prompts, caveats and transitions.
- Slides 1–59 are the two-hour teaching route, with a ten-minute break after the violin-plot discussion. Slides 60–69 are reference material rather than additional scheduled teaching.
- The timing map and original-deck coverage audit are in `teaching-guide.md`.
- The poster animation respects reduced-motion settings; in that mode camera changes are immediate.

## Student distribution

Distribute the generated PDF, or the whole `week9_lecture` folder for the companion HTML. The student source has all 11 explicitly marked quiz solution blocks and all speaker notes physically removed before rendering. Worked code outputs remain visible. Poster views and animations have selected static print states. The PDF is standalone.

`week9.py` contains the exact worked code snippets as editor cells. `output/execution-results.json` records their executed output. `build_assets.py` regenerates the charts from saved observations and explicitly labelled synthetic examples. Data provenance and visual credits are in `data/source-notes.md`.

To add a code example, use a unique `<!-- EXECUTE:name -->` immediately before its Python fence and include `output/name.qmd` where its result belongs. To withhold a quiz solution, place the whole solution between `<!-- QUIZ-ANSWER-START -->` and `<!-- QUIZ-ANSWER-END -->`. Keep prompts outside these markers.

## Instructor maths reference

The separate three-page reference is `instructor/output/pdf/week9-maths-cheat-sheet.pdf`. Rebuild it after editing its source with:

```sh
quarto render instructor/maths-cheat-sheet.qmd
node instructor/export-cheat-sheet.mjs
```

It is kept outside the student distribution.

## GitHub Pages

The shared Pages site publishes this teaching master at:
https://josephpb.github.io/2026-sdpa/lecture_code/week9/

As with Week 7, this is the delivered lecture with its normal click-to-reveal answers, speaker notes, saved code outputs and animations. The answer-free `week9_lecture` handout remains a separate build. The online deck includes the full-resolution poster and the original Gapminder animation. Code examples show their saved outputs; they do not have Week 7's browser Python runner.

The existing `.github/workflows/webapps.yml` triggers on changes in `lecture_code/week9/`. It renders the latest `week9.qmd` with Quarto, packages the resulting HTML and its dependencies, then deploys Week 9 alongside the existing apps and Weeks 4 and 7 in one Pages artifact. The package excludes the instructor maths sheet and build reports. The full-resolution poster PDF is also available at `output/pdf/data-to-viz-poster-high-resolution.pdf` below the Week 9 URL.

After text or layout edits, commit and push the updated source and any new assets to `main`; the workflow renders the slides during deployment. If worked code or generated figures change, run `python generate_lecture.py` first and commit the refreshed assets and saved outputs too. The Pages workflow uses those saved results rather than executing the Python examples or rebuilding the student PDF.

Local packaging check:

```sh
quarto render week9.qmd
node package-pages.mjs
```

The default package is `output/pages/`, which is ignored by Git. All local HTML, CSS and SVG dependencies are checked before deployment; a missing asset stops the build. Keep the bundled Reveal.js `dist` files trackable using the exceptions in the repository `.gitignore`.
