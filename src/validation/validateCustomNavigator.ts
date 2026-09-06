import type { AppNavigatorManifest, NavigatorNode } from '@ankhorage/contracts/navigator';

import type { CustomNavigatorRegistry } from '../custom/CustomNavigatorRegistry';
import type { NavigatorDiagnostic, NavigatorValidationContext } from '../definitions/NavigatorPlan';

/*** Validate finite JSON manifest data without accepting functions, symbols, cycles, or prototypes. */
function isPortableConfig(value: unknown, ancestors: Set<object>): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.has(value)) return false;
  if (Array.isArray(value)) {
    if (
      Object.keys(value).length !== value.length ||
      Object.getOwnPropertySymbols(value).length > 0
    ) {
      return false;
    }
  } else {
    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) return false;
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string')) return false;
  }
  ancestors.add(value);
  const valid = Object.values(value).every((entry) => isPortableConfig(entry, ancestors));
  ancestors.delete(value);
  return valid;
}

/*** Add platform and Expo Router compatibility diagnostics for one registered extension. */
function addCompatibilityDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  node: Extract<NavigatorNode, { type: 'custom' }>,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
  registration: CustomNavigatorRegistry[string],
): void {
  if (!registration.platforms.includes(context.platform)) {
    diagnostics.push({
      code: 'unsupported-custom-navigator-platform',
      severity: 'error',
      path: `${pointer}/navigatorId`,
      message: `Custom navigator ${JSON.stringify(node.navigatorId)} does not support ${context.platform}.`,
    });
  }
  if (routerMajor !== undefined && routerMajor < 56) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: `${pointer}/navigatorId`,
      message: 'Registered custom navigators require Expo Router 56.0.0 or newer.',
    });
  }
}

/*** Run one registration's schema-specific validator after the portable JSON boundary. */
function addConfigDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  node: Extract<NavigatorNode, { type: 'custom' }>,
  pointer: string,
  registration: CustomNavigatorRegistry[string],
): void {
  if (!isPortableConfig(node.config ?? {}, new Set())) {
    diagnostics.push({
      code: 'invalid-custom-navigator-config',
      severity: 'error',
      path: `${pointer}/config`,
      message: 'Custom navigator config must contain finite JSON data only.',
    });
    return;
  }
  try {
    for (const issue of registration.validateConfig(node.config)) {
      diagnostics.push({
        code: issue.code,
        severity: 'error',
        path: `${pointer}/config${issue.path ?? ''}`,
        message: issue.message,
      });
    }
  } catch (error) {
    diagnostics.push({
      code: 'custom-navigator-validator-failed',
      severity: 'error',
      path: `${pointer}/config`,
      message: `Custom navigator config validator failed: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/*** Add registry, platform, version, and schema diagnostics for one custom navigator node. */
function addCustomNodeDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  node: Extract<NavigatorNode, { type: 'custom' }>,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
  registry: CustomNavigatorRegistry | undefined,
): void {
  const registration = registry?.[node.navigatorId];
  if (registration === undefined) {
    diagnostics.push({
      code: 'unregistered-custom-navigator',
      severity: 'error',
      path: `${pointer}/navigatorId`,
      message: `Custom navigator ${JSON.stringify(node.navigatorId)} is not registered.`,
    });
    return;
  }
  addCompatibilityDiagnostics(diagnostics, node, pointer, context, routerMajor, registration);
  addConfigDiagnostics(diagnostics, node, pointer, registration);
}

/*** Traverse custom navigator extensions independently from built-in navigator option policy. */
function validateCustomTree(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
  registry: CustomNavigatorRegistry | undefined,
): void {
  if (node.type === 'custom') {
    addCustomNodeDiagnostics(diagnostics, node, pointer, context, routerMajor, registry);
  }
  for (const [index, route] of node.routes.entries()) {
    if (route.navigator !== undefined) {
      validateCustomTree(
        diagnostics,
        route.navigator,
        `${pointer}/routes/${index}/navigator`,
        context,
        routerMajor,
        registry,
      );
    }
  }
}

/*** Validate all deliberately registered custom navigator extension nodes. */
export function addCustomNavigatorDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
  registry: CustomNavigatorRegistry | undefined,
): void {
  validateCustomTree(diagnostics, manifest, '', context, routerMajor, registry);
}
