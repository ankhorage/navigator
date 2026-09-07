import type { ReactNode } from 'react';

import type { CustomTabsRoute } from './CustomTabsRoute';

export interface CustomTabsPresentationProps {
  routes: readonly CustomTabsRoute[];
  renderItem: (route: CustomTabsRoute, compact?: boolean) => ReactNode;
}
