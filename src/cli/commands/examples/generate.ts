import type { NavigatorCliExecution, NavigatorCliRunResult } from '../../../types/navigatorCli';
import type { NavigatorExampleGenerationResult } from '../../../types/navigatorExamples';
import { assertNavigatorCliOptions } from '../../../utils/assertNavigatorCliOptions';
import { generateNavigatorExamples } from '../../../utils/generateNavigatorExamples';
import { isNavigatorExampleId } from '../../../utils/isNavigatorExampleId';
import { parseNavigatorCliOptions } from '../../../utils/parseNavigatorCliOptions';
import { reportNavigatorCliResult } from '../../../utils/reportNavigatorCliResult';
import { writeNavigatorGeneratedFilesAsync } from '../../../utils/writeNavigatorGeneratedFilesAsync';

/*** Generate one or every standalone example below a root examples directory. */
export async function generate(input: NavigatorCliExecution): Promise<NavigatorCliRunResult> {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(options, ['targetDirectory'], ['id', 'targetDirectory']);
    if (options.id !== undefined && !isNavigatorExampleId(options.id)) {
      throw new Error(`Unknown Navigator example ${JSON.stringify(options.id)}.`);
    }
    if (options.targetDirectory === undefined) throw new Error('Target directory is required.');
    const result: NavigatorExampleGenerationResult = generateNavigatorExamples(options.id);
    const written = await writeNavigatorGeneratedFilesAsync(
      options.targetDirectory,
      input.cwd,
      result.files,
    );
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.examples.generate',
      { ...result, written },
      [],
      [`Examples: ${result.examples.length}`, `Written files: ${written.length}`],
    );
  } catch (error) {
    return reportFailure(input, error);
  }
}

/*** Report deterministic example-generation input or write failures. */
function reportFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  return reportNavigatorCliResult(
    input,
    input.argv.includes('--json') ? 'json' : 'human',
    'navigator.examples.generate',
    null,
    [
      {
        code: 'invalid-example-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid example generation input.',
      },
    ],
    [],
    true,
  );
}
