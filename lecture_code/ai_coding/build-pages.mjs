/** Rebuild and validate the public AI coding resources from their current sources. */
import {createServer} from 'node:http';
import {cp,mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
if(args.includes('--help')){console.log('node build-pages.mjs [--output folder] [--browser chrome|chromium]');process.exit(0);}
for(let i=0;i<args.length;i+=2)if(!['--output','--browser'].includes(args[i])||!args[i+1])throw Error('Invalid arguments');
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const target=resolve(root,option('--output','output/pages'));
const rel=relative(root,target);
if(!rel||!relative(target,root).startsWith('..')||['assets','demo','ai_coding_files'].some(d=>rel===d||rel.startsWith(d+'/')))throw Error('Unsafe output folder');
function run(cmd,args){const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit'});if(r.error||r.status!==0)throw Error(`${cmd} failed`);}
run('quarto',['render']);
await mkdir(target,{recursive:true});
const sourceFiles=['ai_coding.css','animations.js','demos.js','reading.html','references.md'];
for(const f of sourceFiles)await cp(resolve(root,f),resolve(target,f));
await cp(resolve(root,'ai_coding_files'),resolve(target,'ai_coding_files'),{recursive:true});
await mkdir(resolve(target,'assets'),{recursive:true});
for(const f of ['ai-homework-scores.jpeg','ai-exam-scores.jpeg','outline-page-2-0.png','outline-page-3-0.jpg','outline-page-6-0.png','rubber-duck.png','bristol-slide-original.jpeg','SOURCES.txt'])await cp(resolve(root,'assets',f),resolve(target,'assets',f));
await mkdir(resolve(target,'demo'),{recursive:true});
for(const f of ['force.py','force_buggy.py','test_force.py','README.md'])await cp(resolve(root,'demo',f),resolve(target,'demo',f));
const html=(await readFile(resolve(root,'ai_coding.html'),'utf8')).replace(/<aside\b[^>]*class="[^"]*\bnotes\b[^"]*"[^>]*>[\s\S]*?<\/aside>/g,'');
if(/<aside[^>]*class="[^"]*notes/.test(html))throw Error('Speaker notes remain');
await writeFile(resolve(target,'ai_coding.html'),html);
run('quarto',['pandoc','references.md','-s','-t','html5','--metadata','pagetitle=AI-assisted programming: references','--include-in-header=references-style.html','-o',resolve(target,'references.html')]);
await writeFile(resolve(target,'index.html'),await readFile(resolve(root,'pages-index.html')));
await writeFile(resolve(target,'.nojekyll'),'');

let chromium;
for(const p of [process.env.SDPA_PLAYWRIGHT_MODULE,resolve(root,'../../additional_materials/duckdash/node_modules/playwright/index.mjs')].filter(Boolean)){
 try{({chromium}=await import(pathToFileURL(p)));break;}catch{}
}
if(!chromium)throw Error('Install additional_materials/duckdash dependencies first.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.md':'text/plain','.py':'text/plain'};
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),file=resolve(target,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
 const r=relative(target,file);if(r.startsWith('..')||isAbsolute(r)){res.writeHead(403).end();return;}
 const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(bytes);
}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 const base=`http://127.0.0.1:${server.address().port}`;
 const name=option('--browser','chrome');
 browser=await chromium.launch({headless:true,...(name==='chromium'?{}:{channel:name})});
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base)&&!r.url().endsWith('/favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base+'/ai_coding.html?print-pdf');
 await page.waitForFunction(()=>window.Reveal?.isReady()&&window.aiDemosReady&&window.aiCodingReady&&document.querySelectorAll('.pdf-page').length);
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
 const count=await page.evaluate(async()=>{
  await document.fonts.ready;
  for(const k of ['chat','agent'])aiDemos.get(k).finish();
  const brand=document.querySelector('.brand-logo');
  document.querySelectorAll('.pdf-page').forEach(p=>{const b=brand.cloneNode(true);b.classList.add('pdf-brand');p.append(b);});
  const style=document.createElement('style');style.textContent='.reveal .pdf-page{position:relative!important}.brand-logo:not(.pdf-brand){display:none!important}.brand-logo.pdf-brand{position:absolute!important;top:24px;right:50px;width:185px;height:53.5px;display:block!important}.reveal .brand-logo.pdf-brand img{margin:0!important;max-height:none!important;max-width:none!important}';document.head.append(style);
  return Reveal.getSlides().length;
 });
 await page.pdf({path:resolve(target,'ai_coding.pdf'),preferCSSPageSize:true,printBackground:true,tagged:true});
 await page.goto(base+'/references.html');await page.evaluate(()=>document.fonts.ready);
 await page.pdf({path:resolve(target,'references.pdf'),preferCSSPageSize:true,printBackground:true,tagged:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font:9px Arial;width:100%;text-align:center;color:#777">SDPA · AI-assisted programming <span class="pageNumber"></span></div>'});
 // Exercise the published HTML in ordinary presentation mode as well as print mode.
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base+'/ai_coding.html');await page.waitForFunction(()=>window.aiDemosReady);
 for(const kind of ['chat','agent']){
  await page.evaluate(k=>Reveal.slide(Reveal.getSlides().findIndex(s=>s.id===k)),kind);
  await page.waitForTimeout(700);
  if(!(await page.locator(`#${kind} [data-field="prompt"]`).textContent()).length)throw Error('Typing did not start');
  await page.locator(`#${kind} [data-action="finish"]`).click();
  if((await page.evaluate(k=>aiDemos.get(k).getState(),kind)).state!=='complete')throw Error('Demo did not finish');
 }
 await page.goto(base+'/');
 for(const href of await page.locator('a').evaluateAll(a=>a.map(e=>e.getAttribute('href')))){
  if(/^[a-z]+:/i.test(href))continue;
  await stat(resolve(target,href));
 }
 if(errors.length)throw Error(errors.join('\n'));
 console.log(`AI coding Pages bundle checked: ${count} slides, both animations, PDFs and resource links. ${target}`);
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
