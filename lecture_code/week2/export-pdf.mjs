/** Render the current student source, execute every Python cell, and print its outputs. */
import { createServer } from 'node:http';
import { readFile, mkdir, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  if (!args[index + 1]) throw new Error(`Missing value after ${name}`);
  return args[index + 1];
}
if (args.includes('--help')) {
  console.log('node export-pdf.mjs [--output file.pdf] [--browser chrome|msedge|chromium]');
  console.log('Renders week2.qmd, runs its examples, then writes output/pdf/week2-with-outputs.pdf.');
  console.log('Sample input responses and expected teaching errors are set in pdf-examples.json.');
  process.exit(0);
}
const root = resolve(option('--source', dirname(fileURLToPath(import.meta.url))));
const destination = resolve(root, option('--output', 'output/pdf/week2-with-outputs.pdf'));
const examples = JSON.parse(await readFile(resolve(root, 'pdf-examples.json'), 'utf8'));
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    const app = resolve(root, '../../additional_materials/robot-lab/node_modules/playwright/index.mjs');
    ({ chromium } = await import(pathToFileURL(app)));
  } catch {
    throw new Error('Playwright is missing. In additional_materials/robot-lab, run npm ci once, then retry.');
  }
}
console.log('Rendering the latest week2.qmd…');
const render = spawnSync('quarto', ['render', 'week2.qmd'], { cwd: root, stdio: 'inherit', shell: false });
if (render.error) throw new Error(`Could not start Quarto: ${render.error.message}`);
if (render.status !== 0) throw new Error('Quarto did not finish successfully. No PDF was replaced.');

const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.csv':'text/csv', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + pathname);
    const rel = relative(root, file);
    if (rel.startsWith('..') || isAbsolute(rel)) { response.writeHead(403).end(); return; }
    const contents = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(contents);
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const temporary = destination + '.tmp';
try {
  const browserName = option('--browser', 'chrome');
  try {
    browser = await chromium.launch({ ...(browserName === 'chromium' ? {} : {channel:browserName}), headless:true });
  } catch {
    throw new Error(`Could not launch ${browserName}. Install Chrome, or use --browser msedge with Microsoft Edge.`);
  }
  const context = await browser.newContext({ viewport:{width:1600,height:900}, reducedMotion:'reduce' });
  const failures = [];
  context.on('page', page => {
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) failures.push(response.url()); });
  });
  const page = await context.newPage();
  await page.goto(`${base}/week2.html`);
  await page.waitForFunction(() => window.Reveal?.isReady());
  await page.evaluate(() => document.fonts.ready);
  const cells = await page.locator('.code-cell').evaluateAll(elements => elements.map(element => ({
    index:Number(element.dataset.cell), slide:element.closest('section').id,
    code:element.querySelector('textarea').value, robot:element.dataset.robot === 'true',
  })));
  if (!cells.length) throw new Error('No runnable Python cells were found.');
  const results = [];
  for (const cell of cells) {
    const inputs = examples.inputs[cell.slide] || [];
    const result = await page.evaluate(async ({cell,inputs}) => {
      const response = await fetch('data/names.csv');
      if (!response.ok) throw new Error('The example CSV is missing.');
      const files = {'data/names.csv':await response.text()};
      return new Promise((resolve) => {
        const worker = new Worker('runtime/cell-worker.js');
        let output = '', inputIndex = 0, sensor = null;
        const finish = (error = '') => { clearTimeout(timer); worker.terminate(); resolve({output,error,sensor}); };
        const timer = setTimeout(() => finish('Export timeout: the example did not finish within 45 seconds.'), 45000);
        worker.onerror = () => finish('The Python worker could not start.');
        worker.onmessage = ({data}) => {
          if (data.type === 'output') output += data.text;
          if (data.type === 'sensor') sensor = {distance:data.distance,raw:data.raw};
          if (data.type === 'input') {
            if (inputIndex >= inputs.length) {
              finish(`No sample response for input() on slide '${cell.slide}'. Add it to pdf-examples.json.`);
              return;
            }
            const value = String(inputs[inputIndex++]);
            output += data.prompt + value + '\n';
            worker.postMessage({type:'input', value});
          }
          if (data.type === 'done') finish();
          if (data.type === 'error') finish(data.text);
        };
        worker.postMessage({type:'run',code:cell.code,robot:cell.robot,files});
      });
    }, {cell,inputs});
    const expected = (examples.expectedErrors[cell.slide] || []).some(pattern => result.error.includes(pattern));
    if (result.error && !expected) throw new Error(`Slide '${cell.slide}', example ${cell.index + 1}: ${result.error}`);
    let output = result.output;
    if (result.error.includes('excessive output')) {
      output = output.trimEnd().split('\n').slice(0, 3).join('\n') + '\n[Further repeated output omitted]\n';
    }
    if (result.error) output += (output && !output.endsWith('\n') ? '\n' : '') + result.error;
    results.push({...cell,...result,display:output || '(No printed output)',expectedError:expected});
    console.log(`Executed ${cell.index + 1}/${cells.length}: ${cell.slide}${expected ? ' (expected error)' : ''}`);
  }
  // Preserve a worked state of the interactive activity in the static PDF.
  await page.evaluate(() => Reveal.slide(Reveal.getIndices(document.getElementById('slicing-board')).h));
  await page.waitForTimeout(200);
  const board = page.frameLocator('.slice-frame');
  await board.locator('#expression').fill(':3');
  await board.locator('#expression').press('Enter');
  await board.locator('#answer').filter({hasText:'"PYT"'}).waitFor();
  const slicingImage = (await page.locator('.slice-frame').screenshot()).toString('base64');

  // A fresh print view would otherwise discard the browser's output state.
  // Hydrate those results before Reveal calculates the PDF page geometry.
  const printPage = await context.newPage();
  await printPage.route('**/code-cells.js', route => route.fulfill({contentType:'text/javascript',body:
    `(${hydratePrintView.toString()})(${JSON.stringify({results,slicingImage})});`
  }));
  await printPage.goto(`${base}/week2.html?print-pdf`);
  await printPage.waitForFunction(() => window.__week2PdfReady === true);
  await printPage.evaluate(() => document.fonts.ready);
  await printPage.waitForFunction(() => [...document.images].every(image => image.complete));
  await printPage.waitForTimeout(300);
  const printedCells = await printPage.locator('.pdf-output').count();
  if (printedCells !== cells.length) throw new Error(`Expected ${cells.length} outputs, found ${printedCells}.`);
  const overflow = await printPage.evaluate(() => [...document.querySelectorAll('pre code,.pdf-output')]
    .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
    .map(element => element.closest('section')?.id));
  if (overflow.length) throw new Error('Some printed code/output is clipped on: ' + [...new Set(overflow)].join(', '));
  if (failures.length) throw new Error('Browser errors: ' + failures.join('; '));
  await mkdir(dirname(destination), {recursive:true});
  await printPage.pdf({path:temporary,printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true});
  await rename(temporary,destination);
  console.log(`Saved ${destination}`);
  console.log(`${cells.length} examples executed. Sample input and intentional errors are included; the endless loop is excerpted.`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await rm(temporary,{force:true});
}

