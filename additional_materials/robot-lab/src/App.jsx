import { useEffect, useRef, useState } from 'react';
import Editor from './Editor';
import RobotArena from './RobotArena';
import Detector from './Detector';
import { examples } from './examples';

const DURATION = 2000;
const getRaw = (distance) => `  d:${String(Math.round(distance)).padStart(3, '0')}  `;
function Icon({ name }) {
  const paths = {
    play: 'M8 5v14l11-7z',
    stop: 'M6 6h12v12H6z',
    reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
    robot: 'M5 7h14v12H5zM9 11v2m6-2v2m-6 3h6M12 3v4M2 10v6m20-6v6',
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={name === 'play' || name === 'stop' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default function App() {
  const [distance, setDistance] = useState(80),
    [start, setStart] = useState('80');
  const [running, setRunning] = useState(false),
    [status, setStatus] = useState('Ready to explore');
  const [action, setAction] = useState(''),
    [crash, setCrash] = useState(false);
  const [code, setCode] = useState(examples.blank.code),
    [example, setExample] = useState('blank');
  const [output, setOutput] = useState(''),
    [error, setError] = useState(''),
    [count, setCount] = useState(0);
  const workerRef = useRef(null),
    frameRef = useRef(0),
    timerRef = useRef(0),
    crashTimer = useRef(0);
  const current = useRef(80),
    outputRef = useRef(null),
    initial = useRef(80);

  function updateDistance(value) {
    current.current = value;
    setDistance(value);
  }
  function cancel() {
    workerRef.current?.terminate();
    workerRef.current = null;
    cancelAnimationFrame(frameRef.current);
    clearTimeout(timerRef.current);
    clearTimeout(crashTimer.current);
    setRunning(false);
  }
  useEffect(
    () => () => {
      workerRef.current?.terminate();
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timerRef.current);
      clearTimeout(crashTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output, error]);

  function reset(value = initial.current) {
    cancel();
    updateDistance(value);
    setCrash(false);
    setAction('');
    setOutput('');
    setError('');
    setCount(0);
    setStatus('Ready to explore');
  }
  function applyStart() {
    const value = Number(start);
    if (!Number.isInteger(value) || value < 1 || value > 200) {
      setError('Choose a whole-number starting distance from 1 to 200 cm.');
      return false;
    }
    if (initial.current !== value) {
      initial.current = value;
      reset(value);
    }
    return true;
  }
  function interrupt() {
    cancel();
    updateDistance(Math.round(current.current));
    setCrash(false);
    setStatus('Execution stopped');
  }
  function append(text) {
    setOutput((previous) => (previous + text).slice(-12000));
  }
  function watchdog(worker) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker) return;
      cancel();
      setStatus('Check your code');
      setError('Execution timed out. Check the loop condition and make sure it changes.');
    }, 7000);
  }
  function perform(command, id, worker) {
    clearTimeout(timerRef.current);
    setAction(command);
    setCount((n) => n + 1);
    setStatus(
      command === 'PAUSE'
        ? 'Pausing for 2 seconds'
        : command === 'STOP'
          ? 'Robot stopped'
          : 'Robot moving',
    );
    const from = current.current;
    const step = command === 'FORWARD' ? 20 : command === 'SLOW' ? 10 : 0;
    const to = Math.max(0, from - step),
      collision = step > 0 && from - step <= 0;
    const begin = performance.now();
    function tick(now) {
      if (workerRef.current !== worker) return;
      const fraction = Math.min(1, (now - begin) / DURATION);
      const eased = (1 - Math.cos(fraction * Math.PI)) / 2;
      updateDistance(from + (to - from) * eased);
      if (fraction < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      updateDistance(to);
      if (collision) {
        worker.terminate();
        workerRef.current = null;
        setRunning(false);
        setCrash(true);
        setStatus('Crash! Resetting…');
        append('\nCRASH! Run ended. Resetting to 80 cm.\n');
        crashTimer.current = setTimeout(() => {
          updateDistance(80);
          setCrash(false);
          setAction('');
          setStatus('Reset to 80 cm after crash');
        }, 1500);
      } else {
        worker.postMessage({ type: 'ack', id, raw: getRaw(to) });
        watchdog(worker);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
  }
  function run() {
    if (workerRef.current || crash) return;
    if (!applyStart()) return;
    setError('');
    setOutput('');
    setCount(0);
    setAction('');
    setRunning(true);
    setStatus('Starting Python…');
    const worker = new Worker(new URL('./python-worker.js', document.baseURI));
    workerRef.current = worker;
    watchdog(worker);
    worker.onerror = () => {
      if (workerRef.current !== worker) return;
      cancel();
      setStatus('Could not start Python');
      setError(
        'The Python interpreter could not load. Reload the page, or check that all app files were served together.',
      );
    };
    worker.onmessage = ({ data }) => {
      if (workerRef.current !== worker) return;
      if (data.type === 'ready') {
        worker.postMessage({ type: 'run', code, raw: getRaw(current.current) });
        setStatus('Running your code');
      } else if (data.type === 'output') append(data.text);
      else if (data.type === 'command') perform(data.command, data.id, worker);
      else if (data.type === 'done') {
        cancel();
        setStatus('Run complete');
      } else if (data.type === 'error') {
        cancel();
        setStatus('Check your code');
        setError(data.message);
      }
    };
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Robot Lab home">
          <span className="brand-icon">
            <Icon name="robot" />
          </span>
          <span>
            robot<span className="brand-light">lab</span>
            <small>SDPA / UNIVERSITY OF BRISTOL</small>
          </span>
        </a>
        <div className="top-controls">
          <label className="start-label" htmlFor="starting-distance">
            Start at{' '}
            <span className="number-field">
              <input
                id="starting-distance"
                type="number"
                min="1"
                max="200"
                step="1"
                value={start}
                disabled={running || crash}
                onChange={(event) => setStart(event.target.value)}
                onBlur={applyStart}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.target.blur();
                }}
              />
              <span>cm</span>
            </span>
          </label>
          <button
            className="button reset-button"
            onClick={() => {
              if (applyStart()) reset(initial.current);
            }}
          >
            <Icon name="reset" /> Reset robot
          </button>
        </div>
      </header>
      <div className="lesson-heading">
        <span className="lesson-tag">WEEK 02</span>
        <span
          className={`run-status ${running ? 'running' : ''} ${error ? 'error' : ''}`}
          role="status"
        >
          <i />
          {status}
        </span>
      </div>
      <main className="workspace">
        <div className="left-column">
          <RobotArena
            distance={distance}
            start={initial.current}
            action={action}
            running={running}
            crash={crash}
          />
        </div>
        <div className="right-column">
          <Detector distance={distance} raw={getRaw(distance)} action={action} />
          <section className="code-panel panel" aria-label="Python editor">
            <div className="editor-toolbar">
              <div className="example-picker">
                <label htmlFor="example">Try an example</label>
                <select
                  id="example"
                  value={example}
                  disabled={running || crash}
                  onChange={(event) => {
                    setExample(event.target.value);
                    setCode(examples[event.target.value].code);
                    setError('');
                  }}
                >
                  {Object.entries(examples).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="run-controls">
                <button
                  className="button stop-button"
                  onClick={interrupt}
                  disabled={!running}
                  aria-label="Stop execution"
                >
                  <Icon name="stop" />
                  Stop
                </button>
                <button
                  className="button run-button"
                  onClick={run}
                  disabled={running || crash}
                  title="Run code (⌘ / Ctrl + Enter)"
                >
                  <Icon name="play" />
                  Run
                </button>
              </div>
            </div>
            <Editor code={code} setCode={setCode} running={running} run={run} />
            <div className="console-heading">
              <span>OUTPUT</span>
              <span>
                {count} {count === 1 ? 'instruction' : 'instructions'}
              </span>
            </div>
            <div
              className="console"
              ref={outputRef}
              role="region"
              aria-label="Python output"
              tabIndex="0"
            >
              {output ? (
                <pre data-testid="console-output">{output}</pre>
              ) : (
                <span className="console-placeholder">Your print output will appear here.</span>
              )}
              {error && (
                <pre className="python-error" role="alert">
                  {error}
                </pre>
              )}
            </div>
          </section>
          <p className="reading-tip">
            <code>raw</code> updates after a move. Read it again inside your loop to get the new
            distance.
          </p>
        </div>
      </main>
    </div>
  );
}
