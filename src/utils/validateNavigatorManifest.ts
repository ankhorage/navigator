import type {
  AppNavigatorManifest,
  NavigatorNode,
  StackImplementation,
} from '@ankhorage/contracts/navigator';

import { addCustomNavigatorDiagnostics } from '../features/custom/domain/addCustomNavigatorDiagnostics';
import type { CustomNavigatorRegistry } from '../features/custom/domain/CustomNavigatorRegistry';
import { addSlotDiagnostics } from '../features/slot/domain/addSlotDiagnostics';
import { addSplitViewDiagnostics } from '../features/split-view/domain/addSplitViewDiagnostics';
import { addExperimentalStackDiagnostics } from '../features/stack/domain/addExperimentalStackDiagnostics';
import { addStackAdapterDiagnostics } from '../features/stack/domain/addStackAdapterDiagnostics';
import { resolveEffectiveStackConfig } from '../features/stack/domain/resolveEffectiveStackConfig';
import { validateStackRouteOptions } from '../features/stack/domain/validateStackRouteOptions';
import { addTabsAdapterDiagnostics } from '../features/tabs/domain/addTabsAdapterDiagnostics';
import type { NavigatorDiagnostic } from './NavigatorDiagnostic';
import type { NavigatorValidationContext } from './NavigatorValidationContext';
import { parseExpoRouterMajor } from './parseExpoRouterMajor';
import { validatePresetTopology } from './validatePresetTopology';

/*** Validate one navigator desired-state slice for a concrete Expo Router target. */
export function validateNavigatorManifest(
  manifest: AppNavigatorManifest,
  context: NavigatorValidationContext,
  customNavigators?: CustomNavigatorRegistry,
): readonly NavigatorDiagnostic[] {
  const diagnostics: NavigatorDiagnostic[] = [];
  const routerMajor = parseExpoRouterMajor(context.expoRouterVersion);
  if (routerMajor === undefined) {
    diagnostics.push({
      code: 'invalid-expo-router-version',
      severity: 'error',
      path: '',
      message: 'expoRouterVersion must be an exact semantic version such as 56.0.0.',
    });
  }

  validatePresetTopology(diagnostics, manifest);
  validateNode(diagnostics, manifest, manifest, '', context, routerMajor);
  addExperimentalStackDiagnostics(diagnostics, manifest, context, routerMajor);
  addSplitViewDiagnostics(diagnostics, manifest, context, routerMajor);
  addCustomNavigatorDiagnostics(diagnostics, manifest, context, routerMajor, customNavigators);
  return diagnostics.sort((left, right) =>
    `${left.path}\0${left.code}\0${left.message}`.localeCompare(
      `${right.path}\0${right.code}\0${right.message}`,
    ),
  );
}

/*** Traverse each navigator with local route-name state and its resolved Stack policy. */
function validateNode(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: NavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const routeNames = new Set<string>();
  const stackImplementation =
    node.type === 'stack'
      ? (resolveEffectiveStackConfig(manifest, node, context.platform).implementation ?? 'native')
      : undefined;
  addUnsupportedAdapterDiagnostics(diagnostics, manifest, node, pointer, context, routerMajor);
  addSlotDiagnostics(diagnostics, node, pointer);
  validateInitialRoute(diagnostics, node, pointer);

  for (const [index, route] of node.routes.entries()) {
    const routePointer = `${pointer}/routes/${index}`;
    validateLocalRoute(diagnostics, route, routePointer, routeNames, stackImplementation);
    if (route.navigator !== undefined) {
      validateNode(
        diagnostics,
        manifest,
        route.navigator,
        `${routePointer}/navigator`,
        context,
        routerMajor,
      );
    }
  }
}

/*** Delegate adapter availability checks to the owning Stack or Tabs feature. */
function addUnsupportedAdapterDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: NavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  if (node.type === 'stack') {
    addStackAdapterDiagnostics(diagnostics, manifest, node, pointer, context, routerMajor);
  }
  if (node.type === 'tabs') {
    addTabsAdapterDiagnostics(diagnostics, manifest, node, pointer, context, routerMajor);
  }
}

/*** Require a declared initial route to exist among the navigator's immediate children. */
function validateInitialRoute(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
  pointer: string,
): void {
  if (
    node.initialRouteName === undefined ||
    node.routes.some((route) => route.name === node.initialRouteName)
  ) {
    return;
  }
  diagnostics.push({
    code: 'unknown-initial-route',
    severity: 'error',
    path: `${pointer}/initialRouteName`,
    message: `Initial route ${JSON.stringify(node.initialRouteName)} does not exist in this navigator.`,
  });
}

/*** Validate one route's name, target, guards, and resolved Stack options. */
function validateLocalRoute(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
  routeNames: Set<string>,
  stackImplementation: StackImplementation | undefined,
): void {
  validateRouteName(diagnostics, route, routePointer, routeNames);
  validateRouteTarget(diagnostics, route, routePointer);
  validateRouteGuards(diagnostics, route, routePointer);
  validateStackRouteOptions(diagnostics, route, routePointer, stackImplementation);
}

/*** Reject duplicate names and unsafe Expo Router file segments within one navigator. */
function validateRouteName(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
  routeNames: Set<string>,
): void {
  if (routeNames.has(route.name)) {
    diagnostics.push({
      code: 'duplicate-route-name',
      severity: 'error',
      path: `${routePointer}/name`,
      message: `Route name ${JSON.stringify(route.name)} is duplicated in this navigator.`,
    });
  }
  routeNames.add(route.name);
  if (!/^[A-Za-z0-9_.()[\]-]+$/u.test(route.name) || route.name === '.' || route.name === '..') {
    diagnostics.push({
      code: 'invalid-route-name',
      severity: 'error',
      path: `${routePointer}/name`,
      message: 'Route names must be safe Expo Router file segments.',
    });
  }
}

/*** Require exactly one screen binding or nested navigator per route. */
function validateRouteTarget(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
): void {
  if ((route.screenId === undefined) === (route.navigator === undefined)) {
    diagnostics.push({
      code: 'invalid-route-target',
      severity: 'error',
      path: routePointer,
      message: 'A route must declare exactly one screenId or nested navigator.',
    });
  }
}

/*** Reject repeated guard references on a single route. */
function validateRouteGuards(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
): void {
  if (new Set(route.guards ?? []).size !== (route.guards ?? []).length) {
    diagnostics.push({
      code: 'duplicate-route-guard',
      severity: 'error',
      path: `${routePointer}/guards`,
      message: 'A route cannot reference the same guard more than once.',
    });
  }
}
