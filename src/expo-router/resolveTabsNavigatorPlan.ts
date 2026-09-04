import type { AdaptiveTabsConfig, TabsImplementationConfig } from '@ankhorage/contracts/navigator';

import type {
  NavigatorResponsiveSize,
  NavigatorRuntimePlatform,
  TabsNavigatorPlan,
} from '../definitions/NavigatorPlan';
import { resolveCustomTabsPresentation } from '../presentation/resolveCustomTabsPresentation';

const DEFAULT_WEB_CUSTOM_TABS = {
  presentation: 'responsive',
} as const;

/*** Return the adaptive config when omission or `adaptive` selects that branch. */
function resolveAdaptiveConfig(
  config: TabsImplementationConfig | undefined,
): AdaptiveTabsConfig | undefined {
  if (config === undefined) return undefined;
  return config.implementation === undefined || config.implementation === 'adaptive'
    ? config
    : undefined;
}

/*** Resolve the Expo Router module/export and presentation for one tabs implementation. */
export function resolveTabsNavigatorPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  const implementation = config?.implementation ?? 'adaptive';

  if (implementation === 'adaptive') {
    if (platform === 'web') {
      const resolved = resolveCustomTabsPresentation(
        resolveAdaptiveConfig(config)?.web ?? DEFAULT_WEB_CUSTOM_TABS,
        size,
      );
      return {
        implementation: 'custom',
        module: 'expo-router/ui',
        exportName: 'Tabs',
        stability: 'stable',
        ...resolved,
      };
    }

    return {
      implementation: 'native',
      module: 'expo-router/unstable-native-tabs',
      exportName: 'NativeTabs',
      stability: 'unstable',
    };
  }

  if (implementation === 'native') {
    if (platform === 'web') {
      throw new Error('Native tabs are not available for the Web navigator plan.');
    }
    return {
      implementation: 'native',
      module: 'expo-router/unstable-native-tabs',
      exportName: 'NativeTabs',
      stability: 'unstable',
    };
  }

  if (implementation === 'javascript') {
    const top = config.presentation === 'top';
    return {
      implementation: 'javascript',
      module: top ? 'expo-router/js-top-tabs' : 'expo-router/js-tabs',
      exportName: top ? 'TopTabs' : 'Tabs',
      stability: 'stable',
      presentation: top ? 'top' : 'bottom',
    };
  }

  const resolved = resolveCustomTabsPresentation(config, size);
  return {
    implementation: 'custom',
    module: 'expo-router/ui',
    exportName: 'Tabs',
    stability: 'stable',
    ...resolved,
  };
}
