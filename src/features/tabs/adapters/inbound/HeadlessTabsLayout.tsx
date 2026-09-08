import type {
  NavigatorResponsiveSize,
  ResolvedTabsPresentation,
  RouteDefinition,
} from '@ankhorage/contracts/navigator';
import {
  Box,
  NavigationItem,
  type NavigationItemIcon,
  type NavigationItemSpec,
  TabBarItem,
  useBreakpoint,
} from '@ankhorage/surface';
import type { Href } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, useTabTrigger } from 'expo-router/ui';
import { type ComponentType, type ReactNode, useSyncExternalStore } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*** Render one stable headless Expo Router tab topology with Surface-owned presentations. */
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
  const navigation = createTabsNavigation({
    CustomPresentation,
    presentation,
    resolveIconSource,
    routes,
  });
  const vertical = presentation === 'rail' || presentation === 'sidebar';
  const navigationFirst = vertical || presentation === 'top' || presentation === 'custom';
  const navigationInsets: ViewStyle | undefined =
    presentation === 'top'
      ? { paddingTop: insets.top }
      : vertical
        ? { paddingLeft: insets.left, paddingRight: insets.right }
        : undefined;
  const layoutStyle = vertical ? styles.row : styles.column;
  const bottomNavigationStyle = StyleSheet.compose(styles.bottomNavigation, {
    paddingBottom: insets.bottom,
  });

  return (
    <Tabs options={{ initialRouteName }} style={styles.root}>
      <HeadlessTabsBody
        bottomNavigationStyle={bottomNavigationStyle}
        layoutStyle={layoutStyle}
        navigation={navigation}
        navigationFirst={navigationFirst}
        navigationInsets={navigationInsets}
      />
      <TabList style={styles.hidden}>
        {routes.map((route) => (
          <TabTrigger href={route.href as Href} key={route.name} name={route.name} />
        ))}
      </TabList>
    </Tabs>
  );
}

/*** Construct the current Surface presentation without changing the headless Expo Router topology. */
function createTabsNavigation(props: Parameters<typeof TabsNavigation>[0]) {
  return <TabsNavigation {...props} />;
}

/*** Place themed navigation chrome around the bounded tab content slot. */
function HeadlessTabsBody({
  bottomNavigationStyle,
  layoutStyle,
  navigation,
  navigationFirst,
  navigationInsets,
}: {
  bottomNavigationStyle: StyleProp<ViewStyle>;
  layoutStyle: StyleProp<ViewStyle>;
  navigation: ReactNode;
  navigationFirst: boolean;
  navigationInsets: ViewStyle | undefined;
}) {
  return (
    <Box bg="background" style={layoutStyle}>
      {navigationFirst ? (
        <Box bg="background" style={navigationInsets}>
          {navigation}
        </Box>
      ) : null}
      <View style={styles.screen}>
        <TabSlot />
      </View>
      {!navigationFirst ? (
        <Box bg="background" style={bottomNavigationStyle}>
          {navigation}
        </Box>
      ) : null}
    </Box>
  );
}

/** One explicit Expo Router tab registration plus optional Surface-owned presentation metadata. */
interface HeadlessTabsRoute {
  name: string;
  href: string;
  label: string;
  icon?: RouteDefinition['icon'];
  badge?: ReactNode;
  visible: boolean;
}

/**
 * Runtime inputs for the cross-platform headless-tabs adapter. Routes remain mounted in one headless Router
 * topology while Surface selects bottom, top, rail, sidebar, or registered custom chrome.
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

type HeadlessTabsIconSourceResolver = (source: IconMediaReference) => ResolvedSvgSource;

type IconMediaReference = Extract<
  NonNullable<RouteDefinition['icon']>,
  { source: unknown }
>['source'];

type ResolvedSvgSource = Extract<NavigationItemIcon, { source: unknown }>['source'];

/*** Resolve a hydration-safe semantic size from the Surface breakpoint owner. */
function useHydrationSafeSize(): NavigatorResponsiveSize {
  const breakpoint = useBreakpoint();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydration,
    getServerHydration,
  );
  if (!hydrated) return 'compact';
  if (breakpoint === 'base' || breakpoint === 'sm') return 'compact';
  return breakpoint === 'md' ? 'medium' : 'expanded';
}

