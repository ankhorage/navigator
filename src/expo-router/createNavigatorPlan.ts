import type {
  AppNavigatorManifest,
  NavigatorNode,
  NavigatorPlatforms,
  TabsImplementationConfig,
  TabsNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type {
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorResponsiveSize,
  NavigatorRuntimePlatform,
} from '../definitions/NavigatorPlan';
import { resolveNavigatorPreset } from '../topology/resolveNavigatorPreset';
import { resolveTabsNavigatorPlan } from './resolveTabsNavigatorPlan';

export interface CreateNavigatorPlanOptions {
  platform: NavigatorRuntimePlatform;
  responsiveSize?: NavigatorResponsiveSize;
}

/*** Return node-local tabs configuration only when the node explicitly authors one. */
function resolveNodeTabsConfig(node: TabsNavigatorNode): TabsImplementationConfig | undefined {
  if (node.implementation !== undefined) return node;
  return node.native !== undefined || node.web !== undefined ? node : undefined;
}

/*** Resolve a platform-specific tabs override without dynamic object access. */
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

/*** Resolve effective tabs configuration using platform, node, default, then adaptive fallback. */
function resolveEffectiveTabsConfig(
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

/*** Convert one navigator node into a provider-aware Expo Router generation plan. */
function createNodePlan(
  manifest: AppNavigatorManifest,
  node: NavigatorNode,
  platform: NavigatorRuntimePlatform,
  responsiveSize: NavigatorResponsiveSize,
): NavigatorNodePlan {
  const routes = node.routes.map((route) => ({
    name: route.name,
    ...(route.path === undefined ? {} : { path: route.path }),
    ...(route.screenId === undefined ? {} : { screenId: route.screenId }),
    ...(route.navigator === undefined
      ? {}
      : { navigator: createNodePlan(manifest, route.navigator, platform, responsiveSize) }),
  }));

  if (node.type === 'stack') {
    return { type: 'stack', module: 'expo-router', exportName: 'Stack', routes };
  }

  if (node.type === 'drawer') {
    return { type: 'drawer', module: 'expo-router/drawer', exportName: 'Drawer', routes };
  }

  const tabs = resolveTabsNavigatorPlan(
    resolveEffectiveTabsConfig(manifest, node, platform),
    platform,
    responsiveSize,
  );
  return {
    type: 'tabs',
    module: tabs.module,
    exportName: tabs.exportName,
    routes,
    tabs,
  };
}

/*** Create the complete standalone Navigator plan from only the navigator desired-state slice. */
export function createNavigatorPlan(
  manifest: AppNavigatorManifest,
  options: CreateNavigatorPlanOptions,
): NavigatorPlan {
  const responsiveSize = options.responsiveSize ?? 'compact';
  return {
    presetLayers: resolveNavigatorPreset(manifest.preset, manifest.type),
    root: createNodePlan(manifest, manifest, options.platform, responsiveSize),
    flows: {
      onboarding: manifest.flows?.onboarding ?? false,
      authentication: manifest.flows?.authentication ?? false,
    },
  };
}
