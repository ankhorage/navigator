import type { RouteDefinition } from '@ankhorage/contracts/navigator';

/*** Create one neutral example route backed by the shared observable screen. */
export function createExampleScreenRoute(
  name: string,
  label: string,
  options: ExampleScreenRouteOptions = {},
): RouteDefinition {
  return {
    name,
    label,
    screenId: 'example',
    ...(options.path === undefined ? {} : { path: options.path }),
    ...(options.guarded === true ? { guards: ['example-enabled'] } : {}),
    ...(options.icon === undefined ? {} : { icon: options.icon }),
    ...(options.presentation === undefined
      ? {}
      : { stackOptions: { presentation: options.presentation } }),
  };
}

interface ExampleScreenRouteOptions {
  readonly path?: string;
  readonly guarded?: boolean;
  readonly icon?: RouteDefinition['icon'];
  readonly presentation?: NonNullable<RouteDefinition['stackOptions']>['presentation'];
}
