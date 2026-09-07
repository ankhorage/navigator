import type { NavigatorDiagnostic } from '@ankhorage/contracts/navigator';

import { getNavigatorCatalog } from '../../features/catalog/adapters/inbound/getNavigatorCatalog';
import type {
  NavigatorCliExecution,
  NavigatorCliRunResult,
} from '../../types/NavigatorCliExecution';
import { assertNavigatorCliOptions } from './assertNavigatorCliOptions';
import { parseNavigatorCliOptions } from './parseNavigatorCliOptions';
import { reportNavigatorCliResult } from './reportNavigatorCliResult';

/*** List or inspect the package-owned capability and preset catalog. */
export function runNavigatorCatalogCommand(input: NavigatorCliExecution): NavigatorCliRunResult {
  try {
    const options = parseNavigatorCliOptions(input.argv);
    assertNavigatorCliOptions(options, [], ['id', 'kind']);
    const catalog = getNavigatorCatalog();
    const selection = selectCatalog(catalog, options.id, options.kind);
    return reportNavigatorCliResult(
      input,
      options.format,
      'navigator.catalog',
      selection.data,
      selection.diagnostics,
      renderCatalog(selection.data),
    );
  } catch (error) {
    return reportInputFailure(input, error);
  }
}

/*** Select an unambiguous catalog entry or a filtered listing. */
function selectCatalog(
  catalog: ReturnType<typeof getNavigatorCatalog>,
  id: string | undefined,
  kind: 'capability' | 'preset' | undefined,
): { readonly data: unknown; readonly diagnostics: readonly NavigatorDiagnostic[] } {
  const capabilities = catalog.capabilities.filter((entry) => entry.id === id);
  const presets = catalog.presets.filter((entry) => entry.id === id);
  const matches =
    kind === 'capability'
      ? capabilities
      : kind === 'preset'
        ? presets
        : [...capabilities, ...presets];
  const listing =
    kind === 'capability' ? catalog.capabilities : kind === 'preset' ? catalog.presets : catalog;
  if (id === undefined) return { data: listing, diagnostics: [] };
  if (matches.length === 1) return { data: matches[0], diagnostics: [] };
  const ambiguous = matches.length > 1;
  return {
    data: undefined,
    diagnostics: [
      {
        code: ambiguous ? 'ambiguous-catalog-entry' : 'unknown-catalog-entry',
        severity: 'error',
        path: '/id',
        message: ambiguous
          ? `Catalog id ${JSON.stringify(id)} names both a capability and a preset; add --kind.`
          : `No capability or preset is registered as ${JSON.stringify(id)}.`,
      },
    ],
  };
}

/*** Render compact human catalog output without creating a second metadata table. */
function renderCatalog(value: unknown): readonly string[] {
  if (value === undefined) return [];
  if (typeof value !== 'object' || value === null) return [JSON.stringify(value)];
  if ('capabilities' in value && 'presets' in value) {
    const catalog = getNavigatorCatalog();
    return [
      'Navigator capabilities',
      ...catalog.capabilities.map(
        ({ id, targets }) =>
          `- ${id}: ${targets.map(({ platform, support }) => `${platform}=${support}`).join(', ')}`,
      ),
      'Navigator presets',
      ...catalog.presets.map(({ id, description }) => `- ${id}: ${description}`),
    ];
  }
  return [JSON.stringify(value, null, 2)];
}

/*** Report deterministic option and input failures. */
function reportInputFailure(input: NavigatorCliExecution, error: unknown): NavigatorCliRunResult {
  const format = input.argv.includes('--json') ? 'json' : 'human';
  return reportNavigatorCliResult(
    input,
    format,
    'navigator.catalog',
    null,
    [
      {
        code: 'invalid-cli-input',
        severity: 'error',
        path: '',
        message: error instanceof Error ? error.message : 'Invalid catalog input.',
      },
    ],
    [],
    true,
  );
}
