import type { TabsImplementationConfig } from '@ankhorage/contracts/navigator';

import type { NavigatorResponsiveSize } from '../../../utils/NavigatorResponsiveSize';
import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import type { TabsNavigatorPlan } from '../domain/TabsNavigatorPlan';
import { resolveTabsNavigatorPlan } from './resolveTabsNavigatorPlan';

/*** Retain an unavailable native-web plan for diagnostics or resolve the supported Tabs adapter. */
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
