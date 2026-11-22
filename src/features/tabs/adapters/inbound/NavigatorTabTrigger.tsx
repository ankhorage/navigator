import { useTabTrigger } from 'expo-router/ui';
import type { ReactNode } from 'react';

import type { HeadlessTabsItem, HeadlessTabsRoute } from '../../../../types/headlessTabs';
import { resolveNavigatorIcon } from '../../../../utils/resolveNavigatorIcon';

/*** Bind one visible route to an Expo Router headless tab trigger and fallback route item. */
export function NavigatorTabTrigger({ render, route }: NavigatorTabTriggerProps) {
  const { switchTab, trigger } = useTabTrigger({ name: route.name });
  return render(createHeadlessTabsItem(route, trigger?.isFocused ?? false, switchTab));
}

interface NavigatorTabTriggerProps {
  render: (item: HeadlessTabsItem) => ReactNode;
  route: HeadlessTabsRoute;
}

/*** Expose one active Expo Router tab as a presentation-neutral item binding. */
function createHeadlessTabsItem(
  route: HeadlessTabsRoute,
  active: boolean,
  switchTab: (name: string, options: Record<string, never>) => void,
): HeadlessTabsItem {
  const disabled = route.disabled ?? false;
  return {
    accessibilityState: { disabled, selected: active },
    active,
    badge: route.badge,
    disabled,
    href: route.href,
    icon: resolveNavigatorIcon(route.icon),
    label: route.label,
    name: route.name,
    onPress: () => {
      if (!disabled) switchTab(route.name, {});
    },
  };
}
