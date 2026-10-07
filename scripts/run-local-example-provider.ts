import { resolve } from 'node:path';

import {
  createPackageRegistry,
  createProviderRegistry,
  type AnkhLoadedProvider,
} from '@ankhorage/ankh';

import { CAPABILITIES } from '../src/capabilities';
import provider from '../src/cli/createCliProvider';

const REPOSITORY_ROOT = resolve(import.meta.dir, '..');
const [command, ...argv] = Bun.argv.slice(2);

if (command !== 'generate' && command !== 'verify') {
  throw new Error('Expected local Navigator example command generate or verify.');
}

const handler = provider.handlers.find(
  ({ path }) => path.length === 2 && path[0] === 'examples' && path[1] === command,
);
if (handler === undefined) {
  throw new Error(`Missing local Navigator examples ${command} handler.`);
}
const descriptor = provider.commands.find(
  ({ path }) => path.length === 2 && path[0] === 'examples' && path[1] === command,
);
if (descriptor === undefined) {
  throw new Error(`Missing local Navigator examples ${command} descriptor.`);
}
const loadedProvider: AnkhLoadedProvider = {
  discoveredPackage: {
    metadata: {
      category: provider.category,
      provider: './dist/cli/createCliProvider.js',
      capabilities: CAPABILITIES,
    },
    packageJsonPath: resolve(REPOSITORY_ROOT, 'package.json'),
    packageName: provider.id,
    packageRoot: REPOSITORY_ROOT,
    source: 'current-package',
  },
  manifest: provider,
  providerModuleDefaultExport: provider,
  providerModulePath: resolve(REPOSITORY_ROOT, 'dist/cli/createCliProvider.js'),
  providerModuleUrl: 'file:///navigator/createCliProvider.js',
};

const result = await handler.handler({
  argv,
  command: {
    ...descriptor,
    category: provider.category,
    packageName: provider.id,
    providerId: provider.id,
  },
  context: {
    cwd: REPOSITORY_ROOT,
    env: process.env,
    packageRegistry: createPackageRegistry(),
    providerRegistry: createProviderRegistry(),
    version: provider.version,
    writeStdout: (text) => process.stdout.write(text),
    writeStderr: (text) => process.stderr.write(text),
  },
  provider: loadedProvider,
});

process.exitCode = result?.exitCode ?? 0;
