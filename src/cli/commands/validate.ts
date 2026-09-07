import type { CreateNavigatorPlanOptions } from '@ankhorage/contracts/navigator';

import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../types/navigatorCli';
import { assertNavigatorCliOptions } from '../../utils/assertNavigatorCliOptions';
import { loadCustomNavigatorRegistryAsync } from '../../utils/loadCustomNavigatorRegistryAsync';
import { parseNavigatorCliOptions } from '../../utils/parseNavigatorCliOptions';
import { readNavigatorCliJsonAsync } from '../../utils/readNavigatorCliJsonAsync';
import { reportNavigatorCliResult } from '../../utils/reportNavigatorCliResult';
import { validateNavigator } from '../../utils/validateNavigator';

/*** Structurally and semantically validate a manifest and narrow bindings without writes. */
export async function validate(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(
      options,
      ['manifestPath', 'bindingsPath', 'platform', 'expoRouterVersion'],
      [
        'manifestPath',
        'bindingsPath',
        'customNavigatorsPath',
        'platform',
        'expoRouterVersion',
        'responsiveSize',
        'rootDirectory',
        'includeScreenFiles',
      ],
    );
    const { manifestPath, bindingsPath } = options;
    if (manifestPath === undefined || bindingsPath === undefined) {
      throw new Error('Manifest and bindings paths are required for validation.');
    }
    const manifest = await readNavigatorCliJsonAsync(manifestPath, input.cwd);
    const bindings = await readNavigatorCliJsonAsync(bindingsPath, input.cwd);
    const planOptions = await createPlanOptions(options, input.cwd);
    const diagnostics = validateNavigator(manifest, bindings, planOptions, {
      includeScreenFiles: options.includeScreenFiles,
      ...(options.rootDirectory === undefined ? {} : { rootDirectory: options.rootDirectory }),
    });
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.validate',
      { valid: !diagnostics.some(({ severity }) => severity === 'error') },
      diagnostics,
      [diagnostics.length === 0 ? 'Navigator input is valid.' : 'Navigator input has diagnostics.'],
    );
  } catch (error) {
    return reportInputFailure(input, error);
  }
}

/*** Resolve target context and an optional executable custom-navigator registry. */
async function createPlanOptions(
  options: ReturnType<typeof parseNavigatorCliOptions>,
  cwd: string,
): Promise<CreateNavigatorPlanOptions> {
  const { platform, expoRouterVersion } = options;
  if (platform === undefined || expoRouterVersion === undefined) {
    throw new Error('Platform and Expo Router version are required for validation.');
  }
  const customNavigators = await loadCustomNavigatorRegistryAsync(
    options.customNavigatorsPath,
    cwd,
  );
  return {
    platform,
    expoRouterVersion,
    ...(options.responsiveSize === undefined ? {} : { responsiveSize: options.responsiveSize }),
    ...(customNavigators === undefined ? {} : { customNavigators }),
  };
}

/*** Report file, JSON, registry, and option failures separately from navigator diagnostics. */
function reportInputFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.validate',
    null,
    [
      {
        code: 'invalid-cli-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid validation input.',
      },
    ],
    [],
    true,
  );
}
