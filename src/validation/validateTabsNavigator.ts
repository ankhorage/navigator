import type { AppNavigatorManifest, TabsNavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic, NavigatorValidationContext } from '../definitions/NavigatorPlan';
import { resolveEffectiveTabsConfig } from '../expo-router/resolveNavigatorConfig';

const SURFACE_ICON_PROVIDERS = new Set([
  'Ionicons',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome6',
  'MaterialDesignIcons',
]);

interface TabsDiagnosticContext {
  native: boolean;
  custom: boolean;
  platform: NavigatorValidationContext['platform'];
}

/*** Add platform and stability diagnostics for the resolved tabs implementation. */
function addTabsPlatformDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  pointer: string,
  context: TabsDiagnosticContext,
  routerMajor: number | undefined,
): void {
  if (context.native && context.platform === 'web') {
    diagnostics.push({
      code: 'unsupported-platform',
      severity: 'error',
      path: pointer,
      message: 'Native Tabs are not available on web.',
    });
  }
  if (context.native && routerMajor !== undefined && routerMajor < 54) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: pointer,
      message: 'Native Tabs require Expo Router 54.0.0 or newer.',
    });
  }
  if (context.native) {
    diagnostics.push({
      code: 'alpha-adapter',
      severity: 'warning',
      path: pointer,
      message: 'Native Tabs are an alpha Expo Router API.',
    });
  }
  if (context.custom && context.platform !== 'web') {
    diagnostics.push({
      code: 'unsupported-platform',
      severity: 'error',
      path: pointer,
      message: 'Surface custom Tabs are only available on web.',
    });
  }
}

/*** Validate route icon compatibility for native and Surface-backed tabs. */
function addTabsIconDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  route: TabsNavigatorNode['routes'][number],
  routePointer: string,
  context: TabsDiagnosticContext,
): void {
  if (context.native && route.icon !== undefined && 'source' in route.icon) {
    diagnostics.push({
      code: 'unsupported-native-tabs-icon-source',
      severity: 'error',
      path: `${routePointer}/icon/source`,
      message:
        'Expo Native Tabs cannot render arbitrary SVG sources; use a named icon or platform-native image asset.',
    });
  }
  if (
    route.icon !== undefined &&
    'name' in route.icon &&
    route.icon.provider !== undefined &&
    (context.native || context.custom) &&
    !SURFACE_ICON_PROVIDERS.has(route.icon.provider)
  ) {
    diagnostics.push({
      code: 'unsupported-tabs-icon-provider',
      severity: 'error',
      path: `${routePointer}/icon/provider`,
      message: `Tabs do not support the icon provider ${JSON.stringify(route.icon.provider)}.`,
    });
  }
}

/*** Validate route reachability, guards, paths, counts, and icons for tabs. */
function addTabsRouteDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  node: TabsNavigatorNode,
  pointer: string,
  context: TabsDiagnosticContext,
): void {
  if (context.native && context.platform === 'android' && node.routes.length > 5) {
    diagnostics.push({
      code: 'native-tabs-route-limit',
      severity: 'error',
      path: `${pointer}/routes`,
      message: 'Android Native Tabs support at most five visible routes.',
    });
  }
  for (const [index, route] of node.routes.entries()) {
    const routePointer = `${pointer}/routes/${index}`;
    if (context.native && route.showInPrimaryNavigation === false) {
      diagnostics.push({
        code: 'native-tabs-hidden-route',
        severity: 'error',
        path: `${routePointer}/showInPrimaryNavigation`,
        message: 'Hiding a Native Tabs trigger makes the route unreachable; use an owning stack.',
      });
    }
    if ((context.native || context.custom) && (route.guards ?? []).length > 0) {
      diagnostics.push({
        code: 'unsupported-tabs-guard',
        severity: 'error',
        path: `${routePointer}/guards`,
        message: 'This Tabs implementation cannot register protected Screen entries.',
      });
    }
    if (context.custom && route.path === undefined) {
      diagnostics.push({
        code: 'missing-tabs-path',
        severity: 'error',
        path: `${routePointer}/path`,
        message:
          'Headless custom Tabs require an explicit route path; Navigator never infers URLs.',
      });
    }
    addTabsIconDiagnostics(diagnostics, route, routePointer, context);
  }
}

/*** Gate newer Native Tabs options on the Expo Router version that supports them. */
function addNativeVersionDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  config: ReturnType<typeof resolveEffectiveTabsConfig>,
  pointer: string,
  native: boolean,
  routerMajor: number | undefined,
): void {
  const nativeConfig =
    config?.implementation === 'native'
      ? config
      : config?.implementation === undefined || config.implementation === 'adaptive'
        ? config?.native
        : undefined;
  if (
    native &&
    routerMajor !== undefined &&
    routerMajor < 55 &&
    (nativeConfig?.minimizeBehavior !== undefined || nativeConfig?.bottomAccessory !== undefined)
  ) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: pointer,
      message:
        'Native Tabs minimize behavior and bottom accessory require Expo Router 55 or newer.',
    });
  }
}

/*** Add tabs-specific semantic diagnostics for one manifest navigator node. */
export function addTabsAdapterDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: TabsNavigatorNode,
  pointer: string,
  validationContext: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const config = resolveEffectiveTabsConfig(manifest, node, validationContext.platform);
  const implementation = config?.implementation ?? 'adaptive';
  const context: TabsDiagnosticContext = {
    native:
      implementation === 'native' ||
      (implementation === 'adaptive' && validationContext.platform !== 'web'),
    custom:
      implementation === 'custom' ||
      (implementation === 'adaptive' && validationContext.platform === 'web'),
    platform: validationContext.platform,
  };
  addTabsPlatformDiagnostics(diagnostics, pointer, context, routerMajor);
  addTabsRouteDiagnostics(diagnostics, node, pointer, context);
  addNativeVersionDiagnostics(diagnostics, config, pointer, context.native, routerMajor);
}
