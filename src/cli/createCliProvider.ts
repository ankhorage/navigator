import type { AnkhCommandExecutionRequest, AnkhRuntimeCommandProvider } from '@ankhorage/ankh';

import packageJson from '../../package.json';
import { CAPABILITIES } from '../capabilities';
import type { NavigatorCliExecution } from '../types/navigatorCli';
import { catalog } from './commands/catalog';
import { generate as generateExamples } from './commands/examples/generate';
import { verify as verifyExamples } from './commands/examples/verify';
import { generate } from './commands/generate';
import { plan } from './commands/plan';
import { validate } from './commands/validate';
import { verify } from './commands/verify';

export default {
  id: packageJson.name,
  category: 'navigator',
  version: packageJson.version,
  capabilities: CAPABILITIES,
  commands: [
    descriptor(
      'catalog',
      'navigator.catalog',
      'List or inspect Navigator capabilities and presets',
    ),
    descriptor(
      'validate',
      'navigator.validate',
      'Validate a manifest and narrow bindings without writes',
    ),
    descriptor(
      'plan',
      'navigator.plan',
      'Resolve a deterministic plan and dependency requirements',
    ),
    descriptor(
      'generate',
      'navigator.generate',
      'Generate Navigator files into an explicit target',
    ),
    descriptor(
      'verify',
      'navigator.verify',
      'Verify structural and deterministic generation evidence',
    ),
    descriptor(
      ['examples', 'generate'],
      'navigator.examples.generate',
      'Generate one or every standalone Navigator example',
    ),
    descriptor(
      ['examples', 'verify'],
      'navigator.examples.verify',
      'Verify generated examples and app-owned lockfiles',
    ),
  ],
  handlers: [
    binding('catalog', catalog),
    binding('validate', validate),
    binding('plan', plan),
    binding('generate', generate),
    binding('verify', verify),
    binding(['examples', 'generate'], generateExamples),
    binding(['examples', 'verify'], verifyExamples),
  ],
} satisfies AnkhRuntimeCommandProvider;

/*** Define one public command descriptor from its package-owned capability. */
function descriptor(
  path: string | readonly string[],
  capability: (typeof CAPABILITIES)[number]['id'],
  summary: string,
) {
  const segments = typeof path === 'string' ? [path] : path;
  return {
    path: segments,
    capability,
    summary,
    examples: [`ankh navigator ${segments.join(' ')} --help`],
  };
}

/*** Adapt the Ankh execution request to Navigator's narrow command input. */
function binding(
  path: string | readonly string[],
  handler: (
    input: NavigatorCliExecution,
  ) => Promise<{ readonly exitCode: number }> | { readonly exitCode: number },
): NonNullable<AnkhRuntimeCommandProvider['handlers']>[number] {
  return {
    path: typeof path === 'string' ? [path] : path,
    handler: (request: AnkhCommandExecutionRequest) =>
      Promise.resolve(
        handler({
          argv: request.argv,
          cwd: request.context.cwd,
          writeStdout: (text) => request.context.writeStdout(text),
          writeStderr: (text) => request.context.writeStderr(text),
        }),
      ),
  };
}
