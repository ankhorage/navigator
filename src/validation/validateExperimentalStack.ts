import type {
  AppNavigatorManifest,
  NavigatorNode,
  StackImplementation,
  StackScreenOptions,
} from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic, NavigatorValidationContext } from '../definitions/NavigatorPlan';
import { resolveEffectiveStackConfigSource } from '../expo-router/resolveNavigatorConfig';

const SUPPORTED_EXPERIMENTAL_STACK_OPTIONS = new Set([
  'title',
  'headerShown',
  'headerTransparent',
  'headerBackVisible',
]);

interface ResolvedStackLocation {
  implementation: StackImplementation;
  pointer: string;
}

interface ExperimentalStackAudit {
  locations: ResolvedStackLocation[];
  validatedConfigPointers: Set<string>;
}

/*** Add actionable diagnostics for options ignored by Expo Router Experimental Stack. */
function addUnsupportedOptionDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  options: StackScreenOptions | undefined,
  pointer: string,
): void {
  if (options === undefined) return;
  for (const key of Object.keys(options).sort()) {
    if (SUPPORTED_EXPERIMENTAL_STACK_OPTIONS.has(key)) continue;
    diagnostics.push({
      code: 'unsupported-experimental-stack-option',
      severity: 'error',
      path: `${pointer}/${key}`,
      message: `Experimental Stack ignores ${JSON.stringify(key)}; use only title, headerShown, headerTransparent, or headerBackVisible.`,
    });
  }
}

/*** Audit one resolved experimental Stack node and its route-level option surface. */
function auditExperimentalStackNode(
  diagnostics: NavigatorDiagnostic[],
  node: Extract<NavigatorNode, { type: 'stack' }>,
  nodePointer: string,
  configPointer: string,
  configOptions: StackScreenOptions | undefined,
  audit: ExperimentalStackAudit,
): void {
  if (!audit.validatedConfigPointers.has(configPointer)) {
    addUnsupportedOptionDiagnostics(diagnostics, configOptions, `${configPointer}/options`);
    audit.validatedConfigPointers.add(configPointer);
  }
  for (const [index, route] of node.routes.entries()) {
    addUnsupportedOptionDiagnostics(
      diagnostics,
      route.stackOptions,
      `${nodePointer}/routes/${index}/stackOptions`,
    );
  }
}

/*** Traverse the authored topology using the resolved platform and default precedence. */
function auditStackTree(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: NavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  audit: ExperimentalStackAudit,
): void {
  if (node.type === 'stack') {
    const resolved = resolveEffectiveStackConfigSource(manifest, node, context.platform, pointer);
    const implementation = resolved.config.implementation ?? 'native';
    audit.locations.push({ implementation, pointer: `${resolved.pointer}/implementation` });
    if (implementation === 'experimental') {
      auditExperimentalStackNode(
        diagnostics,
        node,
        pointer,
        resolved.pointer,
        resolved.config.options,
        audit,
      );
    }
  }
  for (const [index, route] of node.routes.entries()) {
    if (route.navigator !== undefined) {
      auditStackTree(
        diagnostics,
        manifest,
        route.navigator,
        `${pointer}/routes/${index}/navigator`,
        context,
        audit,
      );
    }
  }
}

/*** Add app-wide platform, version, option, and runtime requirements for Experimental Stack. */
export function addExperimentalStackDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const audit: ExperimentalStackAudit = { locations: [], validatedConfigPointers: new Set() };
  auditStackTree(diagnostics, manifest, manifest, '', context, audit);
  const experimental = audit.locations.filter(
    ({ implementation }) => implementation === 'experimental',
  );
  if (experimental.length === 0) return;

  if (routerMajor !== undefined && routerMajor < 56) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: experimental[0]?.pointer ?? '',
      message: 'Experimental Stack requires Expo Router 56.0.0 or newer.',
    });
  }
  if (context.platform === 'android') {
    diagnostics.push({
      code: 'android-predictive-back-required',
      severity: 'warning',
      path: experimental[0]?.pointer ?? '',
      message:
        'The app-config owner must set android.predictiveBackGestureEnabled to true for Experimental Stack.',
    });
    if (audit.locations.some(({ implementation }) => implementation === 'native')) {
      diagnostics.push({
        code: 'mixed-android-stack-implementations',
        severity: 'error',
        path: experimental[0]?.pointer ?? '',
        message:
          'Experimental Stack and the standard native Stack cannot coexist in one Android app; resolve every Stack node to one implementation.',
      });
    }
  }
}
