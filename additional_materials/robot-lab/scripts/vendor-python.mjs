import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
await mkdir(resolve(root, 'public/vendor'), { recursive: true });
for (const file of ['skulpt.min.js', 'skulpt-stdlib.js']) {
  await copyFile(
    resolve(root, 'node_modules/skulpt/dist', file),
    resolve(root, 'public/vendor', file),
  );
}
await copyFile(
  resolve(root, 'node_modules/skulpt/LICENSE'),
  resolve(root, 'public/vendor/SKULPT-LICENSE.txt'),
);
