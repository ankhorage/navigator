import { useTabTrigger } from 'expo-router/ui';

import type { HeadlessTabsRoute } from '../../../../types/headlessTabs';
import { resolveNavigatorIcon } from '../../../../utils/resolveNavigatorIcon';
import { NavigatorTabItem } from './NavigatorTabItem';

/*** Bind one visible route to an Expo Router headless tab trigger and fallback route item. */
export function NavigatorTabTrigger({ route, presentation }: NavigatorTabTriggerProps) {
  const { switchTab, trigger } = useTabTrigger({ name: route.name });
  return (
    <NavigatorTabItem
      active={trigger?.isFocused ?? false}
      badge={route.badge}
      icon={resolveNavigatorIcon(route.icon)}
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
}
