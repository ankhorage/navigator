import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../types/navigatorCli';
import { assertNavigatorCliOptions } from '../../utils/assertNavigatorCliOptions';
import { createNavigatorPlan } from '../../utils/createNavigatorPlan';
import { generateNavigator } from '../../utils/generateNavigator';
import { loadNavigatorCliInputAsync } from '../../utils/loadNavigatorCliInputAsync';
import { parseNavigatorCliOptions } from '../../utils/parseNavigatorCliOptions';
import { reportNavigatorCliResult } from '../../utils/reportNavigatorCliResult';
import { writeNavigatorGeneratedFilesAsync } from '../../utils/writeNavigatorGeneratedFilesAsync';

/*** Generate one structured Navigator file set and write it below an explicit target. */
export async function generate(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(
      options,
      ['manifestPath', 'bindingsPath', 'targetDirectory', 'platform', 'expoRouterVersion'],
      [
        'manifestPath',
        'bindingsPath',
        'customNavigatorsPath',
        'targetDirectory',
        'platform',
        'expoRouterVersion',
        'responsiveSize',
        'rootDirectory',
        'includeScreenFiles',
      ],
    );
    const loaded = await loadNavigatorCliInputAsync(options, input.cwd, true);
    if (loaded.bindings === undefined || options.targetDirectory === undefined) {
      throw new Error('Bindings and target directory are required for generation.');
    }
    const plan = createNavigatorPlan(loaded.manifest, loaded.planOptions);
    const result = generateNavigator(plan, loaded.bindings, loaded.generationOptions);
    const hasErrors = result.diagnostics.some(({ severity }) => severity === 'error');
    const written = hasErrors
      ? []
      : await writeNavigatorGeneratedFilesAsync(options.targetDirectory, input.cwd, result.files);
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.generate',
      { ...result, written },
      result.diagnostics,
      [
        `Support: ${result.support}`,
        `Capabilities: ${result.capabilityIds.join(', ') || 'none'}`,
        `Generated files: ${result.files.length}`,
        `Written files: ${written.length}`,
      ],
    );
  } catch (error) {
    return reportInputFailure(input, error);
  }
}

/*** Report deterministic Generate-stage input or write failures. */
function reportInputFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.generate',
    null,
    [
      {
        code: 'invalid-cli-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid generation input.',
      },
    ],
    [],
    true,
  );
}
