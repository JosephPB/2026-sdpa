AI-assisted programming — SDPA

Open ai_coding.html in a browser to present. Open ai_coding.qmd to edit.
Rebuild the deck and reading guide: quarto render

Based on the Week 10 course template: copied theme.scss and original Bristol
branding; same 1600 x 900 Reveal.js canvas, font families, red accents, footer,
navigation, slide numbering and click-driven scene convention.

The 24 slides preserve the lecturer's revised order, with the case studies
following the dependencies and permissions slide.
Press S for speaker view.
Press Right or Space for ordinary reveals; Left reverses them.
“Chatbot use” and “Agent use” automatically play scripted animations on entry.
On-slide controls pause, replay or show the complete result. Leaving a slide
stops its animation. Reduced-motion settings show the final result by default.
Nothing contacts an AI service, edits files or executes Python during playback.

End recording on “What you remain responsible for”. The final reading slide
is available as a reference after the recap.
No in-video student exercise is included. The LinkedIn screenshot slide has
been removed. The case studies cover Replit / SaaStr and Amazon Q,
with primary-source links and outcome caveats. Existing timings are guides.

The entire ai_coding folder should travel together: HTML files depend on the
generated ai_coding_files folder, assets, animations.js, demos.js and stylesheet.
reading.html is self-contained. Do not distribute the deck HTML by itself.

demo/ contains the runnable Python examples. No external dependencies.
In demo/: python test_force.py --buggy  (intentional one-test failure)
In demo/: python -m unittest -v         (all four tests pass)

The mock-up interfaces are fictional and clearly labelled. They illustrate
two modes of assistance, not a universal chat-versus-agent product distinction.
The example does not control hardware and is not safety-critical software.

Source document: AI for programming lecture-2.md, supplied by the lecturer.
Sources for factual claims appear in the slides, notes and reading guide.
Slide 4 uses the lecturer-supplied Economist graphics on Strömberg et al.'s
2026 Chinese secondary-education preprint, not the separate Bastani study.
The caveat explicitly distinguishes this evidence from programming education.
Asset provenance and the generated rubber-duck prompt are in assets/SOURCES.txt.

GitHub Pages
------------
Public resources: https://josephpb.github.io/2026-sdpa/lecture_code/ai_coding/
The shared .github/workflows/webapps.yml builds this folder on relevant main
branch pushes and manual workflow runs, alongside the existing teaching apps.
Run node build-pages.mjs locally after installing the DuckDash dependencies.
Use --browser chromium in CI; local builds use Chrome by default.
The build renders the current Quarto slides and Markdown references, exports
both PDFs, checks the scripted demos, and creates output/pages/index.html.
Only allowlisted teaching assets are copied. Speaker notes are removed from
the public slide HTML. Backup folders and authoring files are not in the site.
Source QMD files (including teaching notes) remain visible in the repository.
Generated HTML, libraries and PDFs are ignored by Git and rebuilt in CI.
