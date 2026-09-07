import { resolve } from 'node:path';

import type { NavigatorRuntimePlatform } from '@ankhorage/contracts/navigator';

import { getNavigatorExampleCatalog } from '../src/navigator';

const repositoryRoot = resolve(import.meta.dir, '..');
const targets = getNavigatorExampleCatalog().flatMap((example) =>
  example.targets
    .filter(({ support }) => support !== 'unsupported')
    .map(({ platform, support }) => ({ id: example.id, platform, support })),
);
let nextTarget = 0;

await Promise.all(Array.from({ length: 4 }, runWorkerAsync));

console.log(`\nExported ${targets.length} supported or testing-only example targets.`);

/*** Export matrix entries with bounded concurrency while preserving app ownership. */
async function runWorkerAsync(): Promise<void> {
  while (nextTarget < targets.length) {
    const target = targets[nextTarget];
    nextTarget += 1;
    if (target === undefined) return;
    await exportTargetAsync(target.id, target.platform, target.support);
  }
}

/*** Run one platform export from the isolated example directory. */
async function exportTargetAsync(
  id: string,
  platform: NavigatorRuntimePlatform,
  support: string,
): Promise<void> {
  const cwd = resolve(repositoryRoot, 'examples', id);
  console.log(`\n> ${id}:${platform} (${support})`);
  const process = Bun.spawn({
    cmd: ['bun', 'run', `export:${platform}`],
    cwd,
    stderr: 'inherit',
    stdout: 'inherit',
  });
  const exitCode = await process.exited;
  if (exitCode !== 0) throw new Error(`Expo export failed for ${id}:${platform}.`);
}
