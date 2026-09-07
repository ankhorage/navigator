import type { NavigatorGeneratedFile, NavigatorNode } from '@ankhorage/contracts/navigator';

import type {
  NavigatorExampleDefinition,
  NavigatorExampleDescriptor,
} from '../types/navigatorExamples';

/*** Create the app-owned observable screens, guards, and registered integration for one example. */
export function createNavigatorExampleScreenFiles(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
): readonly NavigatorGeneratedFile[] {
  const files: NavigatorGeneratedFile[] = [exampleScreenFile(definition)];
  if (Object.hasOwn(definition.bindings.guards, 'example-enabled')) {
    files.push({
      path: 'src/guards/is-example-enabled.ts',
      contents:
        '/*** Keep the protected example route reachable through an app-owned predicate. */\nexport function isExampleEnabled(): boolean {\n  return true;\n}\n',
    });
  }
  if (Object.hasOwn(definition.bindings.screens, 'primary')) {
    files.push(columnScreen('primary-column-screen', 'PrimaryColumnScreen'));
  }
  if (Object.hasOwn(definition.bindings.screens, 'supplementary')) {
    files.push(columnScreen('supplementary-column-screen', 'SupplementaryColumnScreen'));
  }
  if (Object.hasOwn(definition.bindings.screens, 'inspector')) {
    files.push(columnScreen('inspector-screen', 'InspectorScreen'));
  }
  if (definition.customNavigatorRegistrations !== undefined) {
    files.push({
      path: 'src/navigators/registered-custom-navigator.ts',
      contents:
        "import { Tabs } from 'expo-router';\n\n/*** Bind the registered example to Expo Router-owned tab state and history. */\nexport const RegisteredCustomNavigator = Tabs;\n",
    });
  }
  if (descriptor.targets.every(({ support }) => support === 'unsupported'))
    files.push(...unsupportedScreenFiles(definition, descriptor));
  return files;
}

/*** Create the observable screen shared by generated route bindings. */
function exampleScreenFile(definition: NavigatorExampleDefinition): NavigatorGeneratedFile {
  return {
    path: 'src/screens/example-screen.tsx',
    contents: renderExampleScreen(definition, collectRoutes(definition.manifest)),
  };
}

/*** Create the runnable explanation shell for deliberately unsupported compositions. */
function unsupportedScreenFiles(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
): readonly NavigatorGeneratedFile[] {
  return [
    {
      path: 'src/app/_layout.tsx',
      contents:
        "import { Stack } from 'expo-router/stack';\n\nexport default function UnsupportedExampleLayout() {\n  return <Stack screenOptions={{ headerShown: false }} />;\n}\n",
    },
    {
      path: 'src/app/index.tsx',
      contents:
        "export { UnsupportedExampleScreen as default } from '@/screens/unsupported-example-screen';\n",
    },
    {
      path: 'src/screens/unsupported-example-screen.tsx',
      contents: renderUnsupportedScreen(definition, descriptor),
    },
  ];
}

interface ExampleRouteLink {
  readonly href: string;
  readonly label: string;
}

/*** Collect public leaf paths without treating Expo Router groups as URL segments. */
function collectRoutes(node: NavigatorNode, parentPath = ''): readonly ExampleRouteLink[] {
  return node.routes.flatMap((route) => {
    const segment = route.name === 'index' || /^\(.+\)$/u.test(route.name) ? '' : route.name;
    const inferredPath = [parentPath, segment].filter(Boolean).join('/');
    const href = route.path ?? (`/${inferredPath}`.replace(/\/$/u, '') || '/');
    const current =
      route.screenId === undefined ? [] : [{ href, label: route.label ?? route.name }];
    return route.navigator === undefined
      ? current
      : [...current, ...collectRoutes(route.navigator, inferredPath)];
  });
}

/*** Render the shared neutral screen with route, state, navigation, scroll, and final-action proof. */
function renderExampleScreen(
  definition: NavigatorExampleDefinition,
  routes: readonly ExampleRouteLink[],
): string {
  const uniqueRoutes = [...new Map(routes.map((route) => [route.href, route])).values()];
  return `import type { Href } from 'expo-router';
import { Link, router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

const routes = ${JSON.stringify(uniqueRoutes, null, 2)} as const;

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
${renderScreenComponents(definition)}
${SCREEN_STYLES}`;
}

