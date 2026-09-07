import type {
  AdaptiveTabsConfig,
  HeadlessTabsConfig,
  JavaScriptTabsConfig,
  NavigatorResponsiveSize,
  NavigatorRuntimePlatform,
  TabsImplementationConfig,
  TabsNavigatorPlan,
} from '@ankhorage/contracts/navigator';

import { resolveHeadlessTabsPresentation } from '../domain/resolveHeadlessTabsPresentation';

/*** Resolve the Expo Router module/export and presentation for one tabs implementation. */
export function resolveTabsNavigatorPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  if (config === undefined) return createAdaptiveTabsPlan(config, platform, size);

  switch (config.implementation) {
    case undefined:
    case 'adaptive':
      return createAdaptiveTabsPlan(config, platform, size);
    case 'native':
      return createNativeTabsPlan(platform, config);
    case 'javascript':
      return createJavaScriptTabsPlan(config);
    case 'headless':
      return createHeadlessTabsPlan(config, size);
  }
}

/*** Resolve the adaptive tabs plan for the selected runtime platform. */
function createAdaptiveTabsPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  if (platform !== 'web')
    return createNativeTabsPlan(platform, resolveAdaptiveConfig(config)?.native);
  return createHeadlessTabsPlan(
    resolveAdaptiveConfig(config)?.web ?? DEFAULT_WEB_HEADLESS_TABS,
    size,
  );
}

/*** Create the alpha native-tabs plan and reject unsupported Web usage. */
function createNativeTabsPlan(
  platform: NavigatorRuntimePlatform,
  config?: {
    minimizeBehavior?: TabsNavigatorPlan['minimizeBehavior'];
    bottomAccessory?: { screenId: string };
  },
): TabsNavigatorPlan {
  if (platform === 'web') {
    throw new Error('Native tabs are not available for the Web navigator plan.');
  }
  return {
    implementation: 'native',
    module: 'expo-router/unstable-native-tabs',
    exportName: 'NativeTabs',
    stability: 'alpha',
    ...(config?.minimizeBehavior === undefined
      ? {}
      : { minimizeBehavior: config.minimizeBehavior }),
    ...(config?.bottomAccessory === undefined
      ? {}
      : { bottomAccessoryScreenId: config.bottomAccessory.screenId }),
  };
}

/*** Return the adaptive config when omission or `adaptive` selects that branch. */
function resolveAdaptiveConfig(
  config: TabsImplementationConfig | undefined,
): AdaptiveTabsConfig | undefined {
  if (config === undefined) return undefined;
  return config.implementation === undefined || config.implementation === 'adaptive'
    ? config
    : undefined;
}

/*** Create the stable cross-platform Headless Tabs plan and resolve its presentation. */
function createHeadlessTabsPlan(
  config: Omit<HeadlessTabsConfig, 'implementation'>,
  size: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  const resolved = resolveHeadlessTabsPresentation(config, size);
  const presentations = {
    compact: resolveHeadlessTabsPresentation(config, 'compact').presentation,
    medium: resolveHeadlessTabsPresentation(config, 'medium').presentation,
    expanded: resolveHeadlessTabsPresentation(config, 'expanded').presentation,
  };
  return {
    implementation: 'headless',
    module: 'expo-router/ui',
    exportName: 'Tabs',
    stability: 'stable',
    ...resolved,
    presentations,
  };
}

const DEFAULT_WEB_HEADLESS_TABS = {
  presentation: 'responsive',
} as const;

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
