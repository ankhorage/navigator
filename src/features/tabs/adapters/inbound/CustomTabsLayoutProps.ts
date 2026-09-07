import type { ComponentType } from 'react';

import type { NavigatorResponsiveSize } from '../../../../utils/NavigatorResponsiveSize';
import type { ResolvedTabsPresentation } from '../../domain/ResolvedTabsPresentation';
import type { CustomTabsIconSourceResolver } from './CustomTabsIconSourceResolver';
import type { CustomTabsPresentationProps } from './CustomTabsPresentationProps';
import type { CustomTabsRoute } from './CustomTabsRoute';

/**
 * Runtime inputs for the cross-platform custom-tabs adapter. Routes remain mounted in one headless Router
 * topology while Surface selects bottom, top, rail, sidebar, or registered custom chrome.
 */
export interface CustomTabsLayoutProps {
  routes: readonly CustomTabsRoute[];
  presentations: Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>;
  initialRouteName?: string;
  resolveIconSource?: CustomTabsIconSourceResolver;
  customPresentation?: ComponentType<CustomTabsPresentationProps>;
}
