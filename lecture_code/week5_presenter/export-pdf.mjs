/** Export the current Quarto Week 5 deck as a one-slide-per-page PDF. */
import {createServer} from 'node:http';
import {readFile,mkdir,rename,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {dirname,resolve,extname,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const allowed=new Set(['--output','--browser','--help']);
for(let i=0;i<args.length;i++){
  if(!allowed.has(args[i]))throw new Error(`Unknown option: ${args[i]}`);
  if(args[i]!=='--help' && (!args[i+1]||args[i+1].startsWith('--')))throw new Error(`Missing value for ${args[i]}`);
  if(args[i]!=='--help')i++;
}
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1]}
if(args.includes('--help')){
  console.log('node export-pdf.mjs [--output path.pdf] [--browser chrome|msedge|chromium]');
  console.log('Renders the current week5.qmd, runs each browser Python cell, and writes a PDF.');
  console.log('Run python3 generate_variants.py first when the full deck has changed.');
  process.exit(0);
}
let config={kind:'full',output:'output/pdf/week5-full.pdf'};
try{config=JSON.parse(await readFile(resolve(root,'pdf-config.json'),'utf8'))}catch{}
const destination=resolve(root,option('--output',config.output));
if(extname(destination).toLowerCase()!=='.pdf')throw new Error('--output must be a PDF path');
const sourceBefore=await readFile(resolve(root,'week5.qmd'),'utf8');
if(sourceBefore.includes('{.notes}'))throw new Error('The deck still contains speaker notes');
if(config.kind==='lecture' && sourceBefore.includes('{.answer}'))throw new Error('Lecture deck contains quiz answers');
const render=spawnSync('quarto',['render','week5.qmd'],{cwd:root,stdio:'inherit',shell:false});
if(render.error||render.status!==0)throw new Error('Quarto render failed; existing PDF kept');
let chromium;
try{({chromium}=await import('playwright'))}
catch{
  const candidates=[
    process.env.SDPA_PLAYWRIGHT_MODULE,
    resolve(root,'../../additional_materials/robot-lab/node_modules/playwright/index.mjs'),
    resolve(process.env.HOME||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'),
  ].filter(Boolean);
  for(const candidate of candidates){try{({chromium}=await import(pathToFileURL(candidate)))}catch{}}
}
if(!chromium)throw new Error('Playwright is unavailable. Install it in additional_materials/robot-lab or set SDPA_PLAYWRIGHT_MODULE.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+pathname),rel=relative(root,file);
    if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
  }catch{res.writeHead(404).end('Not found')}
});
let browser;
const temporary=destination+`.${process.pid}.tmp`;
try{
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
  const base=`http://127.0.0.1:${server.address().port}`;
  const browserName=option('--browser','chrome');
  browser=await chromium.launch({...(browserName==='chromium'?{}:{channel:browserName}),headless:true});
  const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'});
  const failures=[];
  context.on('page',page=>{
    page.on('pageerror',error=>failures.push(error.message));
    page.on('response',response=>{
      if(response.status()>=400&&new URL(response.url()).origin===base&&!response.url().endsWith('/favicon.ico'))failures.push(response.url());
    });
  });
  const live=await context.newPage();
  await live.goto(`${base}/week5.html`);
  await live.waitForFunction(()=>window.Reveal?.isReady());
  const slideCount=await live.locator('.slides > section').count();
  const outputs=[];
  const cells=live.locator('.code-cell');
  for(let i=0;i<await cells.count();i++){
    const cell=cells.nth(i);
    await cell.locator('[data-action="run"]').evaluate(button=>button.click());
    await cell.locator('.cell-status').filter({hasText:/^(Complete|Error|Stopped)$/}).waitFor({state:'attached',timeout:20000});
    const status=await cell.locator('.cell-status').innerText();
    if(status!=='Complete')throw new Error(`Python cell ${i+1} ended with ${status}: ${await cell.locator('.cell-output').innerText()}`);
    outputs.push({index:Number(await cell.getAttribute('data-cell')),
      text:(await cell.locator('.cell-output').innerText()).replace(/^\(No printed output\)$/,'')});
  }
  const print=await context.newPage();
  await print.route('**/code-cells.js',route=>route.fulfill({contentType:'text/javascript',body:
    `(${hydratePrintView.toString()})(${JSON.stringify({outputs,kind:config.kind})});`
  }));
  // deck.js normally creates quiz-answer buttons. Print shows the full version's answers directly.
  await print.route('**/deck.js',route=>route.fulfill({contentType:'text/javascript',body:'/* Static PDF view. */'}));
  await print.goto(`${base}/week5.html?print-pdf`);
  await print.waitForFunction(()=>window.Reveal?.isReady()&&document.querySelectorAll('.pdf-page').length>0,{timeout:30000});
  await print.evaluate(()=>document.fonts.ready);
  await print.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  await print.waitForFunction(()=>window.__week5PdfReady===true);
  const pages=await print.locator('.pdf-page').count();
  if(pages!==slideCount)throw new Error(`Print layout produced ${pages} pages for ${slideCount} slides`);
  const outputCount=await print.locator('.pdf-output').count();
  if(outputCount!==outputs.filter(o=>o.text).length)throw new Error('Python outputs were not included in the PDF');
  const answers=await print.locator('.answer').count();
  if(config.kind==='lecture'&&answers)throw new Error('Quiz answer blocks leaked into lecture PDF');
  if(config.kind==='full'&&!answers)throw new Error('Full PDF is missing quiz answers');
  const clipped=await print.evaluate(()=>[...document.querySelectorAll('pre code,.pdf-output')]
    .filter(el=>el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)
    .map(el=>el.closest('section')?.id));
  if(clipped.length)throw new Error('Text clipped on '+[...new Set(clipped)].join(', '));
  const localLinks=await print.locator('a[href]').evaluateAll(links=>links.filter(link=>link.href.startsWith(location.origin)&&!link.getAttribute('href').startsWith('#')).map(link=>link.href));
  if(localLinks.length)throw new Error('Temporary links in PDF: '+localLinks.join(', '));
  if(failures.length)throw new Error('Browser errors: '+[...new Set(failures)].join('; '));
  if(await readFile(resolve(root,'week5.qmd'),'utf8')!==sourceBefore)throw new Error('Source changed during export');
  await mkdir(dirname(destination),{recursive:true});
  await print.pdf({path:temporary,printBackground:true,preferCSSPageSize:true,tagged:true});
  await rename(temporary,destination);
  console.log(`Saved ${destination}; ${pages} pages; ${outputs.length} runnable Python examples`);
}finally{
  await browser?.close();
  if(server.listening)await new Promise(done=>server.close(done));
  await rm(temporary,{force:true});
}

