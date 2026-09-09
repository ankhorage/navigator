import { TabSlot } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';

/*** Bound the Expo Router tab slot so route-owned scrolling receives the available viewport. */
export function HeadlessTabsViewport() {
  return (
    <View style={styles.root}>
      <TabSlot style={styles.slot} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' },
  slot: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    minWidth: 0,
  },
});
