import { useTabTrigger } from 'expo-router/ui';

import type {
  HeadlessTabsIconSourceResolver,
  HeadlessTabsRoute,
} from '../../../../types/headlessTabs';
import { resolveNavigatorIcon } from '../../../../utils/resolveNavigatorIcon';
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
      icon={resolveNavigatorIcon(route.icon, resolveIconSource)}
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
