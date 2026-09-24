export default function Detector({ distance, raw, action }) {
  const points = Array.from({ length: 161 }, (_, i) => {
    const x = i * 5;
    const wave = Math.sin(i * 0.27) * 5 + Math.sin(i * 0.69) * 2;
    const phase = i % 40;
    const pulse = phase > 13 && phase < 23 ? Math.sin(((phase - 13) / 10) * Math.PI) * -36 : 0;
    return `${x},${52 + wave + pulse}`;
  }).join(' ');
  return (
    <section className="detector" aria-labelledby="detector-title">
      <div className="detector-top">
        <h2 id="detector-title">Distance detector</h2>
        <span className="device-model">SDPA · D01</span>
      </div>
      <div className="scope-body">
        <div className="scope-screen">
          <div className="scope-screen-top">
            <span>
              <i /> SIGNAL LIVE
            </span>
            <span>cm</span>
          </div>
          <div className="scope-measurement">
            <output data-testid="detector-value">
              {String(Math.round(distance)).padStart(3, '0')}
            </output>
            <span>DISTANCE</span>
          </div>
          <svg
            className={`wave ${action === 'STOP' ? 'settled' : ''}`}
            viewBox="0 0 400 85"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g className="wave-scroll">
              <polyline points={points} />
            </g>
          </svg>
          <div className="raw-reading">
            <code>
              raw = <output data-testid="raw">{JSON.stringify(raw)}</output>
            </code>
          </div>
        </div>
        <div className="scope-controls" aria-hidden="true">
          <span>GAIN</span>
          <div className="dial" />
          <span>RANGE</span>
          <div className="dial small" />
          <i className="power-light" />
          <span>ON</span>
        </div>
      </div>
    </section>
  );
}
