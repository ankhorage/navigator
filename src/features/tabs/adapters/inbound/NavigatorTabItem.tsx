import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HeadlessTabsItem } from '../../../../types/headlessTabs';

/*** Render the accessible unthemed fallback for one Navigator tab trigger. */
export function NavigatorTabItem({ item, orientation }: NavigatorTabItemProps) {
  const horizontal = orientation === 'horizontal';
  const rail = orientation === 'rail';

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={item.accessibilityState}
      disabled={item.disabled}
      onPress={item.onPress}
      style={horizontal ? styles.horizontalButton : styles.verticalButton}
      testID={`navigator-tabs-item-${item.name}`}
    >
      <View
        style={[
          styles.content,
          rail ? styles.railContent : horizontal ? undefined : styles.sidebarContent,
          item.active ? styles.activeContent : undefined,
        ]}
      >
        <Text numberOfLines={1} style={item.active ? styles.activeLabel : undefined}>
          {item.label}
        </Text>
        {item.badge ? <View style={rail ? styles.railBadge : undefined}>{item.badge}</View> : null}
      </View>
    </Pressable>
  );
}

interface NavigatorTabItemProps {
  item: HeadlessTabsItem;
  orientation: 'horizontal' | 'rail' | 'sidebar';
}

const styles = StyleSheet.create({
  activeContent: { backgroundColor: '#e5e7eb' },
  activeLabel: { fontWeight: '700' },
  content: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 8,
  },
  horizontalButton: { flex: 1 },
  railBadge: { position: 'absolute', right: 2, top: 2 },
  railContent: { minHeight: 64 },
  sidebarContent: { minHeight: 48 },
  verticalButton: { width: '100%' },
});
