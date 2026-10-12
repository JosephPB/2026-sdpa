/** Add the student PDF and standalone activities to the shared GitHub Pages site. */
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
if(args.includes('--help')) {
 console.log('node package-pages.mjs [--output folder] [--pdf file.pdf]');
 console.log('Default: output/pages/. Copies only the PDF, activities and student landing page.');
 process.exit(0);
}
for(let i=0;i<args.length;i+=2) if(!['--output','--pdf'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--')) throw Error('Use --output folder or --pdf file.pdf.');
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const target=resolve(root,option('--output','output/pages'));
if(target===root||!relative(target,root).startsWith('..')) throw Error('Output must not be the source folder or one of its parents.');
const pdf=resolve(root,option('--pdf','output/pdf/week4-student.pdf'));
const bytes=await readFile(pdf);
if(bytes.subarray(0,5).toString()!=='%PDF-') throw Error('Run export-pdf.mjs first: a valid student PDF is required.');
// Every local board linked or embedded in the source must exist before publishing.
const source=await readFile(resolve(root,'week4.qmd'),'utf8');
const boards=[...new Set([...source.matchAll(/activities\/[\w-]+\.html/g)].map(match=>match[0]))];
for(const board of boards) await readFile(resolve(root,board));
await mkdir(target,{recursive:true});
await cp(resolve(root,'activities'),resolve(target,'activities'),{recursive:true});
await writeFile(resolve(target,'week4-student.pdf'),bytes);
await cp(resolve(root,'student-index.html'),resolve(target,'index.html'));
// Prevent an accidental localhost link from being shipped in the student hub.
const index=await readFile(resolve(target,'index.html'),'utf8');
if(/localhost|127\.0\.0\.1/.test(index)) throw Error('The student hub contains a local-only link.');
for(const [,href] of index.matchAll(/href="([^"#]+)"/g)) {
 if(/^https?:/.test(href))continue;
 const file=resolve(target,href),rel=relative(target,file);
 if(rel.startsWith('..')||isAbsolute(rel))throw Error(`Link leaves the student site: ${href}`);
 await readFile(file);
}
console.log(`Student resources ready: ${target} (${boards.length} interactive boards)`);
