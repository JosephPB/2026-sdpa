import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const base = process.env.TEST_URL || 'http://localhost:5173/';
await mkdir('test-results', { recursive: true });
try {
  await page.goto(base);
  await page.locator('.cm-content').waitFor();
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  const distance = () => page.getByTestId('distance').innerText();
  const reset = () => page.getByRole('button', { name: 'Reset robot' }).click();
  const edit = (code) => page.locator('.cm-content').fill(code);
  const run = () => page.getByRole('button', { name: 'Run', exact: true }).click();
  const done = () =>
    page.getByRole('status').filter({ hasText: 'Run complete' }).waitFor({ timeout: 18000 });
  const output = () => page.getByTestId('console-output').innerText();

  assert.equal(await distance(), '80cm');
  assert.equal(await page.getByTestId('raw').innerText(), '"  d:080  "');
  assert.equal(await page.getByLabel('Try an example').inputValue(), 'blank');
  assert.equal(await page.locator('.cm-content').textContent(), '');
  await page.getByLabel('Try an example').selectOption('branching');
  await run();
  await page.waitForTimeout(900);
  const intermediate = parseInt(await distance());
  assert(intermediate > 60 && intermediate < 80, 'movement must be gradual');
  assert.equal(
    await page.getByTestId('raw').innerText(),
    `"  d:${String(intermediate).padStart(3, '0')}  "`,
  );
  await done();
  assert.equal(await distance(), '60cm');
  console.log('PASS gradual one-step movement and live detector');

  await reset();
  await page.getByLabel('Try an example').selectOption('while');
  const started = Date.now();
  await run();
  await done();
  assert.equal(await distance(), '20cm');
  assert(Date.now() - started >= 7800, 'four instructions must each wait two seconds');
  assert.equal((await output()).trim(), 'FORWARD\nFORWARD\nFORWARD\nSTOP');
  console.log('PASS while loop, fresh raw and two-second pacing');

  await reset();
  await page.getByLabel('Try an example').selectOption('for');
  await run();
  await done();
  assert.equal(await distance(), '20cm');
  assert.equal((await output()).trim(), 'FORWARD\nFORWARD\nPAUSE\nFORWARD\nSTOP');
  console.log('PASS for loop, PAUSE, STOP and break');

  await reset();
  await edit('print("SLOW")');
  await run();
  await done();
  assert.equal(await distance(), '70cm');
  await edit('print("STOP")\nprint("FORWARD")');
  await run();
  await done();
  assert.equal(await distance(), '50cm');
  console.log('PASS SLOW and distinction between printed STOP and interrupting execution');

  await reset();
  await edit('while True:\n    pass');
  await run();
  await page.waitForTimeout(400);
  const stopStarted = Date.now();
  await page.getByRole('button', { name: 'Stop execution' }).click();
  assert(Date.now() - stopStarted < 1000);
  assert.equal(await distance(), '80cm');
  await edit('print("FORWARD")');
  await run();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Stop execution' }).click();
  const frozen = await distance();
  await page.waitForTimeout(1700);
  assert.equal(await distance(), frozen);
  console.log('PASS interrupt busy Python and freeze movement');

  await reset();
  await edit('print("FORWARD")\nprint("FORWARD")');
  await run();
  await page.waitForTimeout(500);
  await reset();
  await page.waitForTimeout(2300);
  assert.equal(await distance(), '80cm');
  console.log('PASS reset cancels pending commands');

  await page.getByLabel('Start at').fill('20');
  await page.getByLabel('Start at').press('Tab');
  assert.equal(await distance(), '20cm');
  await edit('print("FORWARD")\nprint("SLOW")');
  await run();
  await page.getByRole('alert').filter({ hasText: 'CRASH!' }).waitFor();
  await page.screenshot({ path: 'test-results/crash.png', fullPage: true });
  await page.getByRole('status').filter({ hasText: 'Reset to 80 cm after crash' }).waitFor();
  assert.equal(await distance(), '80cm');
  assert(!(await output()).includes('SLOW'));
  console.log('PASS crash overlay, cancellation and reset to 80');

  await page.getByLabel('Start at').fill('80');
  await page.getByLabel('Start at').press('Tab');
  await edit('if True\n    print("FORWARD")');
  await run();
  await page.getByRole('alert').filter({ hasText: 'SyntaxError' }).waitFor();
  await edit('print(raw)');
  await run();
  await done();
  assert.equal((await output()).trim(), 'd:080');
  console.log('PASS Python errors and recovery');

  const second = await context.newPage();
  await second.goto(base);
  await second.locator('.cm-content').waitFor();
  await edit('print("FORWARD")');
  await run();
  await done();
  assert.equal(await second.getByTestId('distance').innerText(), '80cm');
  await second.close();
  console.log('PASS independent browser sessions');

  await reset();
  await page.getByLabel('Try an example').selectOption('branching');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'mobile must not overflow horizontally',
  );
  assert.deepEqual(errors, []);
  console.log('PASS mobile layout and no browser exceptions');
} finally {
  await browser.close();
}
