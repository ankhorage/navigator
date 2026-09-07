import type { AnkhCapabilityId } from '@ankhorage/contracts/cli';

import packageJson from '../../../package.json';
import type { NavigatorCliExecution } from '../../types/NavigatorCliExecution';
import type { NavigatorRuntimeProvider } from '../../types/NavigatorRuntimeProvider';
import { runNavigatorCatalogCommand } from '../commands/runNavigatorCatalogCommand';
import { runNavigatorGenerateCommand } from '../commands/runNavigatorGenerateCommand';
import { runNavigatorPlanCommand } from '../commands/runNavigatorPlanCommand';
import { runNavigatorValidateCommand } from '../commands/runNavigatorValidateCommand';
import { runNavigatorVerifyCommand } from '../commands/runNavigatorVerifyCommand';

/*** Create the package-owned provider for the standalone Navigator lifecycle. */
export function createNavigatorRuntimeProvider(): NavigatorRuntimeProvider {
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
    capabilities: CAPABILITIES,
    commands,
    handlers: [
      binding('catalog', runNavigatorCatalogCommand),
      binding('validate', runNavigatorValidateCommand),
      binding('plan', runNavigatorPlanCommand),
      binding('generate', runNavigatorGenerateCommand),
      binding('verify', runNavigatorVerifyCommand),
    ],
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

const CAPABILITIES = [
  'navigator.catalog',
  'navigator.validate',
  'navigator.plan',
  'navigator.generate',
  'navigator.verify',
] as const;

/*** Adapt the Ankh execution request to Navigator's narrow command input. */
function binding(
  path: string,
  handler: (
    input: NavigatorCliExecution,
  ) => Promise<{ readonly exitCode: number }> | { readonly exitCode: number },
): NavigatorRuntimeProvider['handlers'][number] {
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
