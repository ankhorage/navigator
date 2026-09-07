import type { RouteDefinition, StackScreenOptions } from '@ankhorage/contracts/navigator';

import type { NavigatorNodePlan } from './NavigatorNodePlan';

export interface NavigatorRoutePlan {
  name: string;
  path?: string;
  label?: string;
  icon?: RouteDefinition['icon'];
  showInPrimaryNavigation?: boolean;
  guards: readonly string[];
  screenId?: string;
  stackOptions?: StackScreenOptions;
  navigator?: NavigatorNodePlan;
}
