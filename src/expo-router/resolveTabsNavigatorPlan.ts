import type {
  AdaptiveTabsConfig,
  CustomTabsConfig,
  JavaScriptTabsConfig,
  TabsImplementationConfig,
} from '@ankhorage/contracts/navigator';

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

/*** Create the SDK 57 native-tabs plan and reject unsupported Web usage. */
function createNativeTabsPlan(platform: NavigatorRuntimePlatform): TabsNavigatorPlan {
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

/*** Create the stable JavaScript tabs plan for bottom or top presentation. */
function createJavaScriptTabsPlan(config: JavaScriptTabsConfig): TabsNavigatorPlan {
  const top = config.presentation === 'top';
  return {
    implementation: 'javascript',
    module: top ? 'expo-router/js-top-tabs' : 'expo-router/js-tabs',
    exportName: top ? 'TopTabs' : 'Tabs',
    stability: 'stable',
    presentation: top ? 'top' : 'bottom',
  };
}

/*** Create the stable headless custom-tabs plan for Web or explicit custom use. */
function createCustomTabsPlan(
  config: Omit<CustomTabsConfig, 'implementation'>,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  return {
    implementation: 'custom',
    module: 'expo-router/ui',
    exportName: 'Tabs',
    stability: 'stable',
    ...resolveCustomTabsPresentation(config, size),
  };
}

/*** Resolve the adaptive tabs plan for the selected runtime platform. */
function createAdaptiveTabsPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  if (platform !== 'web') return createNativeTabsPlan(platform);
  return createCustomTabsPlan(resolveAdaptiveConfig(config)?.web ?? DEFAULT_WEB_CUSTOM_TABS, size);
}

/*** Resolve the Expo Router module/export and presentation for one tabs implementation. */
export function resolveTabsNavigatorPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  switch (config?.implementation ?? 'adaptive') {
    case 'adaptive':
      return createAdaptiveTabsPlan(config, platform, size);
    case 'native':
      return createNativeTabsPlan(platform);
    case 'javascript':
      return createJavaScriptTabsPlan(config as JavaScriptTabsConfig);
    case 'custom':
      return createCustomTabsPlan(config as CustomTabsConfig, size);
  }
}
