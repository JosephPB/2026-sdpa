/** Package the delivered Week 7 deck for the existing shared GitHub Pages site. */
import {cp,mkdir,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
if(args.includes('--help')){
 console.log('node package-pages.mjs [--output folder]');
 console.log('Publishes the current week7.html and its browser runtime, data and activities. Render the master first after edits.');
 process.exit(0);
}
if(args.length&&!(args.length===2&&args[0]==='--output'&&args[1]))throw Error('Use --output folder');
const target=resolve(root,args[1]||'output/pages');
if(target===root||!relative(target,root).startsWith('..'))throw Error('Output cannot be the source or a parent of it');
const html=await readFile(resolve(root,'week7.html'),'utf8');
if(!html.includes('runner.js'))throw Error('Rendered deck is missing the Python runner');
// Check the dependency closure, not the entire Pyodide catalogue (only used packages are bundled).
const lock=JSON.parse(await readFile(resolve(root,'runtime/pyodide-lock.json'),'utf8'));
const required=new Set();
async function dependency(name){
 if(required.has(name))return;required.add(name);
 const pkg=lock.packages[name];if(!pkg)throw Error(`Unknown Python package ${name}`);
 await readFile(resolve(root,'runtime',pkg.file_name));
 for(const child of pkg.depends)await dependency(child);
}
for(const name of ['numpy','pandas','matplotlib'])await dependency(name);
await mkdir(target,{recursive:true});
for(const dir of ['week7_files','activities','runtime','data','live'])await cp(resolve(root,dir),resolve(target,dir),{recursive:true});
await mkdir(resolve(target,'assets'),{recursive:true});
for(const entry of await readdir(resolve(root,'assets'))){
 // The supplied original/editing MOV files and generation metadata are not needed online.
 if(['.png','.jpg','.jpeg','.svg','.webm','.mp4'].includes(extname(entry).toLowerCase()))await cp(resolve(root,'assets',entry),resolve(target,'assets',entry));
}
for(const file of ['week7.html','week7.css','runner.js','worker.js'])await cp(resolve(root,file),resolve(target,file));
await writeFile(resolve(target,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=week7.html"><title>Week 7: Introduction to Scientific Python</title><a href="week7.html">Open the interactive Week 7 lecture</a><script>location.replace("week7.html"+location.search+location.hash)</script></html>');
await writeFile(resolve(target,'.nojekyll'),'');
// Check all local HTML/CSS references, including slide libraries and embedded activity scripts.
let files=0,bytes=0;
async function inspect(dir){
 for(const item of await readdir(dir,{withFileTypes:true})){
  const file=resolve(dir,item.name);
  if(item.isDirectory()){await inspect(file);continue}
  const info=await stat(file);files++;bytes+=info.size;
  if(!['.html','.css'].includes(extname(file)))continue;
  const text=await readFile(file,'utf8');
  const refs=[...text.matchAll(/(?:src|href|poster|data-src)=["']([^"']+)["']/g)].map(m=>m[1]);
  if(file.endsWith('.css'))refs.push(...[...text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)].map(m=>m[1]));
  for(let ref of refs){
   ref=ref.replaceAll('&amp;','&').split(/[?#]/)[0];
   if(!ref||/^(?:[a-z]+:|\/\/)/i.test(ref))continue;
   const dest=resolve(dirname(file),decodeURIComponent(ref)),rel=relative(target,dest);
   if(rel.startsWith('..')||isAbsolute(rel))throw Error(`Link leaves published folder: ${file}: ${ref}`);
   await stat(dest).catch(()=>{throw Error(`Missing published asset: ${relative(target,file)} → ${ref}`)});
  }
 }
}
await inspect(target);
console.log(`Week 7 ready: ${target}; ${files} files, ${(bytes/1024/1024).toFixed(1)} MiB; ${required.size} Python packages checked.`);
