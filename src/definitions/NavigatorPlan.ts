import type { NavigatorType } from '@ankhorage/contracts/navigator';

export type NavigatorRuntimePlatform = 'android' | 'ios' | 'web';
export type NavigatorResponsiveSize = 'compact' | 'medium' | 'expanded';
export type NavigatorApiStability = 'stable' | 'unstable';

export type ExpoRouterNavigatorModule =
  | 'expo-router'
  | 'expo-router/drawer'
  | 'expo-router/js-tabs'
  | 'expo-router/js-top-tabs'
  | 'expo-router/ui'
  | 'expo-router/unstable-native-tabs';

export type ResolvedTabsImplementation = 'custom' | 'javascript' | 'native';
export type ResolvedTabsPresentation = 'bottom' | 'top' | 'rail' | 'sidebar' | 'custom';

export interface TabsNavigatorPlan {
  implementation: ResolvedTabsImplementation;
  module: ExpoRouterNavigatorModule;
  exportName: string;
  stability: NavigatorApiStability;
  presentation?: ResolvedTabsPresentation;
  customPresentationId?: string;
}

export interface NavigatorRoutePlan {
  name: string;
  path?: string;
  screenId?: string;
  navigator?: NavigatorNodePlan;
}

export interface NavigatorNodePlan {
  type: NavigatorType;
  module: ExpoRouterNavigatorModule;
  exportName: string;
  routes: NavigatorRoutePlan[];
  tabs?: TabsNavigatorPlan;
}

export interface NavigatorPlan {
  presetLayers: readonly NavigatorType[];
  root: NavigatorNodePlan;
  flows: {
    onboarding: boolean;
    authentication: boolean;
  };
}