const SCREEN_STYLES = `const styles = StyleSheet.create({
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
`;

/*** Render the small generated components around dynamic catalog copy. */
function renderScreenComponents(definition: NavigatorExampleDefinition): string {
  return `/*** Display the example identity and current route. */
function TitleSection({ dark, pathname }: { dark: boolean; pathname: string }) {
  const text = dark ? styles.textDark : styles.textLight;
  return (
    <View style={styles.titleSection}>
      <Text selectable style={[styles.title, text]}>${escapeTemplateText(definition.title)}</Text>
      <Text selectable style={[styles.route, text]}>Current route: {pathname}</Text>
      <Text selectable style={[styles.description, text]}>${escapeTemplateText(definition.description)}</Text>
    </View>
  );
}

${STATE_SECTION}${ROUTES_SECTION}${SCROLL_AND_FINAL_SECTIONS}`;
}

const STATE_SECTION = `/*** Display observable app-owned state. */
function StateSection({ count, dark, onIncrement }: { count: number; dark: boolean; onIncrement: () => void }) {
  const text = dark ? styles.textDark : styles.textLight;
  const card = dark ? styles.cardDark : styles.cardLight;
  return (
    <View style={[styles.card, card]}>
      <Text selectable style={[styles.heading, text]}>Local state</Text>
      <Text selectable style={[styles.count, text]}>Count: {count}</Text>
      <Pressable accessibilityRole="button" onPress={onIncrement} style={styles.button}>
        <Text selectable style={styles.buttonText}>Increment counter</Text>
      </Pressable>
    </View>
  );
}

`;

const ROUTES_SECTION = `/*** Display explicit navigation and Back controls. */
function RoutesSection({ dark }: { dark: boolean }) {
  const text = dark ? styles.textDark : styles.textLight;
  const card = dark ? styles.cardDark : styles.cardLight;
  return (
    <View style={styles.section}>
      <Text selectable style={[styles.heading, text]}>Routes</Text>
      {routes.map((route) => (
        <Link key={route.href} href={route.href as Href} asChild>
          <Pressable
            accessibilityRole="link"
            style={StyleSheet.flatten([styles.routeCard, card])}
          >
            <Text selectable style={text}>{route.label} — {route.href}</Text>
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
        <Text selectable style={text}>Back</Text>
      </Pressable>
    </View>
  );
}

`;

const SCROLL_AND_FINAL_SECTIONS = `/*** Keep the final action below the fold for scroll verification. */
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

`;

/*** Create one Split View column module backed by the same observable screen. */
function columnScreen(fileName: string, exportName: string): NavigatorGeneratedFile {
  return {
    path: `src/screens/${fileName}.tsx`,
    contents: `import { ExampleScreen } from './example-screen';\n\n/*** Render one observable Split View region. */\nexport function ${exportName}() {\n  return <ExampleScreen />;\n}\n`,
  };
}

/*** Render a runnable shell that explains a deliberately unsupported composition. */
function renderUnsupportedScreen(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
): string {
  const diagnostics = [
    ...new Set(descriptor.targets.flatMap((target) => target.diagnostics.map(({ code }) => code))),
  ];
  return `import { ScrollView, StyleSheet, Text } from 'react-native';

/*** Display the expected diagnostics without presenting a fallback as capability support. */
export function UnsupportedExampleScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text selectable style={styles.title}>
        ${escapeTemplateText(definition.title)}
      </Text>
      <Text selectable>${escapeTemplateText(definition.description)}</Text>
      <Text selectable>Expected diagnostics: ${diagnostics.join(', ')}</Text>
      <Text selectable>This shell is evidence of explicit rejection, not a navigation fallback.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  title: { fontSize: 30, fontWeight: '700' },
});
`;
}

/*** Escape template-significant characters in generated plain text. */
function escapeTemplateText(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
}
