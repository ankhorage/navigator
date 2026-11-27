import type { NavigatorNodePlan, NavigatorRoutePlan } from '@ankhorage/contracts/navigator';

/*** Keep Expo Router implementation groups from becoming visible Stack headers by default. */
export function shouldHideUnnamedGroupHeader(
  node: NavigatorNodePlan,
  route: NavigatorRoutePlan,
): boolean {
  return (
    node.type === 'stack' &&
    route.navigator !== undefined &&
    route.label === undefined &&
    route.stackOptions?.headerShown === undefined &&
    /^\([^/()]+\)$/.test(route.name)
  );
}
