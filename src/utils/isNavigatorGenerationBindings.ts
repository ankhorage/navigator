import type {
  NavigatorGenerationBindings,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';

/*** Narrow unknown CLI or composer input to the portable generated-module binding shape. */
export function isNavigatorGenerationBindings(
  value: unknown,
): value is NavigatorGenerationBindings {
  if (!isRecord(value) || !hasOnlyKeys(value, BINDING_KEYS)) return false;
  if (!isModuleRecord(value.screens) || !isModuleRecord(value.guards)) return false;
  if (value.tabPresentations !== undefined && !isModuleRecord(value.tabPresentations)) return false;
  return value.iconSourceResolver === undefined || isModule(value.iconSourceResolver);
}

/*** Validate a record of static module/symbol pairs. */
function isModuleRecord(value: unknown): value is Readonly<Record<string, NavigatorScreenModule>> {
  return isRecord(value) && Object.values(value).every(isModule);
}

/*** Validate one static module/symbol pair before semantic binding checks. */
function isModule(value: unknown): value is NavigatorScreenModule {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, MODULE_KEYS) &&
    typeof value.module === 'string' &&
    typeof value.exportName === 'string'
  );
}

/*** Check an object-like JSON value without accepting arrays. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/*** Reject accidental Studio or application context at the narrow binding boundary. */
function hasOnlyKeys(value: Readonly<Record<string, unknown>>, keys: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => keys.has(key));
}

const BINDING_KEYS = new Set(['screens', 'guards', 'iconSourceResolver', 'tabPresentations']);

const MODULE_KEYS = new Set(['module', 'exportName']);
