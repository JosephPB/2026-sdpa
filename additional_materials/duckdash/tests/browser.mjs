import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_ORIGIN || "http://127.0.0.1:8744";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("/tmp/duckdash-qa", { recursive: true });
try {
  await page.goto(base + "/additional_materials/duckdash/dist/");
  await page.getByRole("button", { name: "Run Python", exact: true }).waitFor();
  assert.equal(
    await page.getByText("Python · prices in pence", { exact: true }).count(),
    0,
  );
  assert.equal(await page.locator(".eyebrow").count(), 0);
  assert.equal(
    await page
      .getByText("Take an order. Give a duck. Watch the board.", {
        exact: true,
      })
      .count(),
    0,
  );
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    ),
    "rgb(250, 250, 247)",
  );
  await page.getByLabel("Kitchen speed").selectOption("10");
  await page.getByLabel("Customer", { exact: true }).fill("Sam");
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.locator('[data-order="101"]').waitFor();
  assert.match(
    await page.locator("[data-returned-order]").innerText(),
    /"customer": "Sam"/,
  );
  assert.match(
    await page.locator("[data-returned-order]").innerText(),
    /"total": 800/,
  );
  assert.match(
    await page.locator(".cm-content").innerText(),
    /send_to_kitchen\(details\)/,
  );
  await page.locator('[data-board="ready"] [data-order="101"]').waitFor();
  await page.screenshot({
    path: "/tmp/duckdash-qa/app-first.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Student specials" }).click();
  await page.getByLabel("Pizza", { exact: true }).selectOption("pepperoni");
  await page.getByLabel("Quantity", { exact: true }).selectOption("2");
  await page.getByLabel("Student special", { exact: true }).check();
  await page.getByLabel("Coupon", { exact: true }).fill("FLOCK5");
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.locator('[data-order="102"]').waitFor();
  assert.match(await page.locator('[data-order="102"]').innerText(), /£15\.00/);
  await page.screenshot({
    path: "/tmp/duckdash-qa/app-specials.png",
    fullPage: true,
  });
  await page.reload();
  await page.locator('[data-order="102"]').waitFor();
  assert.match(await page.locator(".next-number").innerText(), /103/);
  await page.getByRole("button", { name: "A duck with a number" }).click();
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.locator('[data-order="103"]').waitFor();
  assert.match(await page.locator(".console").innerText(), /103/);
  await page.getByRole("button", { name: "The group order" }).click();
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.locator('[data-order="104"]').waitFor();
  assert.match(await page.locator('[data-order="104"]').innerText(), /£27\.00/);
  await page.getByRole("button", { name: "The lunch rush" }).click();
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.locator('[data-order="107"]').waitFor();
  // A real infinite loop must not block the kitchen or the Stop control.
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText("while True:\n    pass");
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  assert.match(await page.locator(".console").innerText(), /Stopped/);
  await page.getByRole("button", { name: "The first order" }).click();
  await page
    .getByText("Send a price calculated in your IDE", { exact: true })
    .click();
  await page.getByLabel("Calculated price (£)").fill("7.50");
  await page
    .getByRole("button", { name: "Send to kitchen", exact: true })
    .click();
  await page.locator('[data-order="108"]').waitFor();
  assert.match(await page.locator('[data-order="108"]').innerText(), /£7\.50/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/duckdash-qa/app-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  // A missing return is shown at the kitchen boundary without consuming a number.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(
    'def make_order():\n    print("Only printed")\n\nsend_to_kitchen(make_order())',
  );
  await page.getByRole("button", { name: "Run Python", exact: true }).click();
  await page.getByText("Not accepted", { exact: true }).waitFor();
  assert.equal(await page.locator("[data-returned-order]").innerText(), "None");
  assert.match(await page.locator(".console").innerText(), /forget return/);
  assert.match(await page.locator(".next-number").innerText(), /109/);
  await page.screenshot({
    path: "/tmp/duckdash-qa/app-return-error.png",
    fullPage: true,
  });
  // The lecture must render all slides with the reference section intact.
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(base + "/lecture_code/week4/week4.html");
  await page.waitForFunction(() => window.Reveal?.isReady());
  const slides = await page.evaluate(() =>
    Reveal.getSlides().map((s) => ({
      id: s.id,
      title: s.querySelector("h2")?.textContent,
    })),
  );
  assert.equal(slides.length, 50);
  const overflows = [];
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate((i) => {
      Reveal.slide(i);
      Reveal.getCurrentSlide()
        .querySelectorAll(".fragment")
        .forEach((el) => el.classList.add("visible"));
    }, i);
    await page.waitForTimeout(80);
    const result = await page.evaluate(() => {
      const s = Reveal.getCurrentSlide();
      const box = s.getBoundingClientRect();
      const children = [...s.querySelectorAll("*")].filter(
        (el) =>
          !el.closest(".notes") &&
          getComputedStyle(el).display !== "none" &&
          el.getBoundingClientRect().height > 0,
      );
      const bottom = Math.max(
        ...children.map((el) => el.getBoundingClientRect().bottom),
      );
      const right = Math.max(
        ...children.map((el) => el.getBoundingClientRect().right),
      );
      return {
        id: s.id,
        bottom: Math.round((bottom - box.top) / Reveal.getScale()),
        right: Math.round((right - box.left) / Reveal.getScale()),
      };
    });
    if (result.bottom > 800 || result.right > 1603) overflows.push(result);
    if (
      [
        "function-anatomy",
        "opening",
        "binding",
        "scope",
        "recursion-board",
        "multiple-map",
        "kwargs",
        "modules",
        "iteration-recursion",
      ].includes(slides[i].id)
    )
      await page.screenshot({
        path: `/tmp/duckdash-qa/slide-${slides[i].id}.png`,
      });
  }
  await page.goto(base + "/lecture_code/week4/activities/scope.html");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  assert.match(await page.locator("#status").innerText(), /returns 700/);
  await page.getByLabel("Example").selectOption("list");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  assert.match(await page.locator("#status").innerText(), /returns None/);
  await page.goto(base + "/lecture_code/week4/activities/recursion.html");
  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  assert.match(await page.locator("#caller").innerText(), /2700/);
  assert.deepEqual(errors, []);
  assert.deepEqual(overflows, [], "Lecture content must fit on every slide");
  await writeFile(
    "/tmp/duckdash-qa/report.json",
    JSON.stringify({ slides: slides.length, overflows, errors }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        result: "Browser interactions passed",
        slides: slides.length,
        overflows,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
