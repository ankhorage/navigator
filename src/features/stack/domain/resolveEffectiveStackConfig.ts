import type {
  AppNavigatorManifest,
  NavigatorRuntimePlatform,
  StackImplementationConfig,
  StackNavigatorNode,
} from '@ankhorage/contracts/navigator';

import { resolveEffectiveStackConfigSource } from './resolveEffectiveStackConfigSource';

/*** Resolve effective Stack configuration using platform, node, default, and stable precedence. */
export function resolveEffectiveStackConfig(
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  platform: NavigatorRuntimePlatform,
): StackImplementationConfig {
  return resolveEffectiveStackConfigSource(manifest, node, platform, '').config;
}
