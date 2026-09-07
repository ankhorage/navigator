import type { AnkhCapabilityId, AnkhCommandProviderManifest } from '@ankhorage/contracts/cli';

import packageJson from '../../package.json';
import type { NavigatorCliExecution } from '../types/navigatorCli';
import { catalog } from './commands/catalog';
import { generate } from './commands/generate';
import { plan } from './commands/plan';
import { validate } from './commands/validate';
import { verify } from './commands/verify';

export default createCliProvider();

/*** Create the package-owned provider for the standalone Navigator lifecycle. */
function createCliProvider(): NavigatorCliProvider {
  const capabilities = [
    'navigator.catalog',
    'navigator.validate',
    'navigator.plan',
    'navigator.generate',
    'navigator.verify',
  ] as const;
  const commands = [
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
  ] as const;
  return {
    id: packageJson.name,
    category: 'navigator',
    version: packageJson.version,
    capabilities,
    commands,
    handlers: [
      binding('catalog', catalog),
      binding('validate', validate),
      binding('plan', plan),
      binding('generate', generate),
      binding('verify', verify),
    ],
  };
}

interface NavigatorCliProvider extends AnkhCommandProviderManifest {
  readonly handlers: readonly {
    readonly path: readonly string[];
    readonly handler: (request: NavigatorCliRequest) => Promise<{ readonly exitCode: number }>;
  }[];
}

interface NavigatorCliRequest {
  readonly argv: readonly string[];
  readonly context: {
    readonly cwd: string;
    writeStdout(text: string): void;
    writeStderr(text: string): void;
  };
}

/*** Define one public command descriptor from its package-owned capability. */
function descriptor(path: string, capability: AnkhCapabilityId, summary: string) {
  return {
    path: [path],
    capability,
    summary,
    examples: [`ankh navigator ${path} --help`],
  };
}

/*** Adapt the Ankh execution request to Navigator's narrow command input. */
function binding(
  path: string,
  handler: (
    input: NavigatorCliExecution,
  ) => Promise<{ readonly exitCode: number }> | { readonly exitCode: number },
): NavigatorCliProvider['handlers'][number] {
  return {
    path: [path],
    handler: (request) =>
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
