import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { IconSource } from '@ankhorage/surface';
import { useTabTrigger } from 'expo-router/ui';

import type {
  HeadlessTabsIconSourceResolver,
  HeadlessTabsRoute,
} from '../../../../types/headlessTabs';
import { NavigatorTabItem } from './NavigatorTabItem';

/*** Bind one visible route to an Expo Router headless tab trigger and Surface route item. */
export function NavigatorTabTrigger({
  route,
  presentation,
  resolveIconSource,
}: NavigatorTabTriggerProps) {
  const { switchTab, trigger } = useTabTrigger({ name: route.name });
  return (
    <NavigatorTabItem
      active={trigger?.isFocused ?? false}
      badge={route.badge}
      icon={resolveIcon(route.icon, resolveIconSource)}
      label={route.label}
      onPress={() => switchTab(route.name, {})}
      orientation={presentation}
      testID={`navigator-tabs-item-${route.name}`}
    />
  );
}

interface NavigatorTabTriggerProps {
  route: HeadlessTabsRoute;
  presentation: 'horizontal' | 'rail' | 'sidebar';
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined;
}

/*** Convert portable route icon metadata to the current Surface icon contract. */
function resolveIcon(
  icon: RouteDefinition['icon'],
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined,
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
