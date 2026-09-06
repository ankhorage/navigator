import type { CustomNavigatorNode } from '@ankhorage/contracts/navigator';

import type { CustomNavigatorRegistry } from '../custom/CustomNavigatorRegistry';
import type { NavigatorAdapterPlan, NavigatorRuntimePlatform } from '../definitions/NavigatorPlan';

/*** Resolve a registered standard-router integration without materializing executable manifest data. */
export function resolveCustomNavigatorAdapterPlan(
  node: CustomNavigatorNode,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
  registry: CustomNavigatorRegistry | undefined,
): NavigatorAdapterPlan {
  const registration = registry?.[node.navigatorId];
  const supported =
    registration !== undefined &&
    registration.platforms.includes(platform) &&
    routerMajor !== undefined &&
    routerMajor >= 56;
  return {
    id: 'custom',
    ...(registration === undefined
      ? {}
      : { module: registration.module, exportName: registration.exportName }),
    support: supported ? 'supported' : 'unavailable',
    stability: registration?.stability ?? 'alpha',
    limitations: [
      'Requires an immutable registered expo-router-standard integration.',
      'Expo Router 56.0.0 or newer owns route state, params, deep links, and history.',
    ],
  };
}
