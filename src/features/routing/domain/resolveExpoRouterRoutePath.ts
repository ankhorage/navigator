import type { RouteDefinition } from '@ankhorage/contracts/navigator';

/*** Resolve one route's Expo Router module path without changing its semantic identity. */
export function resolveExpoRouterRoutePath(
  route: Pick<RouteDefinition, 'expoRouterPath' | 'name'>,
): string {
  const path = route.expoRouterPath ?? route.name;
  const segments = path.split('/');
  if (
    path.length === 0 ||
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === '.' ||
        segment === '..' ||
        !/^[A-Za-z0-9_.()[\]-]+$/u.test(segment),
    )
  ) {
    throw new Error(`Expo Router path ${JSON.stringify(path)} is not a safe relative module path.`);
  }
  return path;
}
