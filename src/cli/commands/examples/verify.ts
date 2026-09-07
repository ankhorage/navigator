import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../../types/navigatorCli';
import type { NavigatorExampleVerificationResult } from '../../../types/navigatorExamples';
import { assertNavigatorCliOptions } from '../../../utils/assertNavigatorCliOptions';
import { isNavigatorExampleId } from '../../../utils/isNavigatorExampleId';
import { parseNavigatorCliOptions } from '../../../utils/parseNavigatorCliOptions';
import { reportNavigatorCliResult } from '../../../utils/reportNavigatorCliResult';
import { verifyNavigatorExamplesAsync } from '../../../utils/verifyNavigatorExamplesAsync';

/*** Verify one or every root example against deterministic generation and lockfile ownership. */
export async function verify(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(options, ['targetDirectory'], ['id', 'targetDirectory']);
    if (options.id !== undefined && !isNavigatorExampleId(options.id)) {
      throw new Error(`Unknown Navigator example ${JSON.stringify(options.id)}.`);
    }
    if (options.targetDirectory === undefined) throw new Error('Target directory is required.');
    const result: NavigatorExampleVerificationResult = await verifyNavigatorExamplesAsync(
      options.targetDirectory,
      input.cwd,
      options.id,
    );
    const stale = result.examples.filter(({ current }) => !current);
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.examples.verify',
      result,
      stale.length === 0
        ? []
        : [
            {
              code: 'stale-examples',
              severity: 'error',
              path: '/examples',
              message: `${stale.length} Navigator example(s) are missing or stale.`,
            },
          ],
      [
        `Examples: ${result.examples.length}`,
        `Current: ${result.examples.length - stale.length}`,
        `Stale: ${stale.length}`,
      ],
    );
  } catch (error) {
    return reportFailure(input, error);
  }
}

/*** Report deterministic example-verification input or filesystem failures. */
function reportFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.examples.verify',
    null,
    [
      {
        code: 'invalid-example-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid example verification input.',
      },
    ],
    [],
    true,
  );
}
