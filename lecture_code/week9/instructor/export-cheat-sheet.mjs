import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
import {withBrowser} from '../browser-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));
await withBrowser(root,async(browser,base)=>{
 const page=await browser.newPage();
 await page.goto(base+'/maths-cheat-sheet.html');
 await page.evaluate(()=>document.fonts.ready);
 await mkdir(resolve(root,'output/pdf'),{recursive:true});
 await page.pdf({path:resolve(root,'output/pdf/week9-maths-cheat-sheet.pdf'),preferCSSPageSize:true,printBackground:true,tagged:true});
 console.log('Created instructor/output/pdf/week9-maths-cheat-sheet.pdf');
});
