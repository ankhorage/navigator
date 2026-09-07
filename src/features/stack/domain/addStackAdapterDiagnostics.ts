import type {
  AppNavigatorManifest,
  NavigatorDiagnostic,
  NavigatorValidationContext,
  StackNavigatorNode,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';
import { resolveEffectiveStackConfig } from './resolveEffectiveStackConfig';

/*** Diagnose a JavaScript Stack selection that requires a newer Expo Router version. */
export function addStackAdapterDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const config = resolveEffectiveStackConfig(manifest, node, context.platform);
  const implementation = config.implementation ?? 'native';

  if (
    implementation === 'javascript' &&
    routerMajor !== undefined &&
    routerMajor < NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor
  ) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: `${pointer}/implementation`,
      message: `The JavaScript Stack entry point requires Expo Router ${NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor}.0.0 or newer.`,
    });
  }
}
