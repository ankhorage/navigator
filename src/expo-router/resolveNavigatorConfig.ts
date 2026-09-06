import type {
  AppNavigatorManifest,
  NavigatorPlatforms,
  StackImplementationConfig,
  StackNavigatorNode,
  TabsImplementationConfig,
  TabsNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorRuntimePlatform } from '../definitions/NavigatorPlan';

export interface ResolvedStackConfigSource {
  config: StackImplementationConfig;
  pointer: string;
}

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

/*** Resolve effective Stack configuration using platform, node, default, and stable precedence. */
export function resolveEffectiveStackConfig(
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  platform: NavigatorRuntimePlatform,
): StackImplementationConfig {
  return resolveEffectiveStackConfigSource(manifest, node, platform, '').config;
}

/*** Resolve effective Stack configuration together with its authored diagnostic location. */
export function resolveEffectiveStackConfigSource(
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  platform: NavigatorRuntimePlatform,
  nodePointer: string,
): ResolvedStackConfigSource {
  const platformConfig = resolvePlatformStackConfig(manifest.platforms, platform);
  if (platformConfig !== undefined) {
    return { config: platformConfig, pointer: `/platforms/${platform}/stack` };
  }

  const nodeConfig = resolveNodeStackConfig(node);
  if (nodeConfig !== undefined) return { config: nodeConfig, pointer: nodePointer };
  if (manifest.defaults?.stack !== undefined) {
    return { config: manifest.defaults.stack, pointer: '/defaults/stack' };
  }
  return { config: { implementation: 'native' }, pointer: nodePointer };
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
