/** Export the generated Quarto deck using the same Chromium print route as Week 5.
 * Code results are refreshed by the Python generator before this export. Quiz
 * cells are never run here. Iframes become static images; video uses its poster.
 */
import {createServer} from 'node:http';
import {readFile,mkdir,rename,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {dirname,resolve,extname,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){
 if(!['--output','--browser','--help'].includes(args[i]))throw Error(`Unknown option ${args[i]}`);
 if(args[i]!=='--help'&&!args[++i])throw Error('Missing option value');
}
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1]}
if(args.includes('--help')){console.log('node export-pdf.mjs [--output path.pdf] [--browser chrome|msedge|chromium]');process.exit(0)}
const config=JSON.parse(await readFile(resolve(root,'pdf-config.json'),'utf8'));
const destination=resolve(root,option('--output',config.output));
if(extname(destination)!=='.pdf')throw Error('Output must have a .pdf extension');
const source=await readFile(resolve(root,'week7.qmd'),'utf8');
if(config.kind==='lecture'&&/\{\.answer\b/.test(source))throw Error('Student source contains an answer block');
const render=spawnSync('quarto',['render','week7.qmd'],{cwd:root,stdio:'inherit'});
if(render.error||render.status!==0)throw Error('Quarto render failed; existing PDF retained');
let chromium;
try{({chromium}=await import('playwright'))}catch{}
for(const path of [process.env.SDPA_PLAYWRIGHT_MODULE,
 resolve(root,'../../additional_materials/robot-lab/node_modules/playwright/index.mjs'),
 resolve(process.env.HOME||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)){
 if(chromium)break;try{({chromium}=await import(pathToFileURL(path)))}catch{}
}
if(!chromium)throw Error('Install Playwright or set SDPA_PLAYWRIGHT_MODULE, as for Week 5');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webm':'video/webm','.mp4':'video/mp4'};
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+path),rel=relative(root,file);
  if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
 }catch{res.writeHead(404).end('Not found')}
});
let browser;const temporary=destination+`.${process.pid}.tmp`;
try{
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
 const base=`http://127.0.0.1:${server.address().port}`;
 const channel=option('--browser','chrome');
 browser=await chromium.launch({...(channel==='chromium'?{}:{channel}),headless:true});
 const context=await browser.newContext({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
 const live=await context.newPage();
 await live.goto(`${base}/week7.html`);await live.waitForFunction(()=>window.Reveal?.isReady());
 const count=await live.locator('.slides>section').count(), snapshots=new Map();
 const frames=await live.locator('.slides>section iframe').all();
 for(const frame of frames){
  const info=await frame.evaluate(el=>({src:el.getAttribute('src'),slide:el.closest('section').id}));
  await live.evaluate(id=>{const s=document.getElementById(id);Reveal.slide([...s.parentElement.children].indexOf(s));},info.slide);
  const mode=new URL(info.src,base).searchParams.get('mode');
  const handle=await frame.elementHandle();
  const inner=await handle.contentFrame();
  await inner.waitForFunction(()=>document.querySelector('#board')?.children.length>0);
  // Show an initial name/object reference in the PDF rather than a blank memory diagram.
  if(mode==='memory')await inner.getByRole('button',{name:'Step',exact:true}).click();
  await inner.evaluate(()=>document.fonts.ready);
  const pixels=await frame.screenshot({type:'png'});
  snapshots.set(info.src,pixels.toString('base64'));
 }
 let html=await readFile(resolve(root,'week7.html'),'utf8');
 html=html.replace(/<iframe\b[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/g,(tag,src)=>{
  const data=snapshots.get(src.replaceAll('&amp;','&'));
  if(!data)throw Error(`No snapshot for ${src}`);
  return `<img class="activity-snapshot slice-frame" src="data:image/png;base64,${data}" alt="Exercise starting state">`;
 });
 html=html.replace(/<video\b[^>]*poster="([^"]+)"[^>]*>[\s\S]*?<\/video>/g,'<img class="array-video" src="$1" alt="Three-dimensional array animation still">');
 html=html.replace('</body>',`<script>(${preparePrint.toString()})();</script></body>`);
 const print=await context.newPage();
 await print.route('**/week7.html?print-pdf',route=>route.fulfill({contentType:'text/html',body:html}));
 await print.goto(`${base}/week7.html?print-pdf`);
 await print.waitForFunction(()=>document.querySelectorAll('.pdf-page').length>0&&window.__week7PdfReady===true,{timeout:30000});
 await print.evaluate(()=>document.fonts.ready);
 await print.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 if(await print.locator('iframe').count())throw Error('An interactive frame was not replaced for the PDF');
 const snapshotCount=await print.locator('img.activity-snapshot').count();
 if(snapshotCount!==frames.length)throw Error('Missing activity snapshots');
 const pages=await print.locator('.pdf-page').count();
 if(pages!==count)throw Error(`${count} slides produced ${pages} PDF pages`);
 if(config.kind==='lecture'&&await print.locator('.answer').count())throw Error('An answer leaked into the student PDF');
 const overflow=await print.evaluate(()=>[...document.querySelectorAll('.pdf-page section:has(.activity-snapshot)')].filter(s=>{
  const p=s.closest('.pdf-page').getBoundingClientRect(),h=s.querySelector('h2').getBoundingClientRect(),i=s.querySelector('.activity-snapshot').getBoundingClientRect();
  return h.top<p.top || i.bottom>p.bottom-35;
 }).map(s=>s.id));
 if(overflow.length)throw Error('Activity content exceeds the PDF page: '+overflow.join(', '));
 const clipped=await print.evaluate(()=>[...document.querySelectorAll('.pdf-page section')].filter(s=>s.scrollHeight>s.clientHeight+8).map(s=>s.id));
 if(clipped.length)console.warn('Review slide content height:',clipped.join(', '));
 if(await readFile(resolve(root,'week7.qmd'),'utf8')!==source)throw Error('Source changed during export');
 await mkdir(dirname(destination),{recursive:true});
 await print.pdf({path:temporary,printBackground:true,preferCSSPageSize:true,tagged:true});
 await rename(temporary,destination);
 console.log(`Saved ${destination}; ${pages} pages; ${snapshots.size} static activity views; quiz outputs omitted.`);
}finally{
 await browser?.close();if(server.listening)await new Promise(done=>server.close(done));await rm(temporary,{force:true});
}
function preparePrint(){
 const style=document.createElement('style');style.textContent=`
 .reveal .run-controls{display:none!important}
 .reveal .activity-snapshot{display:block;width:100%;object-fit:contain;max-height:none;margin:0}
 .reveal pre,.reveal pre code{max-height:none!important;overflow:visible!important}
 .reveal .brand-logo.pdf-brand{display:block!important;position:absolute;top:0;right:0;width:185px}
 .reveal .brand-logo.pdf-brand img{margin:0!important;max-height:none!important;max-width:none!important}
 .brand-logo:not(.pdf-brand){display:none!important}
 `;document.head.append(style);
 const brand=document.querySelector('.brand-logo');
 if(brand)document.querySelectorAll('.slides>section').forEach(s=>{const logo=brand.cloneNode(true);logo.classList.add('pdf-brand');s.append(logo)});
 document.querySelectorAll('a[href]').forEach(a=>{
  const href=a.getAttribute('href');
  if(href.startsWith('activities/')){a.closest('p')?.remove();return}
  if(!/^(https?:|mailto:|#)/.test(href))a.removeAttribute('href');
 });
 document.querySelectorAll('.notes').forEach(n=>n.remove());
 Reveal.configure({pdfMaxPagesPerSlide:1});
 Reveal.on('pdf-ready',()=>{window.__week7PdfReady=true});
}
