import type {
  CustomTabsConfig,
  FixedCustomTabsPresentation,
  ResponsiveTabsPresentation,
} from '@ankhorage/contracts/navigator';

import type { NavigatorResponsiveSize } from '../../../utils/NavigatorResponsiveSize';
import type { ResolvedCustomTabsPresentation } from './ResolvedCustomTabsPresentation';

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
    return {
      presentation: resolveResponsivePresentation(
        config.responsive ?? DEFAULT_RESPONSIVE_PRESENTATION,
        size,
      ),
    };
  }

  return { presentation: config.presentation };
}

/*** Resolve the fixed presentation for one semantic responsive size. */
function resolveResponsivePresentation(
  mapping: ResponsiveTabsPresentation,
  size: NavigatorResponsiveSize,
): FixedCustomTabsPresentation {
  switch (size) {
    case 'compact':
      return mapping.compact;
    case 'medium':
      return mapping.medium ?? mapping.expanded;
    case 'expanded':
      return mapping.expanded;
  }
}

const DEFAULT_RESPONSIVE_PRESENTATION = {
  compact: 'bottom',
  medium: 'rail',
  expanded: 'sidebar',
} as const satisfies Record<NavigatorResponsiveSize, FixedCustomTabsPresentation>;
