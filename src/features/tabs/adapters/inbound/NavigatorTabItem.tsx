import type { RouteDefinition } from '@ankhorage/contracts/navigator';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/*** Render the accessible unthemed fallback for one Navigator tab trigger. */
export function NavigatorTabItem({
  active,
  badge,
  label,
  onPress,
  orientation,
  testID,
}: NavigatorTabItemProps) {
  const horizontal = orientation === 'horizontal';
  const rail = orientation === 'rail';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={horizontal ? styles.horizontalButton : styles.verticalButton}
      testID={testID}
    >
      <View style={[styles.content, active ? styles.activeContent : undefined]}>
        <Text numberOfLines={1} style={active ? styles.activeLabel : undefined}>
          {label}
        </Text>
        {badge ? <View style={rail ? styles.railBadge : undefined}>{badge}</View> : null}
      </View>
    </Pressable>
  );
}

interface NavigatorTabItemProps {
  active: boolean;
  badge?: ReactNode;
  icon?: RouteDefinition['icon'];
  label: string;
  onPress: () => void;
  orientation: 'horizontal' | 'rail' | 'sidebar';
  testID: string;
}

const styles = StyleSheet.create({
  activeContent: { backgroundColor: '#e5e7eb' },
  activeLabel: { fontWeight: '700' },
  content: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    padding: 8,
  },
  horizontalButton: { flex: 1 },
  railBadge: { position: 'absolute', right: 2, top: 2 },
  verticalButton: { width: '100%' },
});
