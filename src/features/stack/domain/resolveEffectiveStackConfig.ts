import type {
  AppNavigatorManifest,
  StackImplementationConfig,
  StackNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import { resolveEffectiveStackConfigSource } from './resolveEffectiveStackConfigSource';

/*** Resolve effective Stack configuration using platform, node, default, and stable precedence. */
export function resolveEffectiveStackConfig(
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  platform: NavigatorRuntimePlatform,
): StackImplementationConfig {
  return resolveEffectiveStackConfigSource(manifest, node, platform, '').config;
}
