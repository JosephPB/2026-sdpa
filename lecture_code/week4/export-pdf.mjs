/** Render the current Week 4 source, execute its Python, and export a worked PDF. */
import { createServer } from 'node:http';
import { readFile, mkdir, rename, rm, mkdtemp, cp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const allowed = new Set(['--output', '--browser', '--source', '--python', '--site-url', '--help']);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i])) throw new Error(`Unknown option: ${args[i]}`);
  if (args[i] !== '--help' && (!args[++i] || args[i].startsWith('--'))) throw new Error('An option is missing its value.');
}
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
if (args.includes('--help')) {
  console.log('node export-pdf.mjs [--output file.pdf] [--browser chrome|msedge|chromium] [--python python3]');
  console.log('Renders week4.qmd and writes output/pdf/week4-student.pdf.');
  console.log('Includes quiz answers, real Python outputs, board snapshots and clickable hosted-board links.');
  console.log('pdf-examples.json configures sample inputs, expected errors, preceding cells and board snapshots.');
  console.log('--source folder selects a complete student source folder; renders in a temporary copy.');
  console.log('--site-url https://.../lecture_code/week4/ sets published activity links.');
  process.exit(0);
}
const sourceRoot = resolve(option('--source', dirname(fileURLToPath(import.meta.url))));
const destination = resolve(sourceRoot, option('--output', 'output/pdf/week4-student.pdf'));
if (extname(destination).toLowerCase() !== '.pdf') throw new Error('--output must name a .pdf file.');
const examples = JSON.parse(await readFile(resolve(sourceRoot, 'pdf-examples.json'), 'utf8'));
const siteUrl = new URL(option('--site-url', examples.siteUrl));
if (!['https:', 'http:'].includes(siteUrl.protocol) || !siteUrl.pathname.endsWith('/')) throw new Error('--site-url must be an HTTP(S) URL ending with /.');
const sourceBefore = await readFile(resolve(sourceRoot, 'week4.qmd'), 'utf8');
const python = option('--python', 'python3');
const version = spawnSync(python, ['-c', 'import sys; assert sys.version_info.major == 3; print(sys.version.split()[0])'], {encoding:'utf8'});
if (version.error || version.status !== 0) throw new Error('Python 3 is unavailable. Use --python /path/to/python3.');
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    const app = resolve(sourceRoot, '../../additional_materials/duckdash/node_modules/playwright/index.mjs');
    ({ chromium } = await import(pathToFileURL(app)));
  } catch {
    throw new Error('Playwright is missing. In additional_materials/duckdash, run npm ci once, then retry.');
  }
}
const root = await mkdtemp(resolve(tmpdir(), 'sdpa-week4-pdf-'));
let server, browser;
const temporary = destination + `.${process.pid}.tmp`;
try {
for (const name of ['week4.qmd', '_quarto.yml', 'theme.scss', 'includes.html', 'config.js', 'deck.js', 'code-cells.js', 'assets', 'activities', 'live', 'runtime']) {
  await cp(resolve(sourceRoot, name), resolve(root, name), {recursive:true});
}
console.log(`Rendering the latest week4.qmd (examples use Python ${version.stdout.trim()})…`);
const render = spawnSync('quarto', ['render', 'week4.qmd'], {cwd:root, stdio:'inherit', shell:false});
if (render.error) throw new Error(`Could not start Quarto: ${render.error.message}`);
if (render.status !== 0) throw new Error('Quarto did not finish successfully. No PDF was replaced.');

const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + pathname);
    const rel = relative(root, file);
    if (rel.startsWith('..') || isAbsolute(rel)) { response.writeHead(403).end(); return; }
    const contents = await readFile(file);
    response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'});
    response.end(contents);
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
const base = `http://127.0.0.1:${server.address().port}`;

  const browserName = option('--browser', 'chrome');
  try {
    browser = await chromium.launch({...(browserName === 'chromium' ? {} : {channel:browserName}), headless:true});
  } catch {
    throw new Error(`Could not launch ${browserName}. Install Chrome, or use --browser msedge with Microsoft Edge.`);
  }
  const context = await browser.newContext({viewport:{width:1600,height:900}, reducedMotion:'reduce'});
  const failures = [];
  context.on('page', page => {
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && new URL(response.url()).origin === base && !response.url().endsWith('/favicon.ico')) failures.push(response.url());
    });
  });
  const page = await context.newPage();
  await page.goto(`${base}/week4.html`);
  await page.waitForFunction(() => window.Reveal?.isReady());
  // Select every source code block, including .no-run examples omitted by the browser runtime.
  const cells = await page.locator('pre > code.python').evaluateAll(elements => {
    const counts = {};
    return elements.map((element, index) => {
      const slide = element.closest('section').id;
      return {index, slide, example:counts[slide] = (counts[slide] || 0) + 1,
        code:element.textContent.replace(/\n$/, '')};
    });
  });
  if (!cells.length) throw new Error('No Python examples were found.');
  const byKey = new Map(cells.map(cell => [`${cell.slide}:${cell.example}`, cell]));
  function preceding(cell, stack = []) {
    const key = `${cell.slide}:${cell.example}`;
    if (stack.includes(key)) throw new Error(`Circular continuation configuration: ${[...stack,key].join(' -> ')}`);
    const refs = examples.continuations?.[key] || [];
    return refs.flatMap(ref => {
      const earlier = byKey.get(ref);
      if (!earlier) throw new Error(`Missing prerequisite '${ref}' for '${key}'. Update pdf-examples.json.`);
      return [...preceding(earlier, [...stack,key]), earlier];
    });
  }
  const modules = Object.fromEntries(Object.entries(examples.modules || {}).map(([name,key]) => {
    const cell=byKey.get(key);
    if (!cell) throw new Error(`Missing module source ${key}`);
    return [name, cell.code];
  }));
  const results = [];
  for (const cell of cells) {
    const key = `${cell.slide}:${cell.example}`;
    if (examples.skip?.[key]) {
      results.push({...cell,skipped:true,display:examples.skip[key]});
      console.log(`Context-specific example: ${key}`);
      continue;
    }
    const setup = [...new Map(preceding(cell).map(item => [`${item.slide}:${item.example}`, item])).values()];
    const run = spawnSync(python, ['-c', pythonRunnerSource()], {
      cwd:root, encoding:'utf8', timeout:15000, maxBuffer:1024*1024,
      input:JSON.stringify({cell,setup,inputs:examples.inputs?.[key] || [],modules,}),
      env:{...process.env,PYTHONHASHSEED:'0',PYTHONIOENCODING:'utf-8'},
    });
    if (run.error || run.status !== 0) throw new Error(`Python failed on ${key}: ${run.error?.message || run.stderr}`);
    const result = JSON.parse(run.stdout);
    const pattern = examples.expectedErrors?.[key];
    const expectedError = !!result.error && !!pattern && result.errorType === pattern && !result.setupError;
    if (pattern && !expectedError) throw new Error(`Expected ${pattern} on ${key}; update pdf-examples.json if the exercise has changed.`);
    if (result.error && !expectedError) throw new Error(`Slide '${cell.slide}', example ${cell.example}: ${result.error}`);
    results.push({...cell,...result,expectedError,display:(result.output + (result.error ? '\n' + result.error : '')).trimEnd()});
    console.log(`Executed ${results.length}/${cells.length}: ${key}${expectedError ? ' (expected error)' : ''}`);
  }

  const frames = await page.locator('iframe[src^="activities/"]').evaluateAll(elements => elements.map((element,index) => ({
    index, src:element.getAttribute('src'), slide:element.closest('section').id, title:element.title,
  })));
  const boards = [];
  const boardPage = await context.newPage();
  await boardPage.setViewportSize({width:1600,height:900});
  for (const frame of frames) {
    const url = new URL(frame.src, base + '/');
    if (url.origin !== base) throw new Error(`Activity must be local: ${frame.src}`);
    await boardPage.goto(url.href);
    const state = examples.activities?.[frame.slide];
    for (const action of state?.actions || []) {
      const locator = boardPage.locator(action.selector);
      for (let i = 0; i < (action.repeat || 1); i++) {
        if (action.action === 'click') await locator.click();
        else if (action.action === 'fill') await locator.fill(action.value);
        else if (action.action === 'select') await locator.selectOption(action.value);
        else throw new Error(`Unsupported board action: ${action.action}`);
      }
    }
    if (state?.expect) await boardPage.locator(state.expect.selector).filter({hasText:state.expect.text}).waitFor();
    await boardPage.evaluate(() => document.fonts.ready);
    const height = await boardPage.locator("body").evaluate(body => Math.ceil(body.getBoundingClientRect().height));
    boards.push({...frame,url:new URL(frame.src,siteUrl).href,caption:state?.caption || 'Activity snapshot',image:(await boardPage.screenshot({clip:{x:0,y:0,width:1600,height:Math.max(450,height)},animations:"disabled"})).toString('base64')});
    console.log(`Captured activity: ${frame.slide}`);
  }
  await boardPage.close();
  const printPage = await context.newPage();
  // Insert genuine outputs and snapshots before Reveal calculates PDF page geometry.
  await printPage.route('**/code-cells.js', route => route.fulfill({contentType:'text/javascript',body:
    `(${hydratePrintView.toString()})(${JSON.stringify({results,boards,siteUrl:siteUrl.href})});`
  }));
  await printPage.route('**/deck.js', route => route.fulfill({contentType:'text/javascript',body:'/* Answers remain visible in the worked PDF. */'}));
  await printPage.goto(`${base}/week4.html?print-pdf`);
  await printPage.waitForFunction(() => window.__week4PdfReady === true);
  await printPage.evaluate(() => document.fonts.ready);
  await printPage.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  if (await printPage.locator('.pdf-output').count() !== results.filter(r=>r.display).length) throw new Error('Some Python outputs are missing.');
  if (await printPage.locator('.activity-static').count() !== frames.length) throw new Error('Some activity snapshots are missing.');
  const slides = await printPage.locator('.slides > .pdf-page > section').count();
  const pages = await printPage.locator('.pdf-page').count();
  const expectedSlides = await page.locator('.slides > section').count();
  if (slides !== expectedSlides || pages !== expectedSlides) throw new Error(`Expected ${expectedSlides} single-page slides, got ${slides} slides / ${pages} pages. Some content needs more room in print.`);
  const clipped = await printPage.evaluate(() => [...document.querySelectorAll('pre code,.pdf-output')]
    .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
    .map(element => element.closest('section')?.id));
  if (clipped.length) throw new Error('Printed code/output is clipped on: ' + [...new Set(clipped)].join(', '));
  // Reveal clears code-line anchors for print; empty hrefs must not become localhost links.
  await printPage.locator('a[href=""]').evaluateAll(links=>links.forEach(link=>link.removeAttribute('href')));
  const localLinks=await printPage.locator('a[href]').evaluateAll(links=>links.filter(link=>link.href.startsWith(location.origin)&&!link.getAttribute('href').startsWith('#')).map(link=>link.href));
  if(localLinks.length) throw new Error('PDF links point to the temporary server: '+localLinks.join(', '));
  if (failures.length) throw new Error('Browser errors: ' + [...new Set(failures)].join('; '));
  if (await readFile(resolve(sourceRoot,'week4.qmd'),'utf8') !== sourceBefore) throw new Error('The source changed during export. Please retry.');
  await mkdir(dirname(destination), {recursive:true});
  await printPage.pdf({path:temporary,printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true});
  await rename(temporary,destination);
  await writeFile(destination.replace(/\.pdf$/i, '.json'), JSON.stringify({slides:pages,examples:results.map(({slide,example,display,expectedError,skipped})=>({slide,example,display,expectedError:!!expectedError,skipped:!!skipped})),boards:boards.map(({slide,url,caption})=>({slide,url,caption}))},null,2));
  console.log(`Saved ${destination}`);
  console.log(`${pages} slides; ${results.filter(r=>!r.skipped).length} Python examples executed; ${results.filter(r=>r.skipped).length} app-only example; ${frames.length} activity snapshots; quiz answers included.`);
} finally {
  await browser?.close();
  if (server?.listening) await new Promise(done => server.close(done));
  await rm(temporary,{force:true});
  await rm(root,{recursive:true,force:true});
}

