import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { ReactNode } from 'react';

export interface HeadlessTabsRoute {
  name: string;
  href: string;
  label: string;
  icon?: RouteDefinition['icon'];
  badge?: ReactNode;
  disabled?: boolean;
  visible: boolean;
}

/** A route binding resolved from the active Expo Router headless tab context. */
export interface HeadlessTabsItem {
  readonly name: string;
  readonly href: string;
  readonly label: string;
  readonly icon?: RouteDefinition['icon'];
  readonly badge?: ReactNode;
  readonly active: boolean;
  readonly disabled: boolean;
  readonly accessibilityState: Readonly<{ disabled: boolean; selected: boolean }>;
  readonly onPress: () => void;
}

/**
 * Presentation inputs resolved by Navigator while Expo Router remains the only routing state
 * owner. A visual package consumes these values without importing Navigator internals.
 */
export interface HeadlessTabsPresentationProps {
  readonly presentation: HeadlessTabsPresentation;
  readonly routes: readonly HeadlessTabsRoute[];
  readonly orientation: HeadlessTabsPresentationOrientation;
  readonly renderItem: (
    route: HeadlessTabsRoute,
    render: (item: HeadlessTabsItem) => ReactNode,
  ) => ReactNode;
}

/** The presentation selected by Navigator's responsive policy. */
export type HeadlessTabsPresentation = 'bottom' | 'top' | 'rail' | 'sidebar' | 'custom';

/** Layout direction supplied to a presentation so vertical custom chrome is explicit. */
export type HeadlessTabsPresentationOrientation = 'horizontal' | 'vertical';
