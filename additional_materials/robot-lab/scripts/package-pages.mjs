import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep the public URL aligned with the app's folder in the course repository.
const root = resolve(import.meta.dirname, '..');
const target = resolve(root, 'pages-site');
await mkdir(resolve(target, 'additional_materials/robot-lab'), { recursive: true });
await cp(resolve(root, 'dist'), resolve(target, 'additional_materials/robot-lab'), {
  recursive: true,
});
await writeFile(resolve(target, '.nojekyll'), '');
await writeFile(
  resolve(target, 'index.html'),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=./additional_materials/robot-lab/"><title>SDPA Robot Lab</title><a href="./additional_materials/robot-lab/">Open the Robot Lab</a></html>',
);
console.log('GitHub Pages files are ready in pages-site/');
