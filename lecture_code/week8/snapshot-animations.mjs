import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {withBrowser} from './browser-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));
await withBrowser(root,async(browser,base)=>{
  const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
  await page.goto(base+'/week8.html');
  await page.waitForFunction(()=>Reveal?.isReady()&&window.week8AnimationsReady);
  const states={};
  for(const [id,steps] of Object.entries({memory:[8],matrix:[8],binning:[2,4],http:[4,9],'pagination-demo':[3]})){
    states[id]=[];
    for(const step of steps){
      const html=await page.evaluate(({id,step})=>{
        const animation=document.querySelector('#'+id+' .animation');animation.setStep(step);
        const copy=animation.cloneNode(true);copy.querySelectorAll('.animation-cues,animate').forEach(e=>e.remove());
        copy.removeAttribute('data-animation');copy.removeAttribute('data-mounted');
        copy.classList.add('static-animation');return copy.outerHTML;
      },{id,step});
      states[id].push(html);
    }
  }
  await writeFile(resolve(root,'assets/animation-states.json'),JSON.stringify(states));
});
