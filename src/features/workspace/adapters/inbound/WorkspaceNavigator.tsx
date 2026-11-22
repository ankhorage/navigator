import { Slot, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  ResolvedWorkspaceNavigationRoute,
  WorkspaceNavigatorProps,
} from '../../../../types/workspaceNavigation';
import { useHydrationSafeSize } from '../../../../utils/useHydrationSafeSize';
import { resolveWorkspaceNavigation } from '../../domain/resolveWorkspaceNavigation';

/*** Render accessible unthemed workspace navigation around Expo Router page content. */
export function WorkspaceNavigator(props: WorkspaceNavigatorProps) {
  const { routes, activeRouteId, title, exit, onNavigate } = props;
  const router = useRouter();
  const size = useHydrationSafeSize();
  const [menuOpen, setMenuOpen] = useState(false);
  const compact = size === 'compact';
  const navigation = resolveWorkspaceNavigation(routes, activeRouteId);
  const active = routes.find((route) => route.id === activeRouteId);

  /*** Change one workspace destination through Expo Router and dismiss compact navigation. */
  const navigate = (route: ResolvedWorkspaceNavigationRoute) => {
    if (route.href === null) return;
    onNavigate?.(route.id);
    router.push(route.href);
    setMenuOpen(false);
  };

  /*** Leave the workspace through the consumer-provided external destination. */
  const leave = () => {
    if (exit === undefined) return;
    router.replace(exit.href);
    setMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <WorkspaceHeader
        active={active}
        compact={compact}
        exitLabel={exit?.label}
        onExit={leave}
        onOpenMenu={() => setMenuOpen(true)}
        title={title}
      />
      <WorkspaceBody
        compact={compact}
        medium={size === 'medium'}
        navigation={navigation}
        onNavigate={navigate}
        title={title}
      />
      {compact && menuOpen ? (
        <WorkspaceNavigationOverlay
          navigation={navigation}
          onClose={() => setMenuOpen(false)}
          onNavigate={navigate}
          title={title}
        />
      ) : null}
    </SafeAreaView>
  );
}

/*** Keep routed page content bounded beside the permanent medium or expanded navigation. */
function WorkspaceBody({
  compact,
  medium,
  navigation,
  onNavigate,
  title,
}: {
  compact: boolean;
  medium: boolean;
  navigation: readonly ResolvedWorkspaceNavigationRoute[];
  onNavigate: (route: ResolvedWorkspaceNavigationRoute) => void;
  title: string;
}) {
  return (
    <View style={styles.body}>
      {!compact ? (
        <WorkspaceNavigationList
          navigation={navigation}
          onNavigate={onNavigate}
          title={title}
          width={medium ? 220 : 280}
        />
      ) : null}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

/*** Present the current page title, external exit, and compact menu action. */
function WorkspaceHeader({
  active,
  compact,
  exitLabel,
  onExit,
  onOpenMenu,
  title,
}: {
  active: WorkspaceNavigatorProps['routes'][number] | undefined;
  compact: boolean;
  exitLabel: string | undefined;
  onExit: () => void;
  onOpenMenu: () => void;
  title: string;
}) {
  return (
    <View style={styles.header}>
      {exitLabel ? (
        <Pressable accessibilityRole="button" onPress={onExit} style={styles.headerAction}>
          <Text style={styles.headerActionText}>{exitLabel}</Text>
        </Pressable>
      ) : null}
      <View style={styles.headerTitle}>
        <Text style={styles.title} numberOfLines={1}>
          {active?.label ?? title}
        </Text>
        {active?.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {active.description}
          </Text>
        ) : null}
      </View>
      {compact ? (
        <Pressable
          accessibilityLabel={`Open ${title} navigation`}
          accessibilityRole="button"
          onPress={onOpenMenu}
          style={styles.headerAction}
        >
          <Text style={styles.headerActionText}>Menu</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/*** Overlay the same navigation list above routed content on compact viewports. */
function WorkspaceNavigationOverlay({
  navigation,
  onClose,
  onNavigate,
  title,
}: {
  navigation: readonly ResolvedWorkspaceNavigationRoute[];
  onClose: () => void;
  onNavigate: (route: ResolvedWorkspaceNavigationRoute) => void;
  title: string;
}) {
  return (
    <View style={styles.overlay}>
      <Pressable
        accessibilityLabel="Close navigation"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.scrim}
      />
      <WorkspaceNavigationList
        navigation={navigation}
        onNavigate={onNavigate}
        title={title}
        width={280}
      />
    </View>
  );
}

/*** Present the same hierarchy in a permanent panel or compact overlay. */
function WorkspaceNavigationList({
  navigation,
  onNavigate,
  title,
  width,
}: {
  navigation: readonly ResolvedWorkspaceNavigationRoute[];
  onNavigate: (route: ResolvedWorkspaceNavigationRoute) => void;
  title: string;
  width: number;
}) {
  return (
    <ScrollView
      accessibilityLabel={`${title} navigation`}
      contentContainerStyle={styles.navigationContent}
      style={[styles.navigation, { width }]}
    >
      <Text style={styles.navigationTitle}>{title}</Text>
      {navigation.map((route) => (
        <WorkspaceNavigationItem key={route.id} onNavigate={onNavigate} route={route} />
      ))}
    </ScrollView>
  );
}

/*** Render one destination with its availability, icon, and active state. */
function WorkspaceNavigationItem({
  onNavigate,
  route,
}: {
  onNavigate: (route: ResolvedWorkspaceNavigationRoute) => void;
  route: ResolvedWorkspaceNavigationRoute;
}) {
  return (
    <Pressable
      accessibilityLabel={route.label}
      accessibilityRole="link"
      accessibilityState={{ disabled: route.href === null, selected: route.selected }}
      disabled={route.href === null}
      onPress={() => onNavigate(route)}
      style={[
        styles.navigationItem,
        { marginLeft: route.depth * 16 },
        route.active ? styles.activeNavigationItem : null,
        route.href === null ? styles.disabled : null,
      ]}
    >
      <Text style={route.selected ? styles.selectedText : undefined}>{route.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#fff', flex: 1, minHeight: 0 },
  activeNavigationItem: { backgroundColor: '#e5e7eb' },
  header: {
    alignItems: 'center',
    borderBottomColor: '#d1d5db',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 16,
  },
  headerAction: { justifyContent: 'center', minHeight: 44 },
  headerActionText: { fontSize: 14, fontWeight: '600' },
  headerTitle: { flex: 1, minWidth: 0 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  content: { flex: 1, minHeight: 0 },
  description: { color: '#4b5563' },
  navigation: { backgroundColor: '#f9fafb', flexGrow: 0, flexShrink: 0 },
  navigationContent: { gap: 4, padding: 12 },
  navigationTitle: { color: '#4b5563', fontSize: 12, fontWeight: '700', padding: 8 },
  navigationItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  disabled: { opacity: 0.45 },
  selectedText: { fontWeight: '700' },
  overlay: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  scrim: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: '#0008' },
});
