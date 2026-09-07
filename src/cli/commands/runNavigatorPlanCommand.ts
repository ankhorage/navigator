import type {
  NavigatorCliExecution,
  NavigatorCliRunResult,
} from '../../types/NavigatorCliExecution';
import { createNavigatorPlan } from '../../utils/createNavigatorPlan';
import { assertNavigatorCliOptions } from './assertNavigatorCliOptions';
import { loadNavigatorCliInput } from './loadNavigatorCliInput';
import { parseNavigatorCliOptions } from './parseNavigatorCliOptions';
import { reportNavigatorCliResult } from './reportNavigatorCliResult';

/*** Resolve and print one deterministic Navigator plan and its dependency requirements. */
export async function runNavigatorPlanCommand(
  input: NavigatorCliExecution,
): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(
      options,
      ['manifestPath', 'platform', 'expoRouterVersion'],
      ['manifestPath', 'customNavigatorsPath', 'platform', 'expoRouterVersion', 'responsiveSize'],
    );
    const loaded = await loadNavigatorCliInput(options, input.cwd, false);
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
