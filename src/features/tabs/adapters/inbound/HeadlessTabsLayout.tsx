import type {
  NavigatorResponsiveSize,
  ResolvedTabsPresentation,
  RouteDefinition,
} from '@ankhorage/contracts/navigator';
import { Box, type IconSource, useBreakpoint } from '@ankhorage/surface';
import type { Href } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, useTabTrigger } from 'expo-router/ui';
import { type ComponentType, type ReactNode, useSyncExternalStore } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavigatorTabItem } from './NavigatorTabItem';

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

/** One explicit Expo Router tab registration plus optional Navigator presentation metadata. */
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

type HeadlessTabsIconSourceResolver = (source: IconMediaReference) => ResolvedSvgSource;

type IconMediaReference = Extract<
  NonNullable<RouteDefinition['icon']>,
  { source: unknown }
>['source'];

type ResolvedSvgSource = Extract<IconSource, { source: unknown }>['source'];

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
  /*** Bind one visible route to the shared Navigator trigger for registered custom chrome. */
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

/*** Render one Navigator-owned navigation control bound to Expo Router's headless tab trigger. */
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
  return (
    <NavigatorTabItem
      active={trigger?.isFocused ?? false}
      badge={route.badge}
      compact={compact}
      icon={resolveIcon(route.icon, resolveIconSource)}
      label={route.label}
      onPress={() => switchTab(route.name, {})}
      orientation={presentation}
      testID={`navigator-tabs-item-${route.name}`}
    />
  );
}

/*** Convert portable route icon metadata to the current Surface icon contract. */
function resolveIcon(
  icon: RouteDefinition['icon'],
  resolveIconSource: HeadlessTabsIconSourceResolver | undefined,
): IconSource | undefined {
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
  return { name: icon.name, provider, variant } as IconSource;
}

const ICON_PROVIDERS = new Set([
  'Ionicons',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome6',
  'MaterialDesignIcons',
]);

/*** Render Navigator-owned bottom, top, rail, or sidebar tab chrome. */
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
