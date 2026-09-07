import type { NavigatorCliOptions } from '../../types/NavigatorCliOptions';

/*** Enforce each public command's required and accepted option surface. */
export function assertNavigatorCliOptions(
  options: NavigatorCliOptions,
  required: readonly (keyof NavigatorCliOptions)[],
  allowed: readonly (keyof NavigatorCliOptions)[],
): void {
  for (const key of required) {
    if (Reflect.get(options, key) === undefined) {
      throw new Error(`Missing required Navigator option ${optionName(key)}.`);
    }
  }
  const accepted = new Set<keyof NavigatorCliOptions>(['format', ...allowed]);
  for (const [key, value] of Object.entries(options) as [keyof NavigatorCliOptions, unknown][]) {
    if (key === 'includeScreenFiles' && value === true) continue;
    if (!accepted.has(key) && value !== undefined) {
      throw new Error(`Navigator option ${optionName(key)} is not valid for this command.`);
    }
  }
}

/*** Map parsed option properties back to stable public flag names. */
function optionName(key: keyof NavigatorCliOptions): string {
  switch (key) {
    case 'format':
      return '--json';
    case 'id':
      return '--id';
    case 'kind':
      return '--kind';
    case 'manifestPath':
      return '--manifest';
    case 'bindingsPath':
      return '--bindings';
    case 'customNavigatorsPath':
      return '--custom-navigators';
    case 'targetDirectory':
      return '--target';
    case 'platform':
      return '--platform';
    case 'expoRouterVersion':
      return '--expo-router-version';
    case 'responsiveSize':
      return '--responsive-size';
    case 'rootDirectory':
      return '--root-directory';
    case 'includeScreenFiles':
      return '--layouts-only';
  }
}
