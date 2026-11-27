import type { NavigatorNodePlan } from '@ankhorage/contracts/navigator';

import { resolveExpoRouterRoutePath } from './resolveExpoRouterRoutePath.js';

/*** Map a semantic initial route identity onto Expo Router's module registration name. */
export function resolveNavigatorInitialRouteName(node: NavigatorNodePlan): string | undefined {
  if (node.initialRouteName === undefined) return undefined;
  const route = node.routes.find(({ name }) => name === node.initialRouteName);
  if (route === undefined)
    throw new Error(`Missing initial route ${JSON.stringify(node.initialRouteName)}.`);
  return resolveExpoRouterRoutePath(route);
}
