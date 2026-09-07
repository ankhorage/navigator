import type { AppNavigatorManifest, StackNavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic } from '../../../utils/NavigatorDiagnostic';
import type { NavigatorValidationContext } from '../../../utils/NavigatorValidationContext';
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

  if (implementation === 'javascript' && routerMajor !== undefined && routerMajor < 56) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: `${pointer}/implementation`,
      message: 'The JavaScript Stack entry point requires Expo Router 56.0.0 or newer.',
    });
  }
}
