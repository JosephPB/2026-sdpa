/** Student PDF: one page per static slide; no speaker notes or answer reveals. */
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,rename,rm} from 'node:fs/promises';
import {withBrowser} from './browser-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const destination=resolve(root,'output/pdf/week8-lecture.pdf');
const temporary=destination+'.tmp';
await withBrowser(root,async(browser,base)=>{
  try {
    const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
    await page.goto(base+'/week8.html?print-pdf');
    await page.waitForFunction(()=>window.Reveal?.isReady());
    await page.waitForFunction(()=>document.querySelectorAll('.pdf-page').length>0);
    await page.evaluate(async()=>{
      await document.fonts.ready;
      document.querySelectorAll('.notes,.run-controls').forEach(e=>e.remove());
      const brand=document.querySelector('.brand-logo');
      document.querySelectorAll('.pdf-page').forEach(sheet=>{
        const copy=brand.cloneNode(true);copy.classList.add('pdf-brand');sheet.append(copy);
      });
      const style=document.createElement('style');
      style.textContent='.reveal .pdf-page{position:relative!important}.brand-logo:not(.pdf-brand){display:none!important}.brand-logo.pdf-brand{position:absolute!important;top:30px;right:55px;width:185px;height:53.5px;display:block!important}.reveal .brand-logo.pdf-brand img{margin:0!important;max-height:none!important;max-width:none!important}.reveal pre,.reveal pre code{max-height:none!important;overflow:visible!important}.code-copy-button{display:none!important}';
      document.head.append(style);
    });
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
    const count=await page.locator('.pdf-page').count();
    if(await page.locator('.notes,.exit-answer,[data-answer="true"],.animation-cues').count())throw Error('Answer/notes/reveal content remains in student PDF.');
    await mkdir(dirname(destination),{recursive:true});
    await page.pdf({path:temporary,preferCSSPageSize:true,printBackground:true,tagged:true});
    await rename(temporary,destination);
    console.log(`Student PDF saved: ${destination} (${count} pages)`);
  } finally {await rm(temporary,{force:true});}
});