function hydratePrintView({results,boards,siteUrl}) {
  const style = document.createElement('style');
  style.textContent = `
    .reveal .pdf-output { font:24px/1.1 Menlo,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere;
      max-height:none !important; overflow:visible !important; background:#fff; border-left:3px solid #aaa; padding:8px 12px; margin:0 0 12px; }
    .reveal .pdf-output.error { color:#981d30; border-color:#981d30; }
    .reveal .pdf-output-label { font:18px Arial,sans-serif; color:#555; margin:8px 0 4px; }
    .reveal pre, .reveal pre code { font-size:28px !important; max-height:none !important; overflow:visible !important; }
    .reveal pre code { white-space:pre-wrap !important; overflow-wrap:anywhere; }
    .reveal .activity-static { display:block; width:100%; height:500px; max-height:500px; object-fit:contain; margin:0; }
    .reveal .pdf-board-caption { font:21px Arial,sans-serif; color:#555; margin:3px 0; }
    .reveal .answer[hidden] { display:block !important; }
    .reveal .brand-logo.pdf-brand { display:block !important; position:absolute; top:0; right:0; width:185px; }
    .reveal .brand-logo.pdf-brand img { margin:0 !important; max-height:none !important; max-width:none !important; }
    .brand-logo:not(.pdf-brand) { display:none !important; }
  `;
  document.head.append(style);
  const codes = [...document.querySelectorAll('pre > code.python')];
  if (codes.length !== results.length) throw new Error('Code changed while exporting. Please retry.');
  codes.forEach((code,index) => {
    const result = results[index];
    if (code.closest('section').id !== result.slide || code.textContent.replace(/\n$/,'') !== result.code) throw new Error('Code changed while exporting. Please retry.');
    if (!result.display) return;
    const block = code.parentElement.closest('div.sourceCode') || code.parentElement;
    const container = document.createElement('div');
    const label = document.createElement('p');label.className='pdf-output-label';
    label.textContent=result.skipped ? 'Where to run this' : result.expectedError ? 'Output (intentional error)' : 'Output';
    const output = document.createElement('div');output.className='pdf-output'+(result.error?' error':'');
    output.textContent=result.display;container.append(label,output);block.after(container);
  });
  const frames = [...document.querySelectorAll('iframe[src^="activities/"]')];
  if (frames.length !== boards.length) throw new Error('Activities changed while exporting. Please retry.');
  frames.forEach((frame,index) => {
    const board=boards[index];
    if (frame.getAttribute('src') !== board.src || frame.closest('section').id !== board.slide) throw new Error('Activities changed while exporting. Please retry.');
    const image=document.createElement('img');image.className='activity-static';
    image.src='data:image/png;base64,'+board.image;image.alt=board.title;
    const caption=document.createElement('p');caption.className='pdf-board-caption';caption.textContent=board.caption;
    const link=document.createElement('a');link.href=board.url;link.title='Open the interactive board';link.append(image);frame.replaceWith(link);link.after(caption);
  });
  document.querySelectorAll('a[href^="activities/"]').forEach(link=>{
    link.href=new URL(link.getAttribute('href'),siteUrl).href;link.textContent += ' (interactive)';
  });
  document.querySelectorAll('[data-faq-link]').forEach(link=>{
    if (/^https?:\/\//.test(window.WEEK4_FAQ_URL || '')) {
      link.href=window.WEEK4_FAQ_URL;link.textContent='Open this week’s FAQs';
    } else {
      const label=document.createElement('span');label.className=link.className;label.textContent='FAQ link to be shared in class';link.replaceWith(label);
    }
  });
  document.querySelectorAll('.notes').forEach(note=>note.remove());
  const brand=document.querySelector('.brand-logo');
  if(brand) document.querySelectorAll('.slides > section').forEach(slide=>{
    const clone=brand.cloneNode(true);clone.classList.add('pdf-brand');slide.append(clone);
  });
  document.querySelectorAll('.answer').forEach(answer=>answer.hidden=false);
  Reveal.on('pdf-ready',()=>{window.__week4PdfReady=true;});
}

