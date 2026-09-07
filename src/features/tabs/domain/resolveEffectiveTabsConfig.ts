import type {
  AppNavigatorManifest,
  NavigatorPlatforms,
  NavigatorRuntimePlatform,
  TabsImplementationConfig,
  TabsNavigatorNode,
} from '@ankhorage/contracts/navigator';

/*** Resolve Tabs configuration in platform, node, then manifest-default precedence. */
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

/*** Read a platform override only when it selects a Tabs implementation. */
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

/*** Preserve an explicitly authored Tabs implementation as the node-level override. */
function resolveNodeTabsConfig(node: TabsNavigatorNode): TabsImplementationConfig | undefined {
  if (node.implementation !== undefined) return node;
  return node.native !== undefined || node.web !== undefined ? node : undefined;
}
