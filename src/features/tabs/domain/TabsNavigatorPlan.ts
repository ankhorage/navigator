import type { ExpoRouterNavigatorModule } from '../../../utils/ExpoRouterNavigatorModule';
import type { NavigatorApiStability } from '../../../utils/NavigatorApiStability';
import type { NavigatorResponsiveSize } from '../../../utils/NavigatorResponsiveSize';
import type { ResolvedTabsImplementation } from './ResolvedTabsImplementation';
import type { ResolvedTabsPresentation } from './ResolvedTabsPresentation';

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
