import type {
  ResolvedWorkspaceNavigationRoute,
  WorkspaceNavigationRoute,
} from '../../../types/workspaceNavigation';

/*** Resolve visible destinations and selected ancestors from one consumer-owned route tree. */
export function resolveWorkspaceNavigation(
  routes: readonly WorkspaceNavigationRoute[],
  activeRouteId: string,
): readonly ResolvedWorkspaceNavigationRoute[] {
  const byId = new Map(routes.map((route) => [route.id, route]));
  if (byId.size !== routes.length) throw new Error('Workspace route ids must be unique.');

  const depths = new Map(
    routes.map((route) => [route.id, resolveAncestorIds(route.id, byId, [route.id]).length]),
  );
  const ancestors = new Set(resolveAncestorIds(activeRouteId, byId, [activeRouteId]));

  return routes
    .filter((route) => route.visible !== false)
    .map((route) => ({
      ...route,
      active: route.id === activeRouteId || ancestors.has(route.id),
      selected: route.id === activeRouteId,
      depth: depths.get(route.id) ?? 0,
    }));
}

/*** Walk one validated parent chain without mutating the consumer-owned route tree. */
function resolveAncestorIds(
  routeId: string,
  byId: ReadonlyMap<string, WorkspaceNavigationRoute>,
  visited: readonly string[],
): readonly string[] {
  const parentId = byId.get(routeId)?.parentId;
  if (parentId === undefined) return [];
  if (visited.includes(parentId)) throw new Error(`Workspace route ${routeId} has a parent cycle.`);
  if (!byId.has(parentId))
    throw new Error(`Workspace route ${routeId} has unknown parent ${parentId}.`);
  return [parentId, ...resolveAncestorIds(parentId, byId, [...visited, parentId])];
}
