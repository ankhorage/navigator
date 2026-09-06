import type { NavigatorAdapterPlan, NavigatorRuntimePlatform } from '../definitions/NavigatorPlan';

/*** Resolve the upstream iOS Split View adapter and its honest cross-platform Slot fallback. */
export function resolveSplitViewAdapterPlan(
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  return {
    id: 'split-view',
    module: 'expo-router/unstable-split-view',
    exportName: 'SplitView',
    support: routerMajor !== undefined && routerMajor >= 55 ? 'supported' : 'unavailable',
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
