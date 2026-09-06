import type {
  CustomNavigatorNode,
  DrawerNavigatorOptions,
  NavigatorType,
  RouteDefinition,
  StackImplementation,
  StackScreenOptions,
} from '@ankhorage/contracts/navigator';

export type NavigatorRuntimePlatform = 'android' | 'ios' | 'web';
export type NavigatorResponsiveSize = 'compact' | 'medium' | 'expanded';
export type NavigatorApiStability = 'stable' | 'alpha';
export type NavigatorSupportStatus = 'supported' | 'unavailable';

export type ExpoRouterNavigatorModule =
  | 'expo-router'
  | 'expo-router/drawer'
  | 'expo-router/js-stack'
  | 'expo-router/js-tabs'
  | 'expo-router/js-top-tabs'
  | 'expo-router/ui'
  | 'expo-router/unstable-split-view'
  | 'expo-router/unstable-native-tabs';

export type NavigatorAdapterId =
  | 'slot'
  | 'stack.native'
  | 'stack.javascript'
  | 'stack.experimental'
  | 'drawer'
  | 'tabs.native'
  | 'tabs.javascript'
  | 'tabs.custom'
  | 'split-view'
  | 'custom';

export interface NavigatorDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

export interface NavigatorValidationContext {
  platform: NavigatorRuntimePlatform;
  expoRouterVersion: string;
}

export interface NavigatorAdapterPlan {
  id: NavigatorAdapterId;
  /** Built-in Expo Router entry point or an explicitly registered custom module. */
  module?: string;
  exportName?: string;
  support: NavigatorSupportStatus;
  stability: NavigatorApiStability;
  limitations: readonly string[];
}

export type ResolvedTabsImplementation = 'custom' | 'javascript' | 'native';
export type ResolvedTabsPresentation = 'bottom' | 'top' | 'rail' | 'sidebar' | 'custom';

/**
 * Disposable adapter plan for a `tabs` topology.
 *
 * The implementation selects the Router runtime. Presentation only selects its visual chrome and
 * never creates another route topology.
 */
export interface TabsNavigatorPlan {
  implementation: ResolvedTabsImplementation;
  module: ExpoRouterNavigatorModule;
  exportName: string;
  stability: NavigatorApiStability;
  presentation?: ResolvedTabsPresentation;
  presentations?: Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>;
  customPresentationId?: string;
  minimizeBehavior?: 'automatic' | 'never' | 'onScrollDown' | 'onScrollUp';
  bottomAccessoryScreenId?: string;
}

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

export interface NavigatorPlan {
  context: NavigatorValidationContext;
  root: NavigatorNodePlan;
  diagnostics: readonly NavigatorDiagnostic[];
  supported: boolean;
  flows: {
    onboarding: boolean;
    authentication: boolean;
  };
}

export interface NavigatorScreenModule {
  module: string;
  exportName: string;
}

export interface NavigatorGenerationBindings {
  screens: Readonly<Record<string, NavigatorScreenModule>>;
  guards: Readonly<Record<string, NavigatorScreenModule>>;
  iconSourceResolver?: NavigatorScreenModule;
  flows?: {
    onboardingRoute?: string;
    authenticationRoute?: string;
  };
  tabPresentations?: Readonly<Record<string, NavigatorScreenModule>>;
}

export interface NavigatorGeneratedFile {
  path: string;
  contents: string;
}
