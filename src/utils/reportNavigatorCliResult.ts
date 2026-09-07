import type { NavigatorDiagnostic } from '@ankhorage/contracts/navigator';

import type { NavigatorCliExecution, NavigatorCliRunResult } from '../types/navigatorCli';

/*** Render one stable human or JSON Navigator command result with deterministic exit semantics. */
export function reportNavigatorCliResult(
  input: NavigatorCliExecution,
  format: 'human' | 'json',
  command: string,
  data: unknown,
  diagnostics: readonly NavigatorDiagnostic[],
  humanLines: readonly string[],
  invalidInput = false,
): NavigatorCliRunResult {
  const hasErrors = diagnostics.some(({ severity }) => severity === 'error');
  const exitCode = invalidInput ? 2 : hasErrors ? 1 : 0;
  if (format === 'json') {
    input.writeStdout(
      `${JSON.stringify({ schemaVersion: 1, command, ok: exitCode === 0, data, diagnostics })}\n`,
    );
    return { exitCode };
  }
  if (humanLines.length > 0) input.writeStdout(`${humanLines.join('\n')}\n`);
  for (const diagnostic of diagnostics) {
    const line = `${diagnostic.severity.toUpperCase()} ${diagnostic.code}${diagnostic.path === '' ? '' : ` ${diagnostic.path}`}: ${diagnostic.message}\n`;
    if (diagnostic.severity === 'error') input.writeStderr(line);
    else input.writeStdout(line);
  }
  return { exitCode };
}
