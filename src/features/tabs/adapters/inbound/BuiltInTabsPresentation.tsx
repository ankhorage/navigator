import type { ResolvedTabsPresentation } from '@ankhorage/contracts/navigator';
import { ScrollView, View } from '@ankhorage/surface';
import { StyleSheet } from 'react-native';

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
      <ScrollView
        accessibilityRole="tablist"
        showsVerticalScrollIndicator={false}
        style={styles.verticalNavigation}
        testID={`navigator-tabs-${presentation}`}
      >
        <View gap="s" px={presentation === 'rail' ? 's' : 'm'} py="l" width="100%">
          {routes.map((route) => (
            <NavigatorTabTrigger
              key={route.name}
              presentation={presentation}
              resolveIconSource={resolveIconSource}
              route={route}
            />
          ))}
        </View>
      </ScrollView>
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
