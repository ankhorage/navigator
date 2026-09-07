import type {
  CustomNavigatorNode,
  DrawerNavigatorOptions,
  NavigatorType,
  StackImplementation,
  StackScreenOptions,
} from '@ankhorage/contracts/navigator';

import type { TabsNavigatorPlan } from '../features/tabs/domain/TabsNavigatorPlan';
import type { NavigatorAdapterPlan } from './NavigatorAdapterPlan';
import type { NavigatorRoutePlan } from './NavigatorRoutePlan';

export interface NavigatorNodePlan {
  type: NavigatorType;
  pointer: string;
  adapter: NavigatorAdapterPlan;
  initialRouteName?: string;
  routes: readonly NavigatorRoutePlan[];
  stack?: {
    implementation: StackImplementation;
    options?: StackScreenOptions;
  };
  drawer?: {
    options?: DrawerNavigatorOptions;
  };
  tabs?: TabsNavigatorPlan;
  splitView?: {
    columns: {
      primary: string;
      supplementary?: string;
    };
    inspector?: string;
    topColumnForCollapsing?: 'primary' | 'secondary' | 'supplementary';
  };
  custom?: {
    navigatorId: string;
    config?: CustomNavigatorNode['config'];
  };
}
