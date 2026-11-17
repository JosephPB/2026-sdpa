/** Deterministic static export of the already-sanitised student deck. */
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,rename,rm,writeFile} from 'node:fs/promises';
import {withBrowser} from './browser-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const destination=resolve(root,'output/pdf/week9-lecture.pdf');
const temporary=destination+'.tmp';
await withBrowser(root,async(browser,base)=>{
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/week9.html?print-pdf');
  await page.waitForFunction(()=>window.Reveal?.isReady()&&window.week9Ready);
  await page.waitForFunction(()=>document.querySelectorAll('.pdf-page').length>0);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  await page.evaluate(async()=>{
   await document.fonts.ready;
   if(document.querySelector('.quiz-answer,aside.notes'))throw Error('Private answers or speaker notes remain.');
   const brand=document.querySelector('.brand-logo');
   document.querySelectorAll('.pdf-page').forEach(sheet=>{const copy=brand.cloneNode(true);copy.classList.add('pdf-brand');sheet.append(copy);});
   const style=document.createElement('style');style.textContent='.reveal .pdf-page{position:relative!important}.brand-logo:not(.pdf-brand){display:none!important}.brand-logo.pdf-brand{position:absolute!important;top:30px;right:55px;width:185px;height:53.5px;display:block!important}.reveal .brand-logo.pdf-brand img{margin:0!important;max-height:none!important;max-width:none!important}.reveal pre,.reveal pre code{max-height:none!important;overflow:visible!important}.code-copy-button{display:none!important}';document.head.append(style);
  });
  const pages=await page.locator('.pdf-page').count();
  const report=await page.evaluate(()=>[...document.querySelectorAll('.pdf-page')].map(p=>{const s=p.querySelector('section');return{id:s?.id,title:s?.querySelector('h2')?.textContent,pageHeight:p.getBoundingClientRect().height,slideHeight:s?.getBoundingClientRect().height};}));
  if(errors.length)throw Error(errors.join('\n'));
  await mkdir(dirname(destination),{recursive:true});
  await page.pdf({path:temporary,preferCSSPageSize:true,printBackground:true,tagged:true});
  await rename(temporary,destination);
  await writeFile(resolve(root,'output/pdf/export-report.json'),JSON.stringify({pages,slides:report},null,2));
  console.log(`Student PDF: ${destination} (${pages} pages)`);
 }finally{await rm(temporary,{force:true});}
});
