import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { NavigationItemIcon } from '@ankhorage/surface';

export type CustomTabsIconSourceResolver = (source: IconMediaReference) => ResolvedSvgSource;

type IconMediaReference = Extract<
  NonNullable<RouteDefinition['icon']>,
  { source: unknown }
>['source'];

type ResolvedSvgSource = Extract<NavigationItemIcon, { source: unknown }>['source'];
