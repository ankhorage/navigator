import type {
  AppNavigatorManifest,
  NavigatorPlatforms,
  StackImplementationConfig,
  StackNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import type { ResolvedStackConfigSource } from './ResolvedStackConfigSource';

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

/*** Read a platform override only when it selects a Stack implementation. */
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

/*** Preserve explicitly authored Stack options without inventing a node override. */
function resolveNodeStackConfig(node: StackNavigatorNode): StackImplementationConfig | undefined {
  if (node.implementation === undefined && node.options === undefined) return undefined;
  return {
    implementation: node.implementation ?? 'native',
    ...(node.options === undefined ? {} : { options: node.options }),
  } as StackImplementationConfig;
}
