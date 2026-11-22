import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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

const acceptanceRoot = mkdtempSync(join(tmpdir(), 'navigator-example-acceptance-'));
const packageArchive = packNavigator(acceptanceRoot);

try {
  for (const id of actualIds) validateExample(id, acceptanceRoot, packageArchive);
} finally {
  rmSync(acceptanceRoot, { force: true, recursive: true });
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

console.log(
  `\nValidated ${actualIds.length} standalone Navigator example dependency graphs against the packed candidate.`,
);

/*** Validate one generated example against the current packed Navigator artifact in an isolated directory. */
function validateExample(id: string, acceptanceRoot: string, packageArchive: string): void {
  const sourceRoot = resolve(EXAMPLES_ROOT, id);
  const projectRoot = resolve(acceptanceRoot, id);
  cpSync(sourceRoot, projectRoot, {
    filter: (source) => !source.endsWith('/bun.lock') && !source.includes('/node_modules/'),
    recursive: true,
  });
  writeCandidateManifest(projectRoot, packageArchive);
  run(['bun', 'install'], projectRoot);
  run(['bun', 'install', '--frozen-lockfile'], projectRoot);
  run(['bun', 'run', 'typecheck'], projectRoot);
}

/*** Pack the exact checked-out Navigator artifact used by all pre-release standalone consumers. */
function packNavigator(acceptanceRoot: string): string {
  run(['bun', 'pm', 'pack', '--destination', acceptanceRoot, '--quiet'], REPOSITORY_ROOT);
  const archive = readdirSync(acceptanceRoot).find((entry) => entry.endsWith('.tgz'));
  if (archive === undefined)
    throw new Error('Navigator candidate packing did not produce a tarball.');
  return resolve(acceptanceRoot, archive);
}

/*** Replace only the unpublished registry version with the exact packed candidate for pre-release acceptance. */
function writeCandidateManifest(projectRoot: string, packageArchive: string): void {
  const manifestPath = resolve(projectRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    dependencies: Record<string, string>;
  };
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        ...manifest,
        dependencies: {
          ...manifest.dependencies,
          '@ankhorage/navigator': `file:${packageArchive}`,
        },
      },
      null,
      2,
    )}\n`,
  );
}

/*** Run one acceptance command in its owning standalone application. */
function run(command: readonly string[], cwd: string): void {
  console.log(`\n> (${cwd}) ${command.join(' ')}`);
  const result = Bun.spawnSync({ cmd: [...command], cwd, stderr: 'inherit', stdout: 'inherit' });
  if (result.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${result.exitCode}: ${command.join(' ')}`);
  }
}
