import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [],
  failedRequests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400 && r.url().includes("127.0.0.1"))
    failedRequests.push([r.status(), r.url()]);
});
try {
  await page.goto(
    (process.env.TEST_ORIGIN || "http://127.0.0.1:8744") +
      "/lecture_code/week4/week4.html",
  );
  await page.waitForFunction(() => window.Reveal?.isReady());
  assert.equal(
    await page.locator("[data-faq-link]").getAttribute("href"),
    null,
  );
  const appLinks = await page
    .locator(".duckdash-link")
    .evaluateAll((links) =>
      links.map((a) => ({
        stage: a.dataset.stage,
        href: a.href,
        target: a.target,
      })),
    );
  assert.deepEqual(
    appLinks.map((a) => a.stage),
    ["1", "2", "3", "4", "5", "6"],
  );
  assert(
    appLinks.every(
      (a) =>
        a.target === "duckdash" &&
        new URL(a.href).searchParams.get("stage") === a.stage,
    ),
  );
  const slides = await page.evaluate(() => Reveal.getSlides().map((s) => s.id));
  const timing = await page.evaluate(() =>
    Reveal.getSlides().map((s) => ({
      id: s.id,
      notes: s.querySelector(".notes")?.textContent || "",
    })),
  );
  assert(
    timing.every((s) => s.notes.includes("Timing:")),
    "Every slide needs a timing cue",
  );
  let end = 0;
  for (const slide of timing.filter((s) => !s.id.startsWith("reference"))) {
    const match = slide.notes.match(/Timing: minute (\d+)–(\d+)/);
    assert(match, slide.id);
    assert.equal(Number(match[1]), end);
    end = Number(match[2]);
    assert(slide.notes.includes("Move on by minute " + end), slide.id);
  }
  assert.equal(end, 120);
  const outcomes = [],
    overflows = [];
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate((i) => {
      Reveal.slide(i);
      Reveal.getCurrentSlide()
        .querySelectorAll(".fragment")
        .forEach((el) => el.classList.add("visible"));
    }, i);
    const slide = page.locator("section.present");
    const buttons = slide.getByRole("button", {
      name: "Reveal answer",
      exact: true,
    });
    if (await buttons.count()) await buttons.click();
    const cells = slide.locator(".code-cell");
    for (let j = 0; j < (await cells.count()); j++) {
      const cell = cells.nth(j);
      await cell.locator("[data-action=run]").click();
      await cell
        .locator(".cell-status")
        .filter({ hasText: /^(Complete|Error)$/ })
        .waitFor();
      outcomes.push({
        slide: slides[i],
        cell: j,
        status: await cell.locator(".cell-status").innerText(),
        output: await cell.locator(".cell-output").innerText(),
      });
    }
    const measure = await page.evaluate(() => {
      const s = Reveal.getCurrentSlide(),
        b = s.getBoundingClientRect();
      const els = [...s.querySelectorAll("*")].filter(
        (e) =>
          !e.closest(".notes") &&
          !e.closest(".cell-output") &&
          getComputedStyle(e).display !== "none" &&
          e.getBoundingClientRect().height > 0,
      );
      return {
        slide: s.id,
        bottom: Math.round(
          (Math.max(...els.map((e) => e.getBoundingClientRect().bottom)) -
            b.top) /
            Reveal.getScale(),
        ),
        right: Math.round(
          (Math.max(...els.map((e) => e.getBoundingClientRect().right)) -
            b.left) /
            Reveal.getScale(),
        ),
      };
    });
    if (measure.bottom > 800 || measure.right > 1603) overflows.push(measure);
  }
  const unexpected = outcomes.filter(
    (r) =>
      r.status === "Error" && !["arguments-quiz", "clinic"].includes(r.slide),
  );
  const report = {
    checkedSlides: slides.length,
    runnableCells: outcomes.length,
    outcomes,
    overflows,
    unexpected,
    errors,
    failedRequests,
  };
  await writeFile(
    "/tmp/duckdash-qa/final-review.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        checkedSlides: slides.length,
        runnableCells: outcomes.length,
        overflows,
        unexpected,
        errors,
        failedRequests,
      },
      null,
      2,
    ),
  );
  assert.deepEqual(unexpected, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  assert.deepEqual(overflows, []);
} finally {
  await browser.close();
}
