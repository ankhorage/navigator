import type { Href } from 'expo-router';
import { Link, router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

const routes = [
  {
    href: '/',
    label: 'Entry',
  },
  {
    href: '/workspace',
    label: 'Overview',
  },
  {
    href: '/workspace/settings',
    label: 'Settings',
  },
] as const;

/*** Render observable navigation behavior without product-specific content. */
export function ExampleScreen() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const dark = useColorScheme() === 'dark';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      style={dark ? styles.rootDark : styles.rootLight}
    >
      <TitleSection dark={dark} pathname={pathname} />
      <StateSection count={count} dark={dark} onIncrement={() => setCount((value) => value + 1)} />
      <RoutesSection dark={dark} />
      <ScrollEvidence dark={dark} />
      <FinalAction completed={completed} onComplete={() => setCompleted(true)} />
    </ScrollView>
  );
}
/*** Display the example identity and current route. */
function TitleSection({ dark, pathname }: { dark: boolean; pathname: string }) {
  const text = dark ? styles.textDark : styles.textLight;
  return (
    <View style={styles.titleSection}>
      <Text selectable style={[styles.title, text]}>
        Stack → Drawer
      </Text>
      <Text selectable style={[styles.route, text]}>
        Current route: {pathname}
      </Text>
      <Text selectable style={[styles.description, text]}>
        Neutral entry Stack followed by a Drawer.
      </Text>
    </View>
  );
}

/*** Display observable app-owned state. */
function StateSection({
  count,
  dark,
  onIncrement,
}: {
  count: number;
  dark: boolean;
  onIncrement: () => void;
}) {
  const text = dark ? styles.textDark : styles.textLight;
  const card = dark ? styles.cardDark : styles.cardLight;
  return (
    <View style={[styles.card, card]}>
      <Text selectable style={[styles.heading, text]}>
        Local state
      </Text>
      <Text selectable style={[styles.count, text]}>
        Count: {count}
      </Text>
      <Pressable accessibilityRole="button" onPress={onIncrement} style={styles.button}>
        <Text selectable style={styles.buttonText}>
          Increment counter
        </Text>
      </Pressable>
    </View>
  );
}

/*** Display explicit navigation and Back controls. */
function RoutesSection({ dark }: { dark: boolean }) {
  const text = dark ? styles.textDark : styles.textLight;
  const card = dark ? styles.cardDark : styles.cardLight;
  return (
    <View style={styles.section}>
      <Text selectable style={[styles.heading, text]}>
        Routes
      </Text>
      {routes.map((route) => (
        <Link key={route.href} href={route.href as Href} asChild>
          <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.routeCard, card])}>
            <Text selectable style={text}>
              {route.label} — {route.href}
            </Text>
          </Pressable>
        </Link>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (router.canGoBack()) router.back();
        }}
        style={[styles.routeCard, card]}
      >
        <Text selectable style={text}>
          Back
        </Text>
      </Pressable>
    </View>
  );
}

/*** Keep the final action below the fold for scroll verification. */
function ScrollEvidence({ dark }: { dark: boolean }) {
  const text = dark ? styles.textDark : styles.textLight;
  return (
    <View style={styles.section}>
      {Array.from({ length: 24 }, (_, index) => (
        <Text key={index} selectable style={[styles.evidence, text]}>
          Scroll evidence {index + 1}: neutral content keeps the final action below the fold.
        </Text>
      ))}
    </View>
  );
}

/*** Record that the final action remains reachable. */
function FinalAction({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onComplete}
      style={[styles.finalAction, completed ? styles.finalComplete : styles.finalPending]}
    >
      <Text selectable style={styles.finalText}>
        {completed ? 'Final action reached' : 'Complete example'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rootDark: { backgroundColor: '#111113' },
  rootLight: { backgroundColor: '#f7f7f8' },
  content: { padding: 24, gap: 20 },
  section: { gap: 10 },
  titleSection: { gap: 8 },
  title: { fontSize: 30, fontWeight: '700' },
  route: { fontSize: 16 },
  description: { opacity: 0.72 },
  card: { borderRadius: 18, padding: 18, gap: 12 },
  cardDark: { backgroundColor: '#242428' },
  cardLight: { backgroundColor: '#ffffff' },
  heading: { fontSize: 18, fontWeight: '600' },
  textDark: { color: '#f5f5f7' },
  textLight: { color: '#18181b' },
  count: { fontVariant: ['tabular-nums'] },
  button: { backgroundColor: '#2563eb', borderRadius: 12, padding: 14 },
  routeCard: { borderRadius: 12, padding: 14 },
  buttonText: { color: '#ffffff', fontWeight: '600' },
  evidence: { lineHeight: 24 },
  finalAction: { borderRadius: 14, padding: 16 },
  finalPending: { backgroundColor: '#2563eb' },
  finalComplete: { backgroundColor: '#15803d' },
  finalText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
});
