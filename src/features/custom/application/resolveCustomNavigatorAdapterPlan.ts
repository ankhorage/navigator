import type {
  CustomNavigatorNode,
  CustomNavigatorRegistry,
  NavigatorAdapterPlan,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';

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
    routerMajor >= NAVIGATOR_ROUTER_POLICY.customNavigatorMinimumMajor;
  return {
    id: 'custom',
    ...(registration === undefined
      ? {}
      : { module: registration.module, exportName: registration.exportName }),
    support: supported ? 'supported' : 'unsupported',
    stability: registration?.stability ?? 'alpha',
    limitations: [
      'Requires an immutable registered expo-router-standard integration.',
      `Expo Router ${NAVIGATOR_ROUTER_POLICY.customNavigatorMinimumMajor}.0.0 or newer owns route state, params, deep links, and history.`,
    ],
  };
}
