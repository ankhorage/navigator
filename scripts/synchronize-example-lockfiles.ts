import { resolve } from 'node:path';

import { getNavigatorExampleCatalog } from '../src/navigator';

const repositoryRoot = resolve(import.meta.dir, '..');

for (const { id } of getNavigatorExampleCatalog()) {
  const exampleRoot = resolve(repositoryRoot, 'examples', id);
  console.log(`\n> (${exampleRoot}) bun install --lockfile-only`);
  const result = Bun.spawnSync({
    cmd: [process.execPath, 'install', '--lockfile-only'],
    cwd: exampleRoot,
    stderr: 'inherit',
    stdout: 'inherit',
  });
  if (result.exitCode !== 0) {
    throw new Error(`Failed to synchronize the ${id} example lockfile.`);
  }
}

console.log('\nSynchronized every standalone Navigator example lockfile.');
