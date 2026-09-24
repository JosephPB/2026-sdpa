export default function RobotArena({ distance, start, action, running, crash }) {
  const scale = Math.max(100, Number(start) || 80, distance);
  const wallX = 560,
    pixels = 410 / scale,
    noseX = wallX - distance * pixels;
  const centerX = noseX - 49;
  const marks = Array.from({ length: 6 }, (_, i) => Math.round((scale * i) / 5));
  return (
    <section
      className={`arena panel ${crash ? 'is-crashing' : ''}`}
      aria-labelledby="arena-title"
      data-distance={Math.round(distance)}
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">THE EXPERIMENT</span>
          <h2 id="arena-title">Robot arena</h2>
        </div>
        <span className="view-label">TOP VIEW</span>
      </div>
      <div className="arena-stage">
        <svg
          viewBox="0 0 640 430"
          role="img"
          aria-label={`Robot ${Math.round(distance)} centimetres from the wall${crash ? '. Crash!' : ''}`}
        >
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#d8d8d1" strokeWidth="1" />
            </pattern>
            <pattern
              id="wall-stripes"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="16" fill="#ef8450" />
            </pattern>
            <linearGradient id="robot-paint" x1="0" y1="0" x2="0.9" y2="1">
              <stop stopColor="#ffe68a" />
              <stop offset="1" stopColor="#ffc747" />
            </linearGradient>
            <linearGradient id="beam" x1="0" x2="1">
              <stop stopColor="#31c8a0" stopOpacity="0.28" />
              <stop offset="1" stopColor="#31c8a0" stopOpacity="0.02" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="7"
                stdDeviation="5"
                floodColor="#284064"
                floodOpacity="0.16"
              />
            </filter>
          </defs>
          <rect x="16" y="30" width="608" height="345" rx="2" fill="#f1f1ec" />
          <rect x="16" y="30" width="608" height="345" rx="2" fill="url(#grid)" />
          <text x="41" y="67" className="svg-caption">
            TEST TRACK / 01
          </text>
          <path d={`M${noseX} 201 L${wallX} 140 L${wallX} 262 Z`} fill="url(#beam)" />
          <line
            x1={noseX}
            x2={wallX}
            y1="201"
            y2="201"
            stroke="#21aa8d"
            strokeWidth="2"
            strokeDasharray="5 6"
          />
          <g>
            <rect x={wallX} y="103" width="30" height="198" rx="2" fill="#ffc19a" />
            <rect x={wallX} y="103" width="30" height="198" rx="2" fill="url(#wall-stripes)" />
            <line x1={wallX} x2={wallX} y1="108" y2="296" stroke="#c16a37" strokeWidth="3" />
            <text x="575" y="329" textAnchor="middle" className="svg-label">
              WALL
            </text>
          </g>
          <g transform={`translate(${centerX}, 201)`} filter="url(#shadow)">
            <g
              className={
                running && (action === 'FORWARD' || action === 'SLOW') ? 'wheels moving' : 'wheels'
              }
            >
              <rect x="-31" y="-61" width="55" height="22" rx="8" fill="#253751" />
              <rect x="-31" y="39" width="55" height="22" rx="8" fill="#253751" />
              {[-20, -5, 10].map((x) => (
                <g key={x} stroke="#667894" strokeWidth="3">
                  <line x1={x} x2={x} y1="-58" y2="-45" />
                  <line x1={x} x2={x} y1="45" y2="58" />
                </g>
              ))}
            </g>
            <rect
              x="-49"
              y="-45"
              width="98"
              height="90"
              rx="25"
              fill="url(#robot-paint)"
              stroke="#ddaa2e"
              strokeWidth="2"
            />
            <rect x="18" y="-29" width="27" height="58" rx="13" fill="#20324d" />
            <circle cx="32" cy="-13" r="5" fill={crash ? '#ff7161' : '#a3f3e1'} />
            <circle cx="32" cy="13" r="5" fill={crash ? '#ff7161' : '#a3f3e1'} />
            <circle cx="-17" cy="0" r="16" fill="#fff0ac" stroke="#e8b937" strokeWidth="1.5" />
            <path
              d="M-21 -6 L-12 0 L-21 6"
              fill="none"
              stroke="#c38b15"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="-32" cy="-28" r="3" fill="#fff8d4" />
            <circle cx="-32" cy="28" r="3" fill="#fff8d4" />
          </g>
          <g transform={`translate(${Math.min(505, Math.max(90, centerX))}, 101)`}>
            <rect
              x="-62"
              y="-20"
              width="124"
              height="36"
              rx="3"
              fill={crash ? '#fa594e' : '#fff'}
              stroke={crash ? '#fa594e' : '#d1d2cc'}
            />
            <text textAnchor="middle" y="3" className={`svg-action ${crash ? 'white' : ''}`}>
              {crash ? 'OOPS!' : action || 'HELLO, WORLD'}
            </text>
          </g>
          {marks.map((mark) => (
            <g key={mark} transform={`translate(${wallX - mark * pixels}, 354)`}>
              <line y2="7" stroke="#91a5bd" />
              <text y="28" textAnchor="middle" className="svg-tick">
                {mark}
              </text>
            </g>
          ))}
          <text x="322" y="413" textAnchor="middle" className="svg-caption">
            DISTANCE TO WALL · CENTIMETRES
          </text>
        </svg>
        {crash && (
          <div className="crash-overlay" role="alert">
            <strong>CRASH!</strong>
            <span>Back to 80 cm. Try another approach.</span>
          </div>
        )}
      </div>
      <div className="arena-reading">
        <div>
          <span className="eyebrow">DISTANCE TO WALL</span>
          <strong data-testid="distance">
            {Math.round(distance)}
            <span>cm</span>
          </strong>
        </div>
        <div className="action-reading">
          <span className="eyebrow">LAST INSTRUCTION</span>
          <strong>{action || '—'}</strong>
        </div>
      </div>
      <div className="commands">
        <p>Give your robot an instruction</p>
        <div className="command-grid">
          {[
            ['FORWARD', '20 cm', 'blue'],
            ['SLOW', '10 cm', 'amber'],
            ['STOP', 'No movement', 'red'],
            ['PAUSE', 'Wait 2 seconds', 'teal'],
          ].map(([name, desc, color]) => (
            <div
              className={`command ${color} ${action === name && running ? 'active' : ''}`}
              key={name}
            >
              <code>{name}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <p className="command-note">Print an instruction to act. Each action takes 2 seconds.</p>
      </div>
    </section>
  );
}
