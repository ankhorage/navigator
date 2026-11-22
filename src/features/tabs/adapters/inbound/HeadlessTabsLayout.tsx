import type {
  NavigatorResponsiveSize,
  ResolvedTabsPresentation,
} from '@ankhorage/contracts/navigator';
import type { Href } from 'expo-router';
import { TabList, Tabs, TabTrigger } from 'expo-router/ui';
import { type ComponentType, type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  HeadlessTabsPresentationOrientation,
  HeadlessTabsPresentationProps,
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
  customPresentation: CustomPresentation,
  customPresentationOrientation = 'horizontal',
}: HeadlessTabsLayoutProps) {
  const size = useHydrationSafeSize();
  const presentation = selectPresentation(presentations, size);
  const insets = useSafeAreaInsets();
  const layout = resolveHeadlessTabsLayout(presentation, customPresentationOrientation, insets);
  const navigation = createTabsNavigation({
    CustomPresentation,
    customPresentationOrientation,
    presentation,
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
    <View style={layoutStyle}>
      {navigationFirst ? (
        <View style={[navigationPanelStyle, navigationInsets]}>{navigation}</View>
      ) : null}
      {vertical ? <View style={styles.divider} /> : null}
      <HeadlessTabsViewport />
      {!navigationFirst ? <View style={bottomNavigationStyle}>{navigation}</View> : null}
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
  customPresentation?: ComponentType<HeadlessTabsPresentationProps>;
  customPresentationOrientation?: HeadlessTabsPresentationOrientation;
}

/*** Resolve shell geometry and safe areas for the current built-in presentation. */
function resolveHeadlessTabsLayout(
  presentation: ResolvedTabsPresentation,
  customPresentationOrientation: HeadlessTabsPresentationOrientation,
  insets: EdgeInsets,
): ResolvedHeadlessTabsLayout {
  const vertical =
    presentation === 'rail' ||
    presentation === 'sidebar' ||
    (presentation === 'custom' && customPresentationOrientation === 'vertical');
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
  customPresentationOrientation,
  presentation,
  routes,
}: {
  CustomPresentation: ComponentType<HeadlessTabsPresentationProps> | undefined;
  customPresentationOrientation: HeadlessTabsPresentationOrientation;
  presentation: ResolvedTabsPresentation;
  routes: readonly HeadlessTabsRoute[];
}) {
  const visibleRoutes = routes.filter((route) => route.visible);
  /*** Bind one visible route to the shared Navigator trigger for registered custom chrome. */
  const renderItem = (route: HeadlessTabsRoute, compact = false) => (
    <NavigatorTabTrigger
      key={route.name}
      presentation={compact ? 'rail' : 'sidebar'}
      route={route}
    />
  );
  if (presentation === 'custom') {
    return CustomPresentation === undefined ? null : (
      <CustomPresentation
        orientation={customPresentationOrientation}
        presentation={presentation}
        renderItem={renderItem}
        routes={visibleRoutes}
      />
    );
  }
  return <BuiltInTabsPresentation presentation={presentation} routes={visibleRoutes} />;
}

const styles = StyleSheet.create({
  bottomNavigation: {},
  column: { flex: 1, flexDirection: 'column' },
  divider: { alignSelf: 'stretch', backgroundColor: '#d1d5db', width: StyleSheet.hairlineWidth },
  hidden: { display: 'none' },
  railPanel: { flexShrink: 0, minHeight: 0, width: 88 },
  root: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  sidebarPanel: { flexShrink: 0, minHeight: 0, width: 280 },
});
