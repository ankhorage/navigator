import type {
  NavigatorResponsiveSize,
  NavigatorRuntimePlatform,
  TabsImplementationConfig,
  TabsNavigatorPlan,
} from '@ankhorage/contracts/navigator';

import { resolveTabsNavigatorPlan } from './resolveTabsNavigatorPlan';

/*** Retain an unsupported native-web plan for diagnostics or resolve the selected Tabs adapter. */
export function resolveTabsPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  responsiveSize: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  if (config?.implementation === 'native' && platform === 'web') {
    return {
      implementation: 'native',
      module: 'expo-router/unstable-native-tabs',
      exportName: 'NativeTabs',
      stability: 'alpha',
    };
  }
  return resolveTabsNavigatorPlan(config, platform, responsiveSize);
}
