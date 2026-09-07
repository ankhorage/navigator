import type {
  NavigatorAdapterPlan,
  NavigatorRuntimePlatform,
  StackImplementationConfig,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';

/*** Resolve a Stack implementation to its version- and platform-aware Expo Router adapter. */
export function createStackAdapter(
  stack: StackImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const implementation = stack?.implementation ?? 'native';
  if (implementation === 'javascript') return createJavaScriptStackAdapter(routerMajor);
  if (implementation === 'experimental')
    return createExperimentalStackAdapter(platform, routerMajor);
  return {
    id: 'stack.native',
    module: 'expo-router',
    exportName: 'Stack',
    support: 'supported',
    stability: 'stable',
    limitations: [],
  };
}

/*** Resolve the version-gated JavaScript Stack adapter. */
function createJavaScriptStackAdapter(routerMajor: number | undefined): NavigatorAdapterPlan {
  return {
    id: 'stack.javascript',
    module: 'expo-router/js-stack',
    exportName: 'Stack',
    support:
      routerMajor !== undefined &&
      routerMajor >= NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor
        ? 'supported'
        : 'unsupported',
    stability: 'stable',
    limitations: [
      `Requires Expo Router ${NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor}.0.0 or newer.`,
    ],
  };
}

/*** Resolve the platform- and version-gated Experimental Stack adapter. */
function createExperimentalStackAdapter(
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  return {
    id: 'stack.experimental',
    module: 'expo-router',
    exportName: 'ExperimentalStack',
    support:
      platform !== 'web' &&
      routerMajor !== undefined &&
      routerMajor >= NAVIGATOR_ROUTER_POLICY.experimentalStackMinimumMajor
        ? 'testing-only'
        : 'unsupported',
    stability: 'alpha',
    limitations:
      platform === 'web'
        ? ['Testing-only API; Expo Router falls back to the standard Stack on web.']
        : [
            'Testing-only API; supports only title and header visibility options.',
            ...(platform === 'android'
              ? [
                  'Cannot coexist with the standard native Stack on Android.',
                  'Requires android.predictiveBackGestureEnabled in app config.',
                ]
              : []),
          ],
  };
}