/*** Provide the stable no-op subscription required for the hydration snapshot boundary. */
function subscribeToHydration(): () => void {
  return () => undefined;
}

/*** Report that client rendering can consume the live responsive breakpoint. */
function getClientHydration(): boolean {
  return true;
}

/*** Keep server output deterministic at the compact presentation. */
function getServerHydration(): boolean {
  return false;
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
  /*** Bind one visible route to the shared Surface trigger for registered custom chrome. */
  const renderItem = (route: HeadlessTabsRoute, compact = false) => (
    <SurfaceTabTrigger
      compact={compact}
      key={route.name}
      presentation="vertical"
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
    <BuiltInPresentation
      presentation={presentation}
      resolveIconSource={resolveIconSource}
      routes={visibleRoutes}
    />
  );
}

/*** Render one Surface navigation control bound to Expo Router's headless tab trigger. */
function SurfaceTabTrigger({
  route,
  presentation,
  compact,
  resolveIconSource,
}: {
  route: HeadlessTabsRoute;
  presentation: 'horizontal' | 'vertical';
  compact: boolean;
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined;
}) {
  const { switchTab, trigger } = useTabTrigger({ name: route.name });
  const item: NavigationItemSpec = {
    id: route.name,
    label: route.label,
    active: trigger?.isFocused ?? false,
    onPress: () => switchTab(route.name, {}),
    accessibilityLabel: route.label,
    accessibilityRole: 'tab',
    icon: resolveIcon(route.icon, resolveIconSource),
    badge: route.badge,
  };
  return presentation === 'horizontal' ? (
    <TabBarItem compact={compact} item={item} testID="navigator-tabs" />
  ) : (
    <NavigationItem compact={compact} item={item} testID="navigator-tabs" />
  );
}

/*** Convert portable route icon metadata to the Surface navigation icon contract. */
function resolveIcon(
  icon: RouteDefinition['icon'],
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined,
): NavigationItemIcon | undefined {
  if (icon === undefined) return undefined;
  if ('source' in icon) {
    return resolveIconSource === undefined || icon.source === undefined
      ? undefined
      : { source: resolveIconSource(icon.source) };
  }
  const provider = icon.provider ?? 'Ionicons';
  if (!ICON_PROVIDERS.has(provider)) return undefined;
  const variant =
    provider === 'FontAwesome5' || provider === 'FontAwesome6' ? 'regular' : undefined;
  return { name: icon.name, provider, variant } as NavigationItemIcon;
}

const ICON_PROVIDERS = new Set([
  'Ionicons',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome6',
  'MaterialDesignIcons',
]);

/*** Render Surface-owned bottom, top, rail, or sidebar tab chrome. */
function BuiltInPresentation({
  presentation,
  routes,
  resolveIconSource,
}: {
  presentation: Exclude<ResolvedTabsPresentation, 'custom'>;
  routes: readonly HeadlessTabsRoute[];
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined;
}) {
  const horizontal = presentation === 'bottom' || presentation === 'top';
  const compact = presentation === 'rail';
  const style = horizontal ? styles.horizontalNavigation : styles.verticalNavigation;
  return (
    <View accessibilityRole="tablist" style={style} testID={`navigator-tabs-${presentation}`}>
      {routes.map((route) => (
        <SurfaceTabTrigger
          compact={compact}
          key={route.name}
          presentation={horizontal ? 'horizontal' : 'vertical'}
          resolveIconSource={resolveIconSource}
          route={route}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {},
  column: { flex: 1, flexDirection: 'column' },
  hidden: { display: 'none' },
  horizontalNavigation: { flexDirection: 'row' },
  root: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  screen: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' },
  verticalNavigation: { flexDirection: 'column' },
});
