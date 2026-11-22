import type { ResolvedTabsPresentation } from '@ankhorage/contracts/navigator';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { HeadlessTabsRoute } from '../../../../types/headlessTabs';
import { NavigatorTabTrigger } from './NavigatorTabTrigger';

/*** Render the accessible unthemed fallback for a built-in Navigator tab topology. */
export function BuiltInTabsPresentation({ presentation, routes }: BuiltInTabsPresentationProps) {
  const horizontal = presentation === 'bottom' || presentation === 'top';
  if (!horizontal) {
    return (
      <ScrollView
        accessibilityRole="tablist"
        showsVerticalScrollIndicator={false}
        style={styles.verticalNavigation}
        testID={`navigator-tabs-${presentation}`}
      >
        <View style={presentation === 'rail' ? styles.railItems : styles.sidebarItems}>
          {routes.map((route) => (
            <NavigatorTabTrigger key={route.name} presentation={presentation} route={route} />
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
        <NavigatorTabTrigger key={route.name} presentation="horizontal" route={route} />
      ))}
    </View>
  );
}

interface BuiltInTabsPresentationProps {
  presentation: Exclude<ResolvedTabsPresentation, 'custom'>;
  routes: readonly HeadlessTabsRoute[];
}

const styles = StyleSheet.create({
  horizontalNavigation: { flexDirection: 'row' },
  railItems: { gap: 8, padding: 8, width: '100%' },
  sidebarItems: { gap: 8, padding: 16, width: '100%' },
  verticalNavigation: { flex: 1, minHeight: 0, width: '100%' },
});
