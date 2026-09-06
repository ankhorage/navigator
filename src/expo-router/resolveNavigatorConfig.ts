import type {
  AppNavigatorManifest,
  NavigatorPlatforms,
  StackImplementationConfig,
  StackNavigatorNode,
  TabsImplementationConfig,
  TabsNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorRuntimePlatform } from '../definitions/NavigatorPlan';

export function parseExpoRouterMajor(version: string): number | undefined {
  const match = /^(\d+)\.\d+\.\d+(?:[-+].*)?$/u.exec(version);
  return match?.[1] === undefined ? undefined : Number(match[1]);
}

function resolveNodeStackConfig(node: StackNavigatorNode): StackImplementationConfig | undefined {
  if (node.implementation === undefined && node.options === undefined) return undefined;
  return {
    implementation: node.implementation ?? 'native',
    ...(node.options === undefined ? {} : { options: node.options }),
  } as StackImplementationConfig;
}

function resolveNodeTabsConfig(node: TabsNavigatorNode): TabsImplementationConfig | undefined {
  if (node.implementation !== undefined) return node;
  return node.native !== undefined || node.web !== undefined ? node : undefined;
}

function resolvePlatformStackConfig(
  platforms: NavigatorPlatforms | undefined,
  platform: NavigatorRuntimePlatform,
): StackImplementationConfig | undefined {
  switch (platform) {
    case 'android':
      return platforms?.android?.stack;
    case 'ios':
      return platforms?.ios?.stack;
    case 'web':
      return platforms?.web?.stack;
  }
}

function resolvePlatformTabsConfig(
  platforms: NavigatorPlatforms | undefined,
  platform: NavigatorRuntimePlatform,
): TabsImplementationConfig | undefined {
  switch (platform) {
    case 'android':
      return platforms?.android?.tabs;
    case 'ios':
      return platforms?.ios?.tabs;
    case 'web':
      return platforms?.web?.tabs;
  }
}

export function resolveEffectiveStackConfig(
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  platform: NavigatorRuntimePlatform,
): StackImplementationConfig {
  return (
    resolvePlatformStackConfig(manifest.platforms, platform) ??
    resolveNodeStackConfig(node) ??
    manifest.defaults?.stack ?? { implementation: 'native' }
  );
}

export function resolveEffectiveTabsConfig(
  manifest: AppNavigatorManifest,
  node: TabsNavigatorNode,
  platform: NavigatorRuntimePlatform,
): TabsImplementationConfig | undefined {
  return (
    resolvePlatformTabsConfig(manifest.platforms, platform) ??
    resolveNodeTabsConfig(node) ??
    manifest.defaults?.tabs
  );
}