function hydratePrintView({outputs,kind}){
  const style=document.createElement('style');
  style.textContent=`
    .reveal .pdf-output {font:23px/1.12 Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;overflow:visible!important;max-height:none!important;background:#fff;border-left:3px solid #aaa;padding:5px 10px;margin:5px 0 8px;}
    .reveal pre,.reveal pre code {max-height:none!important;overflow:visible!important;}
    .reveal pre code {white-space:pre-wrap!important;overflow-wrap:anywhere;}
    .reveal .answer[hidden] {display:block!important;}
    .reveal .brand-logo.pdf-brand {display:block!important;position:absolute;top:0;right:0;width:185px;}
    .reveal .brand-logo.pdf-brand img {margin:0!important;max-height:none!important;max-width:none!important;}
    .brand-logo:not(.pdf-brand) {display:none!important;}
  `;
  document.head.append(style);
  for(const result of outputs){
    if(!result.text)continue;
    const code=[...document.querySelectorAll('pre > code.python')][result.index];
    if(!code)throw new Error(`Missing code ${result.index}`);
    const block=code.parentElement.closest('div.sourceCode')||code.parentElement;
    const output=document.createElement('div');output.className='pdf-output';output.textContent=result.text;block.after(output);
  }
  document.querySelectorAll('.notes').forEach(note=>note.remove());
  document.querySelectorAll('a[href^="live/"]').forEach(link=>{const label=document.createElement('span');label.textContent=link.textContent+' (see the live/ folder)';link.replaceWith(label)});
  document.querySelectorAll('a[href=""]').forEach(link=>link.removeAttribute('href'));
  const brand=document.querySelector('.brand-logo');
  if(brand)document.querySelectorAll('.slides > section').forEach(slide=>{const logo=brand.cloneNode(true);logo.classList.add('pdf-brand');slide.append(logo)});
  if(kind==='full')document.querySelectorAll('.answer').forEach(answer=>answer.hidden=false);
  Reveal.on('pdf-ready',()=>{window.__week5PdfReady=true});
}
