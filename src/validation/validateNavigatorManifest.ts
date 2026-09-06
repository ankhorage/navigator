import type {
  AppNavigatorManifest,
  NavigatorNode,
  StackImplementation,
  StackNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic, NavigatorValidationContext } from '../definitions/NavigatorPlan';
import {
  parseExpoRouterMajor,
  resolveEffectiveStackConfig,
} from '../expo-router/resolveNavigatorConfig';
import { addExperimentalStackDiagnostics } from './validateExperimentalStack';
import { validatePresetTopology } from './validatePresetTopology';
import { addSplitViewDiagnostics } from './validateSplitView';
import { addTabsAdapterDiagnostics } from './validateTabsNavigator';

function addStackAdapterDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  node: StackNavigatorNode,
  pointer: string,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const config = resolveEffectiveStackConfig(manifest, node, context.platform);
  const implementation = config.implementation ?? 'native';

  if (implementation === 'javascript' && routerMajor !== undefined && routerMajor < 56) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: `${pointer}/implementation`,
      message: 'The JavaScript Stack entry point requires Expo Router 56.0.0 or newer.',
    });
  }
}

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
  if (node.type === 'custom') {
    diagnostics.push({
      code: 'adapter-unavailable',
      severity: 'error',
      path: pointer,
      message: 'Custom navigator is not available in the core Navigator release.',
    });
  }
}

function validateInitialRoute(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
  pointer: string,
): void {
  if (node.type === 'slot' && node.initialRouteName !== undefined) {
    diagnostics.push({
      code: 'unsupported-slot-initial-route',
      severity: 'error',
      path: `${pointer}/initialRouteName`,
      message: 'Slot cannot declare an initial route because it has no navigator state of its own.',
    });
  }
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

function validateRouteGuards(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
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
  if (node.type === 'slot' && (route.guards ?? []).length > 0) {
    diagnostics.push({
      code: 'unsupported-slot-guard',
      severity: 'error',
      path: `${routePointer}/guards`,
      message: 'Slot cannot declare route guards because it has no Screen registration API.',
    });
  }
}

function validateStackRouteOptions(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
  stackImplementation: StackImplementation | undefined,
): void {
  const { stackOptions } = route;
  if (stackImplementation === undefined && stackOptions !== undefined) {
    diagnostics.push({
      code: 'orphan-stack-options',
      severity: 'error',
      path: `${routePointer}/stackOptions`,
      message: 'stackOptions can only be authored for a route whose parent is a Stack.',
    });
    return;
  }
  const presentation = stackOptions?.presentation;
  if (
    stackImplementation === 'javascript' &&
    presentation !== undefined &&
    !['card', 'modal', 'transparentModal'].includes(presentation)
  ) {
    diagnostics.push({
      code: 'unsupported-stack-option',
      severity: 'error',
      path: `${routePointer}/stackOptions`,
      message: 'This route uses native-only options with the JavaScript Stack implementation.',
    });
  }
}

function validateLocalRoute(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
  route: NavigatorNode['routes'][number],
  routePointer: string,
  routeNames: Set<string>,
  stackImplementation: StackImplementation | undefined,
): void {
  validateRouteName(diagnostics, route, routePointer, routeNames);
  validateRouteTarget(diagnostics, route, routePointer);
  validateRouteGuards(diagnostics, node, route, routePointer);
  validateStackRouteOptions(diagnostics, route, routePointer, stackImplementation);
}

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
  validateInitialRoute(diagnostics, node, pointer);

  for (const [index, route] of node.routes.entries()) {
    const routePointer = `${pointer}/routes/${index}`;
    validateLocalRoute(diagnostics, node, route, routePointer, routeNames, stackImplementation);
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

/*** Validate one navigator desired-state slice for a concrete Expo Router target. */
export function validateNavigatorManifest(
  manifest: AppNavigatorManifest,
  context: NavigatorValidationContext,
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
  return diagnostics.sort((left, right) =>
    `${left.path}\0${left.code}\0${left.message}`.localeCompare(
      `${right.path}\0${right.code}\0${right.message}`,
    ),
  );
}
