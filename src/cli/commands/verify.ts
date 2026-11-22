import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../types/navigatorCli.js';
import type { NavigatorVerificationResult } from '../../types/navigatorVerification.js';
import { assertNavigatorCliOptions } from '../../utils/assertNavigatorCliOptions.js';
import { createNavigatorPlan } from '../../utils/createNavigatorPlan.js';
import { loadNavigatorCliInputAsync } from '../../utils/loadNavigatorCliInputAsync.js';
import { parseNavigatorCliOptions } from '../../utils/parseNavigatorCliOptions.js';
import { reportNavigatorCliResult } from '../../utils/reportNavigatorCliResult.js';
import { verifyNavigator } from '../../utils/verifyNavigator.js';

/*** Verify Navigator-owned structural and deterministic generation evidence without writes. */
export async function verify(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
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
    const loaded = await loadNavigatorCliInputAsync(options, input.cwd, true);
    if (loaded.bindings === undefined) throw new Error('Bindings are required for verification.');
    const verification = verifyNavigator(
      createNavigatorPlan(loaded.manifest, loaded.planOptions),
      loaded.bindings,
      loaded.generationOptions,
    );
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.verify',
      verification,
      verification.diagnostics,
      renderVerification(verification),
    );
  } catch (error) {
    return reportInputFailure(input, error);
  }
}

/*** Render each verification layer without promoting unverified runtime claims. */
function renderVerification(result: NavigatorVerificationResult): readonly string[] {
  return [
    `Support: ${result.support}`,
    `Capabilities: ${result.capabilityIds.join(', ') || 'none'}`,
    `Deterministic: ${result.deterministic ? 'yes' : 'no'}`,
    ...result.checks.map(({ kind, status, message }) => `- ${kind}: ${status} — ${message}`),
  ];
}

/*** Report deterministic Verify-stage input failures. */
function reportInputFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.verify',
    null,
    [
      {
        code: 'invalid-cli-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid verification input.',
      },
    ],
    [],
    true,
  );
}