function hydratePrintView({results,slicingImage}) {
  const style = document.createElement('style');
  style.textContent = `
    .reveal .pdf-output { font: 24px/1.1 Menlo,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere;
      max-height:none !important; overflow:visible !important; background:#fff; border-left:3px solid #aaa; padding:8px 12px; margin:0 0 12px; }
    .reveal .pdf-output.error { color:#981d30; border-color:#981d30; }
    .reveal .pdf-output-label { font: 18px Arial,sans-serif; color:#555; margin:8px 0 4px; }
    .reveal .pdf-sensor { font:20px/1.3 Menlo,Consolas,monospace; color:#555; margin:4px 0 8px; }
    .reveal pre, .reveal pre code { max-height:none !important; overflow:visible !important; }
    .reveal .slice-static { display:block; width:100%; height:auto; max-height:550px; object-fit:contain; margin:0; }
    .reveal .brand-logo.pdf-brand { display:block !important; position:absolute; top:0; right:0; width:185px; }
    .reveal .brand-logo.pdf-brand img { margin:0 !important; max-height:none !important; max-width:none !important; }
    .brand-logo:not(.pdf-brand) { display:none !important; }
  `;
  document.head.append(style);
  const codes = [...document.querySelectorAll('pre > code.python')];
  if (codes.length !== results.length) throw new Error('Source changed while exporting. Please retry.');
  codes.forEach((code,index) => {
    const result = results[index];
    if (code.closest('section').id !== result.slide || code.textContent.replace(/\n$/,'') !== result.code) {
      throw new Error('Code changed while exporting. Please retry.');
    }
    const block = code.parentElement.closest('div.sourceCode') || code.parentElement;
    const container = document.createElement('div');
    const label = document.createElement('p'); label.className='pdf-output-label';
    label.textContent = result.expectedError ? 'Output (intentional error)' : 'Output';
    const output = document.createElement('div'); output.className='pdf-output'+(result.error?' error':'');
    output.textContent=result.display.trimEnd();container.append(label,output);
    if(result.robot && result.sensor){
      const sensor=document.createElement('p');sensor.className='pdf-sensor';
      sensor.textContent=`Final practice sensor: ${result.sensor.distance} cm; raw = ${JSON.stringify(result.sensor.raw)}`;
      container.append(sensor);
    }
    block.after(container);
  });
  const frame=document.querySelector('.slice-frame');
  const image=document.createElement('img');image.className='slice-static';
  image.src='data:image/png;base64,'+slicingImage;image.alt='Slicing PYTHON with [:3] selects P, Y and T and returns PYT.';
  frame.replaceWith(image);
  document.querySelectorAll('a[href^="activities/"]').forEach(link=>{
    const text=document.createElement('span');text.textContent='Use the HTML deck for the interactive board';link.replaceWith(text);
  });
  const brand=document.querySelector('.brand-logo');
  if(brand) document.querySelectorAll('.slides > section').forEach(slide=>{
    const clone=brand.cloneNode(true);clone.classList.add('pdf-brand');slide.append(clone);
  });
  // Print mode expands all fragments and places each lecture slide on its own page.
  Reveal.on('pdf-ready',()=>{window.__week2PdfReady=true;});
}
