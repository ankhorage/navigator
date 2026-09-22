import { resolve } from 'node:path';

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

const result = await handler.handler({
  argv,
  context: {
    cwd: REPOSITORY_ROOT,
    writeStdout: (text) => process.stdout.write(text),
    writeStderr: (text) => process.stderr.write(text),
  },
});

process.exitCode = result.exitCode;
