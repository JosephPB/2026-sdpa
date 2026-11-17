import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,relative,extname,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
export async function withBrowser(root, action) {
  let chromium;
  for (const name of ['playwright',process.env.SDPA_PLAYWRIGHT_MODULE,resolve(root,'../../additional_materials/robot-lab/node_modules/playwright/index.mjs'),resolve(process.env.HOME||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)) {
    try {({chromium}=await import(name.startsWith('/')?pathToFileURL(name):name));break;}catch{}
  }
  if(!chromium)throw Error('Install Playwright or set SDPA_PLAYWRIGHT_MODULE.');
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.json':'application/json'};
  const server=createServer(async(req,res)=>{
    try {const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const rel=relative(root,path);
      if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return;}
      const bytes=await readFile(path);
      res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
    }catch{res.writeHead(404).end();}
  });
  let browser;
  try {
    await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
    browser=await chromium.launch({channel:'chrome',headless:true});
    await action(browser,`http://127.0.0.1:${server.address().port}`);
  } finally {await browser?.close();await new Promise(ok=>server.close(ok));}
}
