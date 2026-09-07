import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../types/navigatorCli';
import { assertNavigatorCliOptions } from '../../utils/assertNavigatorCliOptions';
import { createNavigatorPlan } from '../../utils/createNavigatorPlan';
import { loadNavigatorCliInputAsync } from '../../utils/loadNavigatorCliInputAsync';
import { parseNavigatorCliOptions } from '../../utils/parseNavigatorCliOptions';
import { reportNavigatorCliResult } from '../../utils/reportNavigatorCliResult';

/*** Resolve and print one deterministic Navigator plan and its dependency requirements. */
export async function plan(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(
      options,
      ['manifestPath', 'platform', 'expoRouterVersion'],
      ['manifestPath', 'customNavigatorsPath', 'platform', 'expoRouterVersion', 'responsiveSize'],
    );
    const loaded = await loadNavigatorCliInputAsync(options, input.cwd, false);
    const plan = createNavigatorPlan(loaded.manifest, loaded.planOptions);
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.plan',
      plan,
      plan.diagnostics,
      [
        `Support: ${plan.support}`,
        `Capabilities: ${plan.capabilityIds.join(', ') || 'none'}`,
        'Dependencies:',
        ...plan.dependencies.map(
          ({ packageName, versionRange }) => `- ${packageName}: ${versionRange}`,
        ),
      ],
    );
  } catch (error) {
    return reportInputFailure(input, error);
  }
}

/*** Report deterministic Plan-stage input failures. */
function reportInputFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.plan',
    null,
    [
      {
        code: 'invalid-cli-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid planning input.',
      },
    ],
    [],
    true,
  );
}
