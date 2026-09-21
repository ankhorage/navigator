import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { IconSource } from '@ankhorage/surface';

import type { HeadlessTabsIconSourceResolver } from '../types/headlessTabs';

/*** Convert portable route icon metadata to the current Surface icon contract. */
export function resolveNavigatorIcon(
  icon: RouteDefinition['icon'],
  resolveIconSource?: HeadlessTabsIconSourceResolver,
): IconSource | undefined {
  if (icon === undefined) return undefined;
  if ('source' in icon) {
    return resolveIconSource === undefined || icon.source === undefined
      ? undefined
      : { source: resolveIconSource(icon.source) };
  }
  const provider = icon.provider ?? 'Ionicons';
  if (!ICON_PROVIDERS.has(provider)) return undefined;
  const variant =
    provider === 'FontAwesome5' || provider === 'FontAwesome6' ? 'regular' : undefined;
  return { name: icon.name, provider, variant } as IconSource;
}

const ICON_PROVIDERS = new Set([
  'Ionicons',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome6',
  'MaterialDesignIcons',
]);
