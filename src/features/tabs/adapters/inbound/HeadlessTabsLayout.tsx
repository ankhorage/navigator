import type {
  NavigatorResponsiveSize,
  ResolvedTabsPresentation,
} from '@ankhorage/contracts/navigator';
import { Divider, View } from '@ankhorage/surface';
import type { Href } from 'expo-router';
import { TabList, Tabs, TabTrigger } from 'expo-router/ui';
import { type ComponentType, type ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  HeadlessTabsIconSourceResolver,
  HeadlessTabsRoute,
} from '../../../../types/headlessTabs';
import { useHydrationSafeSize } from '../../../../utils/useHydrationSafeSize';
import { BuiltInTabsPresentation } from './BuiltInTabsPresentation';
import { HeadlessTabsViewport } from './HeadlessTabsViewport';
import { NavigatorTabTrigger } from './NavigatorTabTrigger';

/*** Render one stable headless Expo Router tab topology with Navigator-owned presentations. */
export function HeadlessTabsLayout({
  routes,
  presentations,
  initialRouteName,
  resolveIconSource,
  customPresentation: CustomPresentation,
}: HeadlessTabsLayoutProps) {
  const size = useHydrationSafeSize();
  const presentation = selectPresentation(presentations, size);
  const insets = useSafeAreaInsets();
  const layout = resolveHeadlessTabsLayout(presentation, insets);
  const navigation = createTabsNavigation({
    CustomPresentation,
    presentation,
    resolveIconSource,
    routes,
  });
  return (
    <Tabs options={{ initialRouteName }} style={styles.root}>
      <HeadlessTabsBody
        bottomNavigationStyle={layout.bottomNavigationStyle}
        layoutStyle={layout.layoutStyle}
        navigation={navigation}
        navigationFirst={layout.navigationFirst}
        navigationInsets={layout.navigationInsets}
        navigationPanelStyle={layout.navigationPanelStyle}
        vertical={layout.vertical}
      />
      <TabList style={styles.hidden}>
        {routes.map((route) => (
          <TabTrigger href={route.href as Href} key={route.name} name={route.name} />
        ))}
      </TabList>
    </Tabs>
  );
}

/*** Construct the current Navigator presentation without changing the headless Expo Router topology. */
function createTabsNavigation(props: Parameters<typeof TabsNavigation>[0]) {
  return <TabsNavigation {...props} />;
}

/*** Place Navigator-owned navigation chrome around the bounded tab content slot. */
function HeadlessTabsBody({
  bottomNavigationStyle,
  layoutStyle,
  navigation,
  navigationFirst,
  navigationInsets,
  navigationPanelStyle,
  vertical,
}: {
  bottomNavigationStyle: StyleProp<ViewStyle>;
  layoutStyle: StyleProp<ViewStyle>;
  navigation: ReactNode;
  navigationFirst: boolean;
  navigationInsets: ViewStyle | undefined;
  navigationPanelStyle: StyleProp<ViewStyle>;
  vertical: boolean;
}) {
  return (
    <View bg="background" style={layoutStyle}>
      {navigationFirst ? (
        <View
          bg={vertical ? 'surface' : 'background'}
          style={[navigationPanelStyle, navigationInsets]}
        >
          {navigation}
        </View>
      ) : null}
      {vertical ? <Divider orientation="vertical" /> : null}
      <HeadlessTabsViewport />
      {!navigationFirst ? (
        <View bg="background" style={bottomNavigationStyle}>
          {navigation}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Runtime inputs for the cross-platform headless-tabs adapter. Routes remain mounted in one headless Router
 * topology while Navigator selects bottom, top, rail, sidebar, or registered custom chrome.
 */
interface HeadlessTabsLayoutProps {
  routes: readonly HeadlessTabsRoute[];
  presentations: Readonly<Record<NavigatorResponsiveSize, ResolvedTabsPresentation>>;
  initialRouteName?: string;
  resolveIconSource?: HeadlessTabsIconSourceResolver;
  customPresentation?: ComponentType<HeadlessTabsPresentationProps>;
}

interface HeadlessTabsPresentationProps {
  routes: readonly HeadlessTabsRoute[];
  renderItem: (route: HeadlessTabsRoute, compact?: boolean) => ReactNode;
}

/*** Resolve shell geometry and safe areas for the current built-in presentation. */
function resolveHeadlessTabsLayout(
  presentation: ResolvedTabsPresentation,
  insets: EdgeInsets,
): ResolvedHeadlessTabsLayout {
  const vertical = presentation === 'rail' || presentation === 'sidebar';
  const navigationInsets =
    presentation === 'top'
      ? { paddingTop: insets.top }
      : vertical
        ? {
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingTop: insets.top,
          }
        : undefined;
  const navigationPanelStyle =
    presentation === 'rail'
      ? styles.railPanel
      : presentation === 'sidebar'
        ? styles.sidebarPanel
        : undefined;
  return {
    bottomNavigationStyle: StyleSheet.compose(styles.bottomNavigation, {
      paddingBottom: insets.bottom,
    }),
    layoutStyle: vertical ? styles.row : styles.column,
    navigationFirst: vertical || presentation === 'top' || presentation === 'custom',
    navigationInsets,
    navigationPanelStyle,
    vertical,
  };
}

interface ResolvedHeadlessTabsLayout {
  bottomNavigationStyle: StyleProp<ViewStyle>;
  layoutStyle: StyleProp<ViewStyle>;
  navigationFirst: boolean;
  navigationInsets: ViewStyle | undefined;
  navigationPanelStyle: StyleProp<ViewStyle>;
  vertical: boolean;
}

/*** Select one fixed presentation without altering the Router-owned topology. */
function selectPresentation(
  presentations: HeadlessTabsLayoutProps['presentations'],
  size: NavigatorResponsiveSize,
): ResolvedTabsPresentation {
  switch (size) {
    case 'compact':
      return presentations.compact;
    case 'medium':
      return presentations.medium;
    case 'expanded':
      return presentations.expanded;
  }
}

/*** Select built-in or registered custom chrome for the currently visible routes. */
function TabsNavigation({
  CustomPresentation,
  presentation,
  resolveIconSource,
  routes,
}: {
  CustomPresentation: ComponentType<HeadlessTabsPresentationProps> | undefined;
  presentation: ResolvedTabsPresentation;
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined;
  routes: readonly HeadlessTabsRoute[];
}) {
  const visibleRoutes = routes.filter((route) => route.visible);
  /*** Bind one visible route to the shared Navigator trigger for registered custom chrome. */
  const renderItem = (route: HeadlessTabsRoute, compact = false) => (
    <NavigatorTabTrigger
      key={route.name}
      presentation={compact ? 'rail' : 'sidebar'}
      resolveIconSource={resolveIconSource}
      route={route}
    />
  );
  if (presentation === 'custom') {
    return CustomPresentation === undefined ? null : (
      <CustomPresentation renderItem={renderItem} routes={visibleRoutes} />
    );
  }
  return (
    <BuiltInTabsPresentation
      presentation={presentation}
      resolveIconSource={resolveIconSource}
      routes={visibleRoutes}
    />
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {},
  column: { flex: 1, flexDirection: 'column' },
  hidden: { display: 'none' },
  railPanel: { flexShrink: 0, minHeight: 0, width: 88 },
  root: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  sidebarPanel: { flexShrink: 0, minHeight: 0, width: 280 },
});
