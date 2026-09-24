# SDPA Robot Lab

A browser-based Python playground for week 2 of SDPA: strings, branching and loops. A robot approaches a wall while students run their own code and each browser controls an independent robot.

## Running

Install Node.js 24 (or Node 22.12+). 

In this folder:

```sh
npm ci
npm run dev
```

For the built version:

```sh
npm run build
npm run preview
```

The app runs in the browser. No Python installation, account, API key or server-side execution is needed. All runtime assets are packaged. Serve the files over HTTP; opening `index.html` through a `file://` URL will not work with the Python worker.

## Usage

- **Start at** accepts a whole number from 1 to 200 cm. Changing it and leaving the field resets the robot to that distance. The default is 80 cm.
- **Run** executes the current editor contents from the robot's current position.
- **Stop** interrupts Python immediately, including an infinite loop, and freezes the robot at its current distance.
- **Reset robot** cancels execution, returns to the selected starting distance and clears output. It preserves the code.
- The example menu includes one decision, a while loop, a for loop, and a blank “Write your own” starting point selected by default. Selecting an example replaces the editor contents.
- The code editor supports syntax highlighting, line numbers and four-space Tab insertion. Code is read-only while running.
- There is no server or shared class state. Refreshing the page restores the blank editor.

### Reading the detector

Python can read `raw` without calling `input()`. It supplies a string of the form:

```python
"  d:080  "
```

The exact string appears beneath the waveform. Leading and trailing spaces and the lowercase `d` provide a reason to practise string methods:

```python
message = raw.strip().upper()
distance_cm = int(message[2:])
```

`raw` supplies the latest detector value each time Python looks it up. Treat `raw` as the supplied sensor variable name; assigning your own `raw` variable shadows that reading.

The displayed distance is measured from the front of the robot to the wall. During animation the detector shows the rounded current distance. Python resumes only when the movement finishes.

### Instructions

| Printed instruction | Result                                    |
| ------------------- | ----------------------------------------- |
| `FORWARD`           | Move 20 cm toward the wall over 2 seconds |
| `SLOW`              | Move 10 cm toward the wall over 2 seconds |
| `STOP`              | No movement; wait 2 seconds               |
| `PAUSE`             | No movement; wait 2 seconds               |

Each exact uppercase instruction on a printed line is interpreted. Surrounding whitespace is ignored. Other printed text is ordinary output and does not delay execution. For example, `print("Distance:", distance_cm)` logs a value; `print("FORWARD")` moves the robot. A single print containing multiple instruction lines executes them in order. Partial strings from separate `print(..., end="")` calls are not combined into commands.

**Printing STOP does not end the Python program.** It parks the robot for that instruction. A `break` or the end of a loop ends a route; the toolbar's Stop button interrupts execution. This is intentional so students can learn the distinction.

Reaching or crossing zero counts as a collision. The robot animates to the wall, flashes **CRASH!**, cancels the remainder of that run and resets to **80 cm**, regardless of the chosen start setting. The Reset button still returns to the chosen start setting.

## GitHub Pages deployment

The app source lives in `additional_materials/robot-lab`. `.github/workflows/robot-lab-pages.yml` in the `$HOME` directory defines the workflow definitions.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Open **Actions → Deploy Robot Lab → Run workflow**, select `main`, and run it. Subsequent changes to this app on `main` will deploy automatically.
4. Once the workflow succeeds, open:

   https://josephpb.github.io/2026-sdpa/additional_materials/robot-lab/

The workflow installs dependencies, tests the Python bridge, builds the app, and publishes only the generated site. It keeps this subfolder in the public URL and provides a redirect from the project-site root. It does not expose the rest of the repository as site files.

## Implementation and checks

React and Vite render the UI. CodeMirror supplies the editor. [Skulpt 1.2.0](https://github.com/skulpt/skulpt) runs Python in Python 3 mode inside a disposable Web Worker.

The interpreter suspends at a printed robot instruction until the UI acknowledges the animation. This preserves Python control flow and supplies updated readings without rewriting the student's code or requiring `sleep`. No cross-origin isolation headers or SharedArrayBuffer are required, so ordinary static hosting works.

The worker is terminated by Stop, Reset and collisions. Five seconds of uninterrupted Python computation produces a timeout; a separate UI watchdog catches an unresponsive worker. Animation time does not count against the Python timeout. The app limits printed output to avoid freezing the interface. Syntax and runtime errors appear beneath the editor.

```sh
npm test
npm run build
```

Optional browser tests, with the development server running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

Or use an existing Google Chrome installation:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:browser
```

Override `TEST_URL` to test a built or nested-path deployment. Browser checks cover gradual movement, two-second timing, live sensor readings, loops, STOP/PAUSE, cancellation, crash recovery, Python errors, independent sessions and a mobile viewport. Screenshots are written to ignored `test-results/`.

`npm run format` formats maintained source files. `npm run package:pages` builds the deployable directory tree under ignored `pages-site/`. Skulpt's MIT license is copied with its runtime into the deployment.
