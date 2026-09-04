import type {
  CustomTabsConfig,
  FixedCustomTabsPresentation,
} from '@ankhorage/contracts/navigator';

import type {
  NavigatorResponsiveSize,
  ResolvedTabsPresentation,
} from '../definitions/NavigatorPlan';

const DEFAULT_RESPONSIVE_PRESENTATION = {
  compact: 'bottom',
  medium: 'rail',
  expanded: 'sidebar',
} as const satisfies Record<NavigatorResponsiveSize, FixedCustomTabsPresentation>;

export interface ResolvedCustomTabsPresentation {
  presentation: ResolvedTabsPresentation;
  customPresentationId?: string;
}

/*** Resolve one custom-tabs presentation for the current semantic responsive size. */
export function resolveCustomTabsPresentation(
  config: Omit<CustomTabsConfig, 'implementation'>,
  size: NavigatorResponsiveSize,
): ResolvedCustomTabsPresentation {
  if (config.presentation === 'custom') {
    if (!config.customPresentationId) {
      throw new Error('Custom tabs presentation requires customPresentationId.');
    }
    return { presentation: 'custom', customPresentationId: config.customPresentationId };
  }

  if (config.presentation === 'responsive') {
    const mapping = config.responsive ?? DEFAULT_RESPONSIVE_PRESENTATION;
    return {
      presentation:
        size === 'medium' ? (mapping.medium ?? mapping.expanded) : mapping[size],
    };
  }

  return { presentation: config.presentation };
}
