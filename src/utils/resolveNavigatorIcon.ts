import type { RouteDefinition } from '@ankhorage/contracts/navigator';

/*** Preserve portable route icon metadata for the presentation package that owns icon rendering. */
export function resolveNavigatorIcon(
  icon: RouteDefinition['icon'],
): RouteDefinition['icon'] | undefined {
  return icon;
}
