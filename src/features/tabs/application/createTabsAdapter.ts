import type { NavigatorAdapterPlan } from '../../../utils/NavigatorAdapterPlan';
import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import type { TabsNavigatorPlan } from '../domain/TabsNavigatorPlan';

/*** Describe Tabs adapter support, stability, and limitations for the target platform and version. */
export function createTabsAdapter(
  tabs: TabsNavigatorPlan,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const nativeUnavailable =
    tabs.implementation === 'native' &&
    (platform === 'web' || routerMajor === undefined || routerMajor < 54);
  return {
    id: `tabs.${tabs.implementation}`,
    module: tabs.module,
    exportName: tabs.exportName,
    support: nativeUnavailable ? 'unavailable' : 'supported',
    stability: tabs.stability,
    limitations:
      tabs.implementation === 'native'
        ? ['Alpha API; unavailable on web and requires Expo Router 54.0.0 or newer.']
        : tabs.implementation === 'custom'
          ? ['Surface presentation over Expo Router headless tabs.']
          : [],
  };
}