// Function declaration avoids initialisation order issues with top-level execution above.
function pythonRunnerSource() {
  return String.raw`
import sys, json, io, contextlib, traceback, builtins, types
request = json.load(sys.stdin)
output = io.StringIO()
responses = iter(request['inputs'])
def sample_input(prompt=''):
    try:
        value = str(next(responses))
    except StopIteration:
        raise RuntimeError('No sample input response. Add one to pdf-examples.json.')
    print(str(prompt) + value)
    return value
builtins.input = sample_input
for name, code in request.get('modules', {}).items():
    module = types.ModuleType(name)
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(code, name + '.py', 'exec'), module.__dict__)
    sys.modules[name] = module
namespace = {'__name__': '__main__'}
error = ''; error_type = ''; setup_error = False
try:
    for cell in request['setup']:
        setup_error = True
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            exec(compile(cell['code'], cell['slide'], 'exec'), namespace)
    setup_error = False
    cell = request['cell']
    with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
        exec(compile(cell['code'], cell['slide'], 'exec'), namespace)
except Exception as exc:
    error_type = type(exc).__name__
    error = error_type + ': ' + str(exc)
    if setup_error: error = 'Prerequisite failed: ' + error
json.dump({'output': output.getvalue(), 'error': error, 'errorType': error_type, 'setupError': setup_error}, sys.stdout)
`;
}
