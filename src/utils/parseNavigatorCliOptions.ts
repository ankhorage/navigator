import type { NavigatorCliOptions } from '../types/navigatorCli';

/*** Parse deterministic Navigator command flags without reading files or process globals. */
export function parseNavigatorCliOptions(argv: readonly string[]): NavigatorCliOptions {
  const values = new Map<string, string>();
  let format: NavigatorCliOptions['format'] = 'human';
  let includeScreenFiles = true;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv.at(index);
    if (argument === '--json') {
      format = 'json';
      continue;
    }
    if (argument === '--layouts-only') {
      includeScreenFiles = false;
      continue;
    }
    if (argument === undefined || !VALUE_FLAGS.has(argument)) {
      throw new Error(`Unknown Navigator option ${JSON.stringify(argument)}.`);
    }
    const value = argv.at(index + 1);
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Navigator option ${argument} requires a value.`);
    }
    if (values.has(argument)) throw new Error(`Navigator option ${argument} was repeated.`);
    values.set(argument, value);
    index += 1;
  }
  const platform = finiteValue(values, '--platform', PLATFORMS);
  const responsiveSize = finiteValue(values, '--responsive-size', RESPONSIVE_SIZES);
  const kind = finiteValue(values, '--kind', CATALOG_KINDS);
  return {
    format,
    includeScreenFiles,
    ...optional('id', values.get('--id')),
    ...optional('kind', kind as NavigatorCliOptions['kind']),
    ...optional('manifestPath', values.get('--manifest')),
    ...optional('bindingsPath', values.get('--bindings')),
    ...optional('customNavigatorsPath', values.get('--custom-navigators')),
    ...optional('targetDirectory', values.get('--target')),
    ...optional('platform', platform as NavigatorCliOptions['platform']),
    ...optional('expoRouterVersion', values.get('--expo-router-version')),
    ...optional('responsiveSize', responsiveSize as NavigatorCliOptions['responsiveSize']),
    ...optional('rootDirectory', values.get('--root-directory')),
  };
}

/*** Read one finite flag value and reject values outside its public vocabulary. */
function finiteValue(
  values: ReadonlyMap<string, string>,
  flag: string,
  allowed: ReadonlySet<string>,
): string | undefined {
  const value = values.get(flag);
  if (value !== undefined && !allowed.has(value)) {
    throw new Error(`${flag} must be one of: ${[...allowed].join(', ')}.`);
  }
  return value;
}

/*** Include optional parsed values without materializing undefined fields. */
function optional<Key extends keyof NavigatorCliOptions>(
  key: Key,
  value: NavigatorCliOptions[Key],
): Partial<Pick<NavigatorCliOptions, Key>> {
  return value === undefined ? {} : ({ [key]: value } as Pick<NavigatorCliOptions, Key>);
}

const VALUE_FLAGS = new Set([
  '--id',
  '--kind',
  '--manifest',
  '--bindings',
  '--custom-navigators',
  '--target',
  '--platform',
  '--expo-router-version',
  '--responsive-size',
  '--root-directory',
]);

const PLATFORMS = new Set(['android', 'ios', 'web']);

const RESPONSIVE_SIZES = new Set(['compact', 'medium', 'expanded']);

const CATALOG_KINDS = new Set(['capability', 'preset']);
