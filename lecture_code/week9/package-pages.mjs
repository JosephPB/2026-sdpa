/** Package the Week 9 teaching master for the existing shared GitHub Pages site. */
import {cp,mkdir,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
if(args.includes('--help')){
 console.log('node package-pages.mjs [--output folder]');
 console.log('Packages the rendered week9.html, slide libraries, animations, figures and data. Render week9.qmd first after edits.');
 process.exit(0);
}
if(args.length&&!(args.length===2&&args[0]==='--output'&&args[1]))throw Error('Use --output folder');
const target=resolve(root,args[1]||'output/pages');
if(target===root||!relative(target,root).startsWith('..'))throw Error('Output cannot be the source or a parent of it');
for(const input of ['assets','data','week9_files']){
 const rel=relative(resolve(root,input),target);
 if(!rel||(!rel.startsWith('..')&&!isAbsolute(rel)))throw Error(`Output cannot be inside ${input}`);
}
const html=await readFile(resolve(root,'week9.html'),'utf8');
if(!html.includes('animations.js')||!html.includes('revealjs/dist/reveal.js'))throw Error('Render week9.qmd before packaging: the slide runtime is missing');
await mkdir(target,{recursive:true});
for(const dir of ['week9_files','assets','data'])await cp(resolve(root,dir),resolve(target,dir),{recursive:true});
for(const file of ['week9.html','week9.css','animations.js'])await cp(resolve(root,file),resolve(target,file));
// Only visual worked outputs belong online, rather than build reports or source snippets.
await mkdir(resolve(target,'output'),{recursive:true});
for(const file of await readdir(resolve(root,'output'))){
 if(['.svg','.png','.jpg','.jpeg'].includes(extname(file).toLowerCase()))await cp(resolve(root,'output',file),resolve(target,'output',file));
}
const poster='output/pdf/data-to-viz-poster-high-resolution.pdf';
await mkdir(resolve(target,'output/pdf'),{recursive:true});
await cp(resolve(root,poster),resolve(target,poster));
await writeFile(resolve(target,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=week9.html"><title>Week 9: Exploratory data analysis</title><a href="week9.html">Open the Week 9 lecture</a><script>location.replace("week9.html"+location.search+location.hash)</script></html>');
await writeFile(resolve(target,'.nojekyll'),'');

// Check the packaged site itself so absent or ignored dependencies fail before deployment.
let files=0,bytes=0;
async function inspect(dir){
 for(const item of await readdir(dir,{withFileTypes:true})){
  const file=resolve(dir,item.name);
  if(item.isDirectory()){await inspect(file);continue;}
  if(item.isSymbolicLink())throw Error(`Published files cannot be symbolic links: ${file}`);
  const info=await stat(file);files++;bytes+=info.size;
  if(!['.html','.css','.svg'].includes(extname(file)))continue;
  const text=await readFile(file,'utf8');
  const refs=[...text.matchAll(/(?:src|href|poster|data-src)=["']([^"']+)["']/g)].map(m=>m[1]);
  if(file.endsWith('.css'))refs.push(...[...text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)].map(m=>m[1]));
  for(let ref of refs){
   ref=ref.replaceAll('&amp;','&').split(/[?#]/)[0];
   if(!ref||/^(?:[a-z]+:|\/\/)/i.test(ref))continue;
   const dest=resolve(dirname(file),decodeURIComponent(ref)),rel=relative(target,dest);
   if(rel.startsWith('..')||isAbsolute(rel))throw Error(`Link leaves published folder: ${relative(target,file)}: ${ref}`);
   await stat(dest).catch(()=>{throw Error(`Missing published asset: ${relative(target,file)} → ${ref}`);});
  }
 }
}
await inspect(target);
console.log(`Week 9 ready: ${target}; ${files} files, ${(bytes/1024/1024).toFixed(1)} MiB; local slide assets checked.`);
