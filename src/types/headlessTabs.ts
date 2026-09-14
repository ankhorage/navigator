import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { IconSource } from '@ankhorage/surface';
import type { ReactNode } from 'react';

export interface HeadlessTabsRoute {
  name: string;
  href: string;
  label: string;
  icon?: RouteDefinition['icon'];
  badge?: ReactNode;
  visible: boolean;
}

export type HeadlessTabsIconSourceResolver = (source: IconMediaReference) => ResolvedSvgSource;

type IconMediaReference = Extract<
  NonNullable<RouteDefinition['icon']>,
  { source: unknown }
>['source'];

type ResolvedSvgSource = Extract<IconSource, { source: unknown }>['source'];
