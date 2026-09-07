import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { getNavigatorExampleCatalog, verifyNavigatorExamplesAsync } from '../src/navigator';

const REPOSITORY_ROOT = resolve(import.meta.dir, '..');
const EXAMPLES_ROOT = resolve(REPOSITORY_ROOT, 'examples');

const expectedIds = getNavigatorExampleCatalog().map(({ id }) => id);
const actualIds = readdirSync(EXAMPLES_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => name)
  .sort();

if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  throw new Error(
    `Root examples do not match the public catalog. Expected ${expectedIds.join(', ')}; received ${actualIds.join(', ')}.`,
  );
}

const generation = await verifyNavigatorExamplesAsync('.', REPOSITORY_ROOT);
if (!generation.verified) {
  const stale = generation.examples
    .filter(({ current }) => !current)
    .map(
      ({ id, missingFiles, changedFiles }) =>
        `${id}: missing=${missingFiles.join(',') || 'none'} changed=${changedFiles.join(',') || 'none'}`,
    );
  throw new Error(`Generated examples are stale:\n${stale.join('\n')}`);
}

for (const id of actualIds) {
  const projectRoot = resolve(EXAMPLES_ROOT, id);
  run(['bun', 'install', '--frozen-lockfile'], projectRoot);
  run(['bun', 'run', 'typecheck'], projectRoot);
}

run(
  [
    'bunx',
    'ankhorage-eslint',
    'examples',
    '--config',
    'eslint.examples.config.mjs',
    '--max-warnings=0',
  ],
  REPOSITORY_ROOT,
);

console.log(`\nValidated ${actualIds.length} standalone Navigator example dependency graphs.`);

/*** Run one acceptance command in its owning standalone application. */
function run(command: readonly string[], cwd: string): void {
  console.log(`\n> (${cwd}) ${command.join(' ')}`);
  const result = Bun.spawnSync({ cmd: [...command], cwd, stderr: 'inherit', stdout: 'inherit' });
  if (result.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${result.exitCode}: ${command.join(' ')}`);
  }
}
