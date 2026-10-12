# DuckDash

A fictional pizza takeaway for SDPA Week 4. The lecturer runs the front desk and writes Python functions; student volunteers are customers and keep a rubber duck with their accepted order number underneath.

## Open the completed app

The `dist/` folder is ready to serve. From the course repository root:

```sh
python3 -m http.server 8744 --bind 127.0.0.1
```

Open `http://127.0.0.1:8744/additional_materials/duckdash/dist/` and the slides at `http://127.0.0.1:8744/lecture_code/week4/week4.html`.

Do not double-click the app HTML: the Python worker requires HTTP. No accounts, API keys or remote Python service are needed. The Python runtime is bundled. Google fonts are optional; local fallback fonts work without internet.

## Teaching flow

1. **The first order:** start with Load starter (a declared price dictionary and straight-line lookup). Take two orders using manual price entry. After introducing functions in the slides, switch to Worked example to define, call and return.
2. **Make it yours:** full menu, large size and toppings; parameters, defaults, lists.
3. **Student specials:** quantity, student discount and coupons; decomposition and best eligible discount.
4. **A duck with a number:** regular pizzas, explicit next-number function, tuple returns and scope.
5. **The group order:** edit a basket of pizzas in the code; recursive total. Customer field names the group.
6. **The lunch rush:** edit the requests in code; lambda, map, filter, sorting keys and a batch of submissions.

The stage selector changes the lesson, not the kitchen. Each stage retains its own editor draft in this browser. A `?stage=3` URL opens a particular stage. The page uses an off-white background and keeps the top-level labels minimal. Worked examples and starters deliberately replace the current stage's draft when clicked. Save `.py` downloads the editor contents.

The menu, Python editor, Preparing board and Ready board stay together. Menu descriptions condense on the expanded menu so the customer controls fit a lecture display. Lower-width layouts stack the kitchen. Use the browser's full-screen mode for projection.

## Running an order

- Select the customer's choices at the counter. The editor's marked **Counter inputs** block changes visibly to match; Run executes the code shown. You can also edit those literals directly. Changing a counter control replaces only that marked block, preserving your functions and price dictionary.
- Write or change your functions, then **Run Python** (Cmd/Ctrl+Enter).
- `make_order(...)` calls your other functions and returns a dictionary. `details` stores that returned value. `send_to_kitchen(details)` explicitly passes it to the kitchen, which displays exactly what it received. `print` only displays output.
- Write the number **returned by the accepted submission** under the rubber duck. The kitchen rejects reused numbers.
- Orders move from **Preparing** to **Ready** after their own delay. Use **Collected** when the customer collects.
- **Ready now** lets the lecturer finish a ticket immediately. Kitchen speed 1×, 5× or 10× applies to new orders only.
- Use **Send a price calculated in your IDE** if you want to calculate in the terminal, then enter the pound amount. It uses the currently selected customer/order and accepts that total without recalculating it.
- **Stop** interrupts Python. Already accepted orders keep cooking. An error later in a script does not undo earlier submissions. Re-running submission code creates new orders.
- **Clear board** removes tickets but preserves the next number. **Reset orders** clears all tickets, including collected ones, and restarts at **11**, after confirmation. Your code and customer choices stay. Reset before a new demonstration, before distributing ducks. Existing saved kitchens keep their numbers until explicitly reset.

## Python interface

All prices passed through Python are **whole pence**. A total of `800` means £8.00. Zero is a valid teaching price. `None`, negative/fractional prices, unknown pizzas and duplicate ticket IDs are rejected. There is intentionally no automatic correction of a learner's calculated price.

All examples explicitly declare the data they use. `menu_prices` is an ordinary, editable Python dictionary. Stages 1–5 declare `order` in the marked input block; stage 4 also declares `last_order_number` (10 initially). Stage 5 declares its basket; stage 6 declares its requests and vegetarian IDs. The runtime does not inject these variables.

`from duckdash import send_to_kitchen` explicitly imports the simulator connection. Treat that one line as supplied plumbing until the modules section. The first starter needs no import because it only calculates and prints a price.

```python
from duckdash import send_to_kitchen

menu_prices = {"classic": 800, "pepperoni": 1000}
order = {"customer": "Sam", "pizza": "classic"}

def pizza_price(pizza):
    return menu_prices[pizza]

def make_order(pizza, customer):
    return {
        "customer": customer,
        "items": [pizza],
        "total": pizza_price(pizza)
    }

details = make_order(order["pizza"], order["customer"])
number = send_to_kitchen(details)
```

The first return sends a number back to `make_order`. The next return sends a dictionary back to its caller. `send_to_kitchen` receives that dictionary and returns the accepted order number. A function returning or printing by itself does not place an order; the explicit sending call does. The kitchen never reads a particular variable name or parses console text. You can call the returned value `details`, `ticket`, or another name.

