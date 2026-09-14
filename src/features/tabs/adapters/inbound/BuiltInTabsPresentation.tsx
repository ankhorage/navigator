import type { ResolvedTabsPresentation } from '@ankhorage/contracts/navigator';
import { ScrollArea, Stack } from '@ankhorage/surface';
import { StyleSheet, View } from 'react-native';

import type {
  HeadlessTabsIconSourceResolver,
  HeadlessTabsRoute,
} from '../../../../types/headlessTabs';
import { NavigatorTabTrigger } from './NavigatorTabTrigger';

/*** Render Navigator-owned bottom, top, rail, or sidebar tab chrome. */
export function BuiltInTabsPresentation({
  presentation,
  routes,
  resolveIconSource,
}: BuiltInTabsPresentationProps) {
  const horizontal = presentation === 'bottom' || presentation === 'top';
  if (!horizontal) {
    return (
      <ScrollArea
        accessibilityRole="tablist"
        showsVerticalScrollIndicator={false}
        style={styles.verticalNavigation}
        testID={`navigator-tabs-${presentation}`}
      >
        <Stack gap="s" px={presentation === 'rail' ? 's' : 'm'} py="l" width="100%">
          {routes.map((route) => (
            <NavigatorTabTrigger
              key={route.name}
              presentation={presentation}
              resolveIconSource={resolveIconSource}
              route={route}
            />
          ))}
        </Stack>
      </ScrollArea>
    );
  }
  return (
    <View
      accessibilityRole="tablist"
      style={styles.horizontalNavigation}
      testID={`navigator-tabs-${presentation}`}
    >
      {routes.map((route) => (
        <NavigatorTabTrigger
          key={route.name}
          presentation="horizontal"
          resolveIconSource={resolveIconSource}
          route={route}
        />
      ))}
    </View>
  );
}

interface BuiltInTabsPresentationProps {
  presentation: Exclude<ResolvedTabsPresentation, 'custom'>;
  routes: readonly HeadlessTabsRoute[];
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined;
}

const styles = StyleSheet.create({
  horizontalNavigation: { flexDirection: 'row' },
  verticalNavigation: { flex: 1, minHeight: 0, width: '100%' },
});
