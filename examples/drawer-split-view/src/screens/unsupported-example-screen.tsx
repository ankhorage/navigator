import { ScrollView, StyleSheet, Text } from 'react-native';

/*** Display the expected diagnostics without presenting a fallback as capability support. */
export function UnsupportedExampleScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text selectable style={styles.title}>
        Drawer → Split View
      </Text>
      <Text selectable>Explicit unsupported case: Split View cannot be nested beneath Drawer.</Text>
      <Text selectable>
        Expected diagnostics: invalid-split-view-placement, unsupported-platform
      </Text>
      <Text selectable>
        This shell is evidence of explicit rejection, not a navigation fallback.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  title: { fontSize: 30, fontWeight: '700' },
});
