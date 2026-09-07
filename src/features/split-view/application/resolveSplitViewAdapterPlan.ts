import type {
  NavigatorAdapterPlan,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';

/*** Resolve the upstream iOS Split View adapter and its honest cross-platform Slot fallback. */
export function resolveSplitViewAdapterPlan(
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  return {
    id: 'split-view',
    module: 'expo-router/unstable-split-view',
    exportName: 'SplitView',
    support:
      platform === 'ios' &&
      routerMajor !== undefined &&
      routerMajor >= NAVIGATOR_ROUTER_POLICY.splitViewMinimumMajor
        ? 'testing-only'
        : 'unsupported',
    stability: 'alpha',
    limitations:
      platform === 'ios'
        ? [
            'Testing-only iOS API; iPhone collapses columns through upstream navigation state.',
            'Inspector requires iOS 26 or newer.',
          ]
        : [
            'Expo Router renders a Slot fallback; split-pane presentation is unavailable on this platform.',
          ],
  };
}
