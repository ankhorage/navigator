import type {
  NavigatorAdapterPlan,
  NavigatorRuntimePlatform,
  TabsNavigatorPlan,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';

/*** Describe Tabs adapter support, stability, and limitations for the target platform and version. */
export function createTabsAdapter(
  tabs: TabsNavigatorPlan,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const nativeUnavailable =
    tabs.implementation === 'native' &&
    (platform === 'web' ||
      routerMajor === undefined ||
      routerMajor < NAVIGATOR_ROUTER_POLICY.nativeTabsMinimumMajor);
  return {
    id: `tabs.${tabs.implementation}`,
    module: tabs.module,
    exportName: tabs.exportName,
    support: nativeUnavailable ? 'unsupported' : 'supported',
    stability: tabs.stability,
    limitations:
      tabs.implementation === 'native'
        ? [
            `Alpha API; unavailable on web and requires Expo Router ${NAVIGATOR_ROUTER_POLICY.nativeTabsMinimumMajor}.0.0 or newer.`,
          ]
        : tabs.implementation === 'headless'
          ? ['Surface presentation over Expo Router headless tabs.']
          : [],
  };
}
