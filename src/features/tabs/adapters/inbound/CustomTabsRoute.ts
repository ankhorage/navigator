import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { ReactNode } from 'react';

/** One explicit Expo Router tab registration plus optional Surface-owned presentation metadata. */
export interface CustomTabsRoute {
  name: string;
  href: string;
  label: string;
  icon?: RouteDefinition['icon'];
  badge?: ReactNode;
  visible: boolean;
}
