import React, { useState, useEffect, useRef } from "react";
import Editor from "./Editor.jsx";
import { MENU, TOPPINGS, money } from "./menu.js";
import { stages } from "./examples.js";
import { upgradeDrafts } from "./drafts.js";
import { pythonValue } from "./format-details.js";
import { restoreKitchen, advanceKitchen, submit, collect } from "./kitchen.js";

const KEY = "sdpa-duckdash-v1";
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
const initial = load();
const requested = () =>
  Math.min(
    6,
    Math.max(
      1,
      Number(new URLSearchParams(location.search).get("stage")) ||
        initial.stage ||
        1,
    ),
  );
const initialOrder = {
  customer: "Guest",
  pizza: "classic",
  size: "regular",
  toppings: [],
  student: false,
  coupon: "",
  quantity: 1,
};
export default function App() {
  const [stage, setStage] = useState(requested),
    [drafts, setDrafts] = useState(() => upgradeDrafts(initial.drafts));
  const [kitchen, setKitchen] = useState(() => restoreKitchen(initial.kitchen));
  const [order, setOrder] = useState({ ...initialOrder, ...initial.order });
  const [speed, setSpeed] = useState(initial.speed || 1),
    [running, setRunning] = useState(false),
    [output, setOutput] = useState(""),
    [error, setError] = useState(false);
  const [received, setReceived] = useState([]);
  const [now, setNow] = useState(Date.now()),
    [manualPrice, setManualPrice] = useState("8.00"),
    [notice, setNotice] = useState(""),
    [showHelp, setShowHelp] = useState(false);
  const current = stages[stage - 1],
    code = drafts[stage] ?? current.code;
  const stateRef = useRef(kitchen),
    workerRef = useRef(null),
    watchRef = useRef(null),
    speedRef = useRef(speed);
  stateRef.current = kitchen;
  speedRef.current = speed;
  const updateKitchen = (next) => {
    stateRef.current = next;
    setKitchen(next);
  };
  const changeCode = (value) =>
    setDrafts((previous) => ({ ...previous, [stage]: value }));
  const changeStage = (value) => {
    setStage(value);
    const url = new URL(location.href);
    url.searchParams.set("stage", value);
    history.replaceState(null, "", url);
    setOutput("");
    setError(false);
    setReceived([]);
  };
  useEffect(() => {
    const listener = () => {
      const value = requested();
      if (!workerRef.current) setStage(value);
    };
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ stage, drafts, kitchen, order, speed }),
      );
    } catch {
      setNotice(
        "Storage is full or unavailable. Keep this tab open to retain your orders.",
      );
    }
  }, [stage, drafts, kitchen, order, speed]);
  useEffect(() => {
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      const updated = advanceKitchen(stateRef.current, time);
      if (updated !== stateRef.current) {
        const newlyReady = updated.orders.filter(
          (o) =>
            o.status === "ready" &&
            stateRef.current.orders.find((old) => old.number === o.number)
              ?.status === "preparing",
        );
        updateKitchen(updated);
        if (newlyReady.length)
          setNotice(
            "Ready to collect: " +
              newlyReady.map((o) => "#" + o.number).join(", ") +
              ".",
          );
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);
  const stop = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    clearTimeout(watchRef.current);
    setRunning(false);
  };
  useEffect(
    () => () => {
      workerRef.current?.terminate();
      clearTimeout(watchRef.current);
    },
    [],
  );
  const place = (request) => {
    const result = submit(
      stateRef.current,
      request,
      Date.now(),
      speedRef.current,
    );
    updateKitchen(result.state);
    setNotice(
      `Order ${result.order.number} is preparing. Write ${result.order.number} under the rubber duck.`,
    );
    return result.order.number;
  };
  const run = () => {
    if (workerRef.current) return;
    setOutput("");
    setError(false);
    setReceived([]);
    setRunning(true);
    const worker = new Worker(`${import.meta.env.BASE_URL}python-worker.js`);
    workerRef.current = worker;
    const fail = (message) => {
      setError(true);
      setOutput((text) => text + (text ? "\n" : "") + message);
      stop();
    };
    const watch = () => {
      clearTimeout(watchRef.current);
      watchRef.current = setTimeout(
        () =>
          fail(
            "Execution stopped after 8 seconds. Check your loop or base case. Orders already submitted keep cooking.",
          ),
        8000,
      );
    };
    watch();
    worker.onerror = (event) =>
      fail(
        `Python could not start. ${event.message || "Check that the app is served over HTTP and its runtime files are available."}`,
      );
    worker.onmessage = ({ data }) => {
      if (workerRef.current !== worker) return;
      if (data.type === "ready")
        worker.postMessage({
          type: "run",
          code,
          context: {
            order: effectiveOrder,
            menu_prices: Object.fromEntries(MENU.map((p) => [p.id, p.price])),
            menu_names: Object.fromEntries(MENU.map((p) => [p.id, p.name])),
            vegetarian: MENU.filter((p) => p.vegetarian).map((p) => p.id),
            last_order_number: stateRef.current.nextNumber - 1,
            orders: stateRef.current.orders.map(
              ({ number, customer, total, status }) => ({
                number,
                customer,
                total,
                status,
              }),
            ),
          },
        });
      if (data.type === "output")
        setOutput((text) => (text + data.text).slice(-50000));
      if (data.type === "submit") {
        try {
          const number = place(data.request);
          setReceived((old) => [...old, { details: data.request, number }]);
          worker.postMessage({ type: "ack", id: data.id, number });
          watch();
        } catch (e) {
          setReceived((old) => [
            ...old,
            { details: data.request, error: e.message },
          ]);
          worker.postMessage({ type: "ack", id: data.id, error: e.message });
        }
      }
      if (data.type === "done") stop();
      if (data.type === "error")
        fail(
          `${data.message.replace(/ on line \d+/g, "")}${data.line ? " (your code, line " + data.line + ")" : ""}`,
        );
    };
  };
  const visibleMenu = stage === 1 ? MENU.slice(0, 2) : MENU;
  const options = stage === 2 || stage === 3;
  const effectiveOrder = {
    ...order,
    ...(!options ? { size: "regular", toppings: [] } : {}),
    ...(stage !== 3 ? { student: false, coupon: "", quantity: 1 } : {}),
  };
  // Hide advanced choices without leaving them active in a simpler lesson.
  useEffect(() => {
    if (!options && (order.size !== "regular" || order.toppings.length))
      setOrder((o) => ({ ...o, size: "regular", toppings: [] }));
    if (stage !== 3 && (order.student || order.coupon || order.quantity !== 1))
      setOrder((o) => ({ ...o, student: false, coupon: "", quantity: 1 }));
    if (stage === 1 && !MENU.slice(0, 2).some((p) => p.id === order.pizza))
      setOrder((o) => ({ ...o, pizza: "classic" }));
  }, [stage]);
  const setField = (key, value) => setOrder((o) => ({ ...o, [key]: value }));
  const manual = () => {
    try {
      if (!/^\d+(\.\d{1,2})?$/.test(manualPrice))
        throw new Error(
          "Enter a price in pounds, with at most two decimal places.",
        );
      const details = {
        items: Array.from({ length: effectiveOrder.quantity || 1 }, () => ({
          pizza: effectiveOrder.pizza,
          size: effectiveOrder.size,
          toppings: effectiveOrder.toppings,
        })),
        customer: effectiveOrder.customer,
        total: Math.round(Number(manualPrice) * 100),
      };
      const number = place(details);
      setReceived([{ details, number, source: "manual" }]);
    } catch (e) {
      setNotice(e.message);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([code], { type: "text/x-python" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `duckdash-stage-${stage}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const preparing = kitchen.orders.filter((o) => o.status === "preparing"),
    ready = kitchen.orders.filter((o) => o.status === "ready"),
    collected = kitchen.orders.filter((o) => o.status === "collected");
  const orderCard = (o) => (
    <article
      className={`ticket ${o.status}`}
      key={o.number}
      data-order={o.number}
    >
      <div className="ticket-top">
        <strong>#{o.number}</strong>
        <span>{money(o.total)}</span>
      </div>
      <div className="customer">{o.customer}</div>
      <ul>
        {o.items.map((item, i) => (
          <li key={i}>
            {MENU.find((p) => p.id === item.pizza).name}
            {item.size === "large" ? " · large" : ""}
            {item.toppings.length ? (
              <small>+ {item.toppings.join(", ")}</small>
            ) : null}
          </li>
        ))}
      </ul>
      {o.status === "preparing" ? (
        <>
          <div className="cook-track" aria-hidden="true">
            <span
              style={{
                width: `${Math.max(0, Math.min(100, (100 * (now - o.createdAt)) / (o.readyAt - o.createdAt)))}%`,
              }}
            />
          </div>
          <div className="ticket-bottom">
            <span>
              {Math.max(0, Math.ceil((o.readyAt - now) / 1000))}s to go
            </span>
            <button
              className="text-button"
              onClick={() =>
                updateKitchen({
                  ...stateRef.current,
                  orders: stateRef.current.orders.map((x) =>
                    x.number === o.number
                      ? { ...x, readyAt: Date.now(), status: "ready" }
                      : x,
                  ),
                })
              }
            >
              Ready now
            </button>
          </div>
        </>
      ) : (
        <button
          className="collect"
          onClick={() => updateKitchen(collect(stateRef.current, o.number))}
        >
          Collected
        </button>
      )}
    </article>
  );
  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="wordmark" href="?stage=1" aria-label="DuckDash home">
          <img
            src={`${import.meta.env.BASE_URL}branding/duckdash-logo.png`}
            alt="DuckDash"
          />
        </a>
        <div className="brand-line">
          Pizza worth waddling for.
          <span>Fresh ideas. Hot pizza. Happy ducks.</span>
        </div>
        <div className="next-number">
          <span>Next duck</span>
          <strong>#{kitchen.nextNumber}</strong>
        </div>
      </header>
      <nav className="lessons" aria-label="Lesson stages">
        {stages.map((s) => (
          <button
            key={s.id}
            className={stage === s.id ? "selected" : ""}
            aria-current={stage === s.id ? "step" : undefined}
            disabled={running}
            onClick={() => changeStage(s.id)}
          >
            <span>{s.id.toString().padStart(2, "0")}</span>
            {s.title}
          </button>
        ))}
      </nav>
      <div className="lesson-heading">
        <div>
          <h1>{current.title}</h1>
          {current.brief && <p>{current.brief}</p>}
        </div>
        <div className="kitchen-controls">
          <label>
            <select
              aria-label="Kitchen speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={1}>1× · new orders</option>
              <option value={5}>5× · new orders</option>
              <option value={10}>10× · new orders</option>
            </select>
          </label>
          <button
            className="outline"
            onClick={() => setShowHelp(!showHelp)}
            aria-expanded={showHelp}
          >
            How to use
          </button>
        </div>
      </div>
      {showHelp && (
        <aside className="help">
          <strong>You run the front desk.</strong> Choose the customer’s order,
          edit the Python, then Run. All prices in the code are whole pence: 800
          means £8.00. The kitchen accepts your calculated price, including
          mistakes. Your <code>make_order</code> function returns a dictionary.
          Pass it to <code>send_to_kitchen(details)</code>, which returns an
          accepted order number. The kitchen shows the dictionary it receives.{" "}
          <code>print</code> only writes to the console. Orders cook in the
          background and survive refreshes in this browser. Each browser has its
          own kitchen. Stop ends the code, not orders already sent.{" "}
          <a href={`${import.meta.env.BASE_URL}branding/menu-copy.md`} download>
            Menu copy for Canva
          </a>
        </aside>
      )}
      <main className="workbench">
        <section
          className={`menu-panel ${stage > 1 ? "advanced-menu" : ""}`}
          aria-labelledby="menu-title"
        >
          <div className="panel-heading">
            <h2 id="menu-title">The menu</h2>
            <span>Regular 12″</span>
          </div>
          <div className="menu-items">
            {visibleMenu.map((p) => (
              <button
                key={p.id}
                className={`menu-item ${order.pizza === p.id ? "chosen" : ""}`}
                aria-pressed={order.pizza === p.id}
                disabled={stage >= 5}
                onClick={() => {
                  setField("pizza", p.id);
                }}
              >
                <div>
                  <strong>{p.name}</strong>
                  <b>{money(p.price)}</b>
                </div>
                <p>{p.description}</p>
                <span>
                  {p.vegetarian ? "V · " : ""}
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
          {stage === 3 && (
            <div className="special">
              <strong>A little something extra</strong>
              <p>
                Student: 20% off
                <br />
                DUCK10: 10% off
                <br />
                FLOCK5: £5 off £20+
              </p>
              <small>Best eligible single discount. No stacking.</small>
            </div>
          )}
          <form className="order-form" onSubmit={(e) => e.preventDefault()}>
            <h3>At the counter</h3>
            {stage >= 5 && (
              <p className="stage-note">
                The {stage === 5 ? "group basket" : "customer requests"} for
                this stage are listed in the editor. Edit them there.
              </p>
            )}
            <label>
              Customer
              <input
                disabled={stage === 6}
                value={order.customer}
                maxLength={60}
                onChange={(e) => setField("customer", e.target.value)}
              />
            </label>
            <label>
              Pizza
              <select
                aria-label="Pizza"
                disabled={stage >= 5}
                value={order.pizza}
                onChange={(e) => setField("pizza", e.target.value)}
              >
                {visibleMenu.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {options && (
              <>
                <label>
                  Size
                  <select
                    aria-label="Size"
                    value={order.size}
                    onChange={(e) => setField("size", e.target.value)}
                  >
                    <option value="regular">Regular 12″</option>
                    <option value="large">Large 16″ · +£2</option>
                  </select>
                </label>
                <fieldset>
                  <legend>Extras · £1 each</legend>
                  {TOPPINGS.map((t) => (
                    <label className="check" key={t}>
                      <input
                        type="checkbox"
                        checked={order.toppings.includes(t)}
                        onChange={(e) =>
                          setField(
                            "toppings",
                            e.target.checked
                              ? [...order.toppings, t]
                              : order.toppings.filter((x) => x !== t),
                          )
                        }
                      />
                      {t}
                    </label>
                  ))}
                </fieldset>
              </>
            )}
            {stage === 3 && (
              <>
                <label>
                  Quantity
                  <select
                    aria-label="Quantity"
                    value={order.quantity}
                    onChange={(e) =>
                      setField("quantity", Number(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} pizza{n === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={order.student}
                    onChange={(e) => setField("student", e.target.checked)}
                  />
                  Student special
                </label>
                <label>
                  Coupon
                  <input
                    value={order.coupon}
                    maxLength={20}
                    placeholder="DUCK10 or FLOCK5"
                    onChange={(e) =>
                      setField("coupon", e.target.value.toUpperCase())
                    }
                  />
                </label>
              </>
            )}
          </form>
        </section>
        <section className="code-panel" aria-labelledby="code-title">
          <div className="panel-heading">
            <h2 id="code-title">Your functions</h2>
          </div>
          <div className="code-toolbar">
            <button
              disabled={running}
              onClick={() => changeCode(current.starter)}
            >
              Load starter
            </button>
            <button disabled={running} onClick={() => changeCode(current.code)}>
              Worked example
            </button>
            <button onClick={download}>Save .py</button>
          </div>
          <Editor
            code={code}
            setCode={changeCode}
            running={running}
            run={run}
          />
          <div className="runbar">
            <button className="run" disabled={running} onClick={run}>
              {running ? "Running…" : "Run Python"}
            </button>
            <button
              className="outline"
              disabled={!running}
              onClick={() => {
                stop();
                setOutput(
                  (text) => text + "\nStopped. Submitted orders keep cooking.",
                );
              }}
            >
              Stop
            </button>
            <span>⌘ / Ctrl + Enter</span>
          </div>
          <div className="console-heading">
            <h3>Console</h3>
            <button
              className="text-button"
              onClick={() => {
                setOutput("");
                setError(false);
              }}
            >
              Clear
            </button>
          </div>
          <pre
            className={`console ${error ? "error" : ""}`}
            role="log"
            aria-live="polite"
          >
            {output || "Your printed output appears here."}
          </pre>
          <details className="api">
            <summary>Available in your code</summary>
            <p>
              <code>order</code>: customer, pizza, size, toppings, student,
              coupon, quantity.
              <br />
              <code>menu_prices</code>, <code>menu_names</code>,{" "}
              <code>vegetarian</code>, <code>last_order_number</code>,{" "}
              <code>orders</code> are snapshots at Run.
            </p>
            <pre>
              {"details = make_order(...)\nnumber = send_to_kitchen(details)"}
            </pre>
            <p>
              Your function returns a dictionary with customer (text), items (a
              list of pizza IDs or item dictionaries), and total (whole pence).
              You can also return order_number. send_to_kitchen receives that
              dictionary and returns the accepted ticket number. Each call sends
              one order.
            </p>
          </details>
          <details className="manual">
            <summary>Send a price calculated in your IDE</summary>
            <p>Use the customer and pizza selected at the counter.</p>
            <div className="manual-row">
              <label>
                Calculated price (£)
                <input
                  value={manualPrice}
                  inputMode="decimal"
                  onChange={(e) => setManualPrice(e.target.value)}
                />
              </label>
              <button className="run" onClick={manual}>
                Send to kitchen
              </button>
            </div>
          </details>
        </section>
        <section className="kitchen-panel" aria-labelledby="kitchen-title">
          <div className="panel-heading">
            <h2 id="kitchen-title">The kitchen</h2>
            <span className="live-dot">Open</span>
          </div>
          <details className="handoff" open>
            <summary>What the kitchen receives</summary>
            <p>
              <code>make_order(...)</code> returns <code>details</code>.<br />
              <code>send_to_kitchen(details)</code> sends that value.
            </p>
            <div className="expected-fields">
              Required: <code>customer</code>, <code>items</code>,{" "}
              <code>total</code>.<br />
              Optional: <code>order_number</code>. Total is whole pence.
            </div>
            <div className="received-values" aria-live="polite">
              {received.length ? (
                received.map((entry, index) => (
                  <div className="received-entry" key={index}>
                    <strong>
                      {entry.error
                        ? "Not accepted"
                        : `${entry.source === "manual" ? "IDE price entry · " : ""}Accepted as #${entry.number}`}
                    </strong>
                    <pre data-returned-order>{pythonValue(entry.details)}</pre>
                    {entry.error && (
                      <p className="handoff-error">{entry.error}</p>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <span className="example-label">
                    Expected shape · example only
                  </span>
                  <pre>
                    {
                      '{\n  "customer": "Sam",\n  "items": ["classic"],\n  "total": 800\n}'
                    }
                  </pre>
                </>
              )}
            </div>
          </details>
          {notice && (
            <div className="board-status" role="status" aria-live="polite">
              {notice}
            </div>
          )}
          <h3 className="board-title">
            Preparing <span>{preparing.length}</span>
          </h3>
          <div className="tickets" data-board="preparing">
            {preparing.length ? (
              preparing.map(orderCard)
            ) : (
              <p className="empty">The ovens are waiting.</p>
            )}
          </div>
          <h3 className="board-title ready-title">
            Ready <span>{ready.length}</span>
          </h3>
          <div className="tickets" data-board="ready" aria-live="polite">
            {ready.length ? (
              ready.map(orderCard)
            ) : (
              <p className="empty">Ready orders appear here.</p>
            )}
          </div>
          <details className="history">
            <summary>Collected ({collected.length})</summary>
            {collected.map((o) => (
              <p key={o.number}>
                #{o.number} · {o.customer} · {money(o.total)}
              </p>
            ))}
          </details>
          <button
            className="text-button clear-board"
            onClick={() => {
              if (
                confirm(
                  "Clear all orders from this board? The next order number will be kept.",
                )
              )
                updateKitchen({ ...stateRef.current, orders: [] });
            }}
          >
            Clear board
          </button>
        </section>
      </main>
      <footer>
        DuckDash is a fictional takeaway for SDPA. Imaginary pizzas. Real
        functions.
      </footer>
    </div>
  );
}
