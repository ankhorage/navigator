import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, test } from 'bun:test';

import packageJson from '../package.json';
import createCliProvider from '../src/cli/createCliProvider';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe('Navigator Ankh provider', () => {
  test('publishes the package-owned lifecycle commands and capabilities', () => {
    const provider = createCliProvider;

    expect(provider).toMatchObject({
      id: packageJson.name,
      category: packageJson.ankh.category,
      version: packageJson.version,
      capabilities: packageJson.ankh.capabilities,
    });
    expect(provider.commands.map(({ path }) => path.join(' '))).toEqual([
      'catalog',
      'validate',
      'plan',
      'generate',
      'verify',
      'examples generate',
      'examples verify',
    ]);
    expect(provider.handlers.map(({ path }) => path.join(' '))).toEqual(
      provider.commands.map(({ path }) => path.join(' ')),
    );
  });

  test('lists and inspects the owner catalog in stable JSON mode', async () => {
    const listed = await run('catalog', ['--json']);
    const inspected = await run('catalog', ['--kind', 'preset', '--id', 'drawer', '--json']);

    expect(listed.exitCode).toBe(0);
    expect(listed.envelope).toMatchObject({
      schemaVersion: 1,
      command: 'navigator.catalog',
      ok: true,
    });
    expect(inspected.envelope.data).toEqual({
      id: 'drawer',
      description: 'Drawer root with direct routes and no forced Stack.',
      topology: ['drawer'],
    });
  });

  test('validates unknown manifest and binding JSON without writing files', async () => {
    const directory = await createFixture();
    await Bun.write(
      join(directory, 'invalid.json'),
      JSON.stringify({ type: 'slot', routes: [], flows: { onboarding: true } }),
    );

    const result = await run(
      'validate',
      [
        '--manifest',
        'invalid.json',
        '--bindings',
        'bindings.json',
        '--platform',
        'web',
        '--expo-router-version',
        packageJson.devDependencies['expo-router'],
        '--json',
      ],
      directory,
    );

    expect(result.exitCode).toBe(1);
    expect(result.envelope.diagnostics).toEqual([
      expect.objectContaining({ code: 'invalid-navigator-manifest', severity: 'error' }),
    ]);
    expect(await Bun.file(join(directory, 'src/app/_layout.tsx')).exists()).toBe(false);
  });

  test('plans, generates, and verifies through one public contract', async () => {
    const directory = await createFixture();
    const targetContext = [
      '--manifest',
      'manifest.json',
      '--platform',
      'web',
      '--expo-router-version',
      packageJson.devDependencies['expo-router'],
      '--json',
    ] as const;
    const planned = await run('plan', targetContext, directory);
    const generated = await run(
      'generate',
      [...targetContext, '--bindings', 'bindings.json', '--target', 'generated'],
      directory,
    );
    const verified = await run(
      'verify',
      [...targetContext, '--bindings', 'bindings.json'],
      directory,
    );

    expect(planned.exitCode).toBe(0);
    expect(planned.envelope.data).toMatchObject({
      support: 'supported',
      capabilityIds: ['slot'],
    });
    expect(generated.exitCode).toBe(0);
    expect(generated.envelope.data).toMatchObject({ support: 'supported' });
    expect(await readFile(join(directory, 'generated/src/app/_layout.tsx'), 'utf8')).toContain(
      'export default function NavigatorLayout()',
    );
    expect(verified.exitCode).toBe(0);
    expect(verified.envelope.data).toMatchObject({
      deterministic: true,
    });
    expect(
      (verified.envelope.data as { checks: { kind: string; status: string }[] }).checks.map(
        ({ kind, status }) => [kind, status],
      ),
    ).toEqual([
      ['structural', 'verified'],
      ['generation', 'verified'],
      ['install', 'unverified'],
      ['export', 'unverified'],
      ['browser', 'unverified'],
    ]);
  });

  test('generates and verifies one standalone root example', async () => {
    const directory = await createFixture();
    const generated = await run(
      'examples generate',
      ['--id', 'slot', '--target', '.', '--json'],
      directory,
    );
    const missingLock = await run(
      'examples verify',
      ['--id', 'slot', '--target', '.', '--json'],
      directory,
    );
    await Bun.write(join(directory, 'examples/slot/bun.lock'), 'lockfileVersion = 1\n');
    const verified = await run(
      'examples verify',
      ['--id', 'slot', '--target', '.', '--json'],
      directory,
    );

    expect(generated.exitCode).toBe(0);
    expect(generated.envelope.data).toMatchObject({
      examples: [expect.objectContaining({ id: 'slot' })],
    });
    expect(missingLock.exitCode).toBe(1);
    expect(missingLock.envelope.diagnostics).toEqual([
      expect.objectContaining({ code: 'stale-examples' }),
    ]);
    expect(verified.exitCode).toBe(0);
    expect(verified.envelope.data).toMatchObject({ verified: true });
  });
});

async function createFixture(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'navigator-cli-'));
  temporaryDirectories.push(directory);
  await Bun.write(
    join(directory, 'manifest.json'),
    JSON.stringify({ type: 'slot', routes: [{ name: 'index', screenId: 'home' }] }),
  );
  await Bun.write(
    join(directory, 'bindings.json'),
    JSON.stringify({
      screens: { home: { module: '@/screens/home', exportName: 'HomeScreen' } },
      guards: {},
    }),
  );
  return directory;
}

async function run(
  path: string,
  argv: readonly string[],
  cwd = process.cwd(),
): Promise<{ exitCode: number; envelope: Record<string, unknown> }> {
  const output: string[] = [];
  const errors: string[] = [];
  const handler = createCliProvider.handlers.find((candidate) => candidate.path.join(' ') === path);
  if (handler === undefined) throw new Error(`Missing Navigator command ${path}.`);
  const result = await handler.handler({
    argv,
    context: {
      cwd,
      writeStdout: (text) => output.push(text),
      writeStderr: (text) => errors.push(text),
    },
  });
  expect(errors).toEqual([]);
  expect(output).toHaveLength(1);
  return {
    exitCode: result.exitCode,
    envelope: JSON.parse(output[0] ?? '') as Record<string, unknown>,
  };
}
