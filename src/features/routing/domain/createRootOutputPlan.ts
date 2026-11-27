import type { NavigatorGenerationOptions, NavigatorNodePlan } from '@ankhorage/contracts/navigator';

/*** Give an opted-in public root route its matching Expo module without changing nested semantics. */
export function createRootOutputPlan(
  root: NavigatorNodePlan,
  options: NavigatorGenerationOptions,
): NavigatorNodePlan {
  if (options.rootRedirect !== true || root.initialRouteName === undefined) return root;
  const initialRoute = root.routes.find(({ name }) => name === root.initialRouteName);
  if (initialRoute?.path !== '/') return root;
  return {
    ...root,
    routes: root.routes.map((route) =>
      route.name === root.initialRouteName ? { ...route, expoRouterPath: 'index' } : route,
    ),
  };
}