**Required dictionary fields:** `customer` (text), `items` (a list of 1–20 pizzas), and `total` (whole pence for the entire order). **Optional:** `order_number` (an unused whole number, at least the kitchen's next number). Unknown field names are rejected with the expected names. `None` produces a reminder to return a dictionary.

Each item is either a pizza ID such as `"classic"`, or a dictionary such as `{"pizza": "classic", "size": "large", "toppings": ["olives"]}`. Size defaults to regular and toppings to an empty list. Multiple copies are represented as multiple list entries. A group order uses the same format, with several pizza IDs. The Python examples calculate the total; the kitchen accepts valid supplied totals, even if the calculation is wrong.

The **What the kitchen receives** panel starts with a labelled example of the required shape. Every send displays the actual received dictionary and either an accepted number or a validation error. A batch shows each received record. The panel is independent of printed output and resets for each Run. Collapse it for more board space.

Leave `order_number` out for automatic assignment. In the ticket exercise, include the value returned by your next-number function. `last_order_number` is visible in the input block and is updated after each accepted order. Within one Run, update a local counter between explicit-number sends, or use automatic numbering.

Previously edited drafts using `submit_order` or `submit_basket` remain supported. Those compatibility helpers build the same dictionary and pass it to `send_to_kitchen`. Untouched examples migrate to the new versions automatically; custom draft logic is retained, with any formerly supplied data and helper imports added as visible declarations. New catalogue examples include the counter-managed input block; custom legacy literals can be edited directly. Click Worked example to replace the current draft deliberately.

Each Run starts a **fresh Python worker**. Define your functions in the editor on that run; prior Python variables do not persist. Kitchen state and per-stage code drafts do persist. The interpreter is Skulpt in Python 3 mode, matching Robot Lab's approach. It supports the examples taught here but is not full CPython. Use the IDE for arbitrary local-file modules; the provided module example lives in `lecture_code/week4/live/modules`.

## Kitchen model

Each pizza has an invented preparation time of 25–55 seconds. Large adds ten seconds; each extra topping adds five. For a multi-pizza order, pizzas prepare in parallel, and the ticket becomes Ready when the slowest one finishes. Orders also prepare in parallel. Timers use absolute stored deadlines, so switching tabs or refreshing catches up correctly.

State stays in localStorage for this origin and browser. This is a lecturer-operated local simulation, **not a shared multi-device ordering backend**. Each browser has its own kitchen. Do not operate the same kitchen from simultaneous tabs: use the single named app tab linked from the slides. Clearing browser storage removes state. No real payments are taken or personal information sent anywhere.

## Brand and menu

`public/branding/duckdash-logo.png` is the transparent logo for Canva. `menu-copy.md` contains descriptions, menu prices, specials and coupon text. The local `brand-notes.md` contains palette/type guidance and the exact built-in image-generation prompt. The logo and menu copy are included in the GitHub deployment; brand notes remain local.

Regular prices: Classic 800; Pepperoni 1000; Garden 900; Spicy 1100; Pesto 1000; Four Cheese 1200. Large +200; each extra +100. Student saves 20%, DUCK10 saves 10%, FLOCK5 saves 500 on a pre-discount subtotal of at least 2000. Choose the greatest eligible saving; no stacking. Percentage **discount amounts** round half up to a penny.

## Development

Node 22.12+ or 24:

```sh
npm ci
npm run dev
npm test
npm run build
```

The additional `node tests/final-review.mjs` check runs every slide code cell, opens the answers, and verifies the timing cues and handoff.

For browser checks, serve the repository root on port 8744, then `npm run test:browser`. Override `TEST_ORIGIN` for a different port. The browser checks use installed Chrome and also inspect the rendered Week 4 deck. Screenshots/report go to `/tmp/duckdash-qa`.

## GitHub Pages deployment

The shared `.github/workflows/webapps.yml` workflow at the repository root is named **Deploy Robot Lab and DuckDash**. It installs locked dependencies, runs each app's tests, builds both apps, and publishes a single Pages artifact containing both. Changes to either app on `main` trigger it automatically. You can also select **Actions → Deploy Robot Lab and DuckDash → Run workflow** on `main`.

In **Settings → Pages → Build and deployment**, keep **GitHub Actions** as the source, as used for Robot Lab.

After a successful deployment, DuckDash is available at:

https://josephpb.github.io/2026-sdpa/additional_materials/duckdash/

You can link directly to a stage, for example `?stage=3`. The public URL has no `dist/` segment. Robot Lab keeps its existing URL and the project-root redirect. Only built app assets are uploaded; lecture sources and other repository files are excluded. Both apps share one deployment so updating one preserves the other.

The Week 4 slides remain a separate local artifact. Their DuckDash links already use this hosted URL, with the matching `?stage=1` through `?stage=6` exercise selected.

