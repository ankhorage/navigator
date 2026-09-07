import type {
  AppNavigatorManifest,
  CreateNavigatorPlanOptions,
  CustomNavigatorRegistry,
  NavigatorAdapterPlan,
  NavigatorCapabilityId,
  NavigatorDependencyRequirement,
  NavigatorNode,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorResponsiveSize,
  NavigatorRoutePlan,
  NavigatorRuntimePlatform,
  StackImplementationConfig,
  TabsNavigatorPlan,
} from '@ankhorage/contracts/navigator';

import { resolveCustomNavigatorAdapterPlan } from '../features/custom/application/resolveCustomNavigatorAdapterPlan';
import { createDrawerAdapter } from '../features/drawer/application/createDrawerAdapter';
import { createSlotAdapter } from '../features/slot/application/createSlotAdapter';
import { resolveSplitViewAdapterPlan } from '../features/split-view/application/resolveSplitViewAdapterPlan';
import { createStackAdapter } from '../features/stack/application/createStackAdapter';
import { resolveEffectiveStackConfig } from '../features/stack/domain/resolveEffectiveStackConfig';
import { createTabsAdapter } from '../features/tabs/application/createTabsAdapter';
import { resolveTabsPlan } from '../features/tabs/application/resolveTabsPlan';
import { resolveEffectiveTabsConfig } from '../features/tabs/domain/resolveEffectiveTabsConfig';
import { parseExpoRouterMajor } from './parseExpoRouterMajor';
import { validateNavigatorManifest } from './validateNavigatorManifest';

/*** Create a disposable, provider-aware plan from only the navigator desired-state slice. */
export function createNavigatorPlan(
  manifest: AppNavigatorManifest,
  options: CreateNavigatorPlanOptions,
): NavigatorPlan {
  const context = {
    platform: options.platform,
    expoRouterVersion: options.expoRouterVersion,
  } as const;
  const diagnostics = validateNavigatorManifest(manifest, context, options.customNavigators);
  const root = createNodePlan(manifest, manifest, '', options, options.responsiveSize ?? 'compact');
  return {
    context,
    root,
    diagnostics,
    support: resolvePlanSupport(root, diagnostics),
    capabilityIds: collectCapabilityIds(root),
    dependencies: collectDependencies(),
  };
}

/*** Resolve the honest aggregate support status from diagnostics and every planned adapter. */
function resolvePlanSupport(
  root: NavigatorNodePlan,
  diagnostics: readonly { severity: 'error' | 'warning' }[],
): NavigatorPlan['support'] {
  if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) return 'unsupported';
  const adapterSupport = collectAdapterSupport(root);
  if (adapterSupport.includes('unsupported')) return 'unsupported';
  return adapterSupport.includes('testing-only') ? 'testing-only' : 'supported';
}

/*** Traverse a recursive plan to retain every adapter support classification. */
function collectAdapterSupport(node: NavigatorNodePlan): readonly NavigatorPlan['support'][] {
  return [
    node.adapter.support,
    ...node.routes.flatMap((route) =>
      route.navigator === undefined ? [] : collectAdapterSupport(route.navigator),
    ),
  ];
}

/*** Derive stable capability identifiers directly from the resolved adapter tree. */
function collectCapabilityIds(root: NavigatorNodePlan): readonly NavigatorCapabilityId[] {
  return [...new Set(collectAdapterIds(root))].sort();
}

/*** Traverse the plan to retain every concrete adapter identifier. */
function collectAdapterIds(node: NavigatorNodePlan): readonly NavigatorCapabilityId[] {
  return [
    node.adapter.id,
    ...node.routes.flatMap((route) =>
      route.navigator === undefined ? [] : collectAdapterIds(route.navigator),
    ),
  ];
}

/*** Derive generated-app dependency requirements from resolved runtime adapter imports. */
function collectDependencies(): readonly NavigatorDependencyRequirement[] {
  const dependencies: NavigatorDependencyRequirement[] = [
    { packageName: 'expo-router', versionRange: '>=57.0.0 <58.0.0', kind: 'peerDependency' },
  ];
  return dependencies;
}

/*** Resolve a node and its descendants using one platform and responsive-size context. */
function createNodePlan(
  manifest: AppNavigatorManifest,
  node: NavigatorNode,
  pointer: string,
  options: CreateNavigatorPlanOptions,
  responsiveSize: NavigatorResponsiveSize,
): NavigatorNodePlan {
  const stack =
    node.type === 'stack'
      ? resolveEffectiveStackConfig(manifest, node, options.platform)
      : undefined;
  const tabs =
    node.type === 'tabs'
      ? resolveTabsPlan(
          resolveEffectiveTabsConfig(manifest, node, options.platform),
          options.platform,
          responsiveSize,
        )
      : undefined;
  const routes = node.routes.map((route, index) =>
    createRoutePlan(manifest, route, `${pointer}/routes/${index}`, options, responsiveSize),
  );

  return {
    type: node.type,
    pointer,
    adapter: createAdapter(
      node,
      stack,
      tabs,
      options.platform,
      parseExpoRouterMajor(options.expoRouterVersion),
      options.customNavigators,
    ),
    ...(node.initialRouteName === undefined ? {} : { initialRouteName: node.initialRouteName }),
    routes,
    ...createNodeDetails(node, stack, tabs),
  };
}

/*** Preserve portable route metadata and recursively plan a nested navigator when present. */
function createRoutePlan(
  manifest: AppNavigatorManifest,
  route: NavigatorNode['routes'][number],
  pointer: string,
  options: CreateNavigatorPlanOptions,
  responsiveSize: NavigatorResponsiveSize,
): NavigatorRoutePlan {
  return {
    name: route.name,
    ...(route.path === undefined ? {} : { path: route.path }),
    ...(route.label === undefined ? {} : { label: route.label }),
    ...(route.icon === undefined ? {} : { icon: route.icon }),
    ...(route.showInPrimaryNavigation === undefined
      ? {}
      : { showInPrimaryNavigation: route.showInPrimaryNavigation }),
    guards: route.guards ?? [],
    ...(route.screenId === undefined ? {} : { screenId: route.screenId }),
    ...(route.stackOptions === undefined ? {} : { stackOptions: route.stackOptions }),
    ...(route.navigator === undefined
      ? {}
      : {
          navigator: createNodePlan(
            manifest,
            route.navigator,
            `${pointer}/navigator`,
            options,
            responsiveSize,
          ),
        }),
  };
}

/*** Dispatch adapter planning to the feature that owns the authored navigator type. */
function createAdapter(
  node: NavigatorNode,
  stack: StackImplementationConfig | undefined,
  tabs: TabsNavigatorPlan | undefined,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
  customNavigators: CustomNavigatorRegistry | undefined,
): NavigatorAdapterPlan {
  switch (node.type) {
    case 'slot':
      return createSlotAdapter();
    case 'stack':
      return createStackAdapter(stack, platform, routerMajor);
    case 'drawer':
      return createDrawerAdapter();
    case 'tabs':
      if (tabs === undefined) throw new Error('Tabs planning did not resolve an adapter.');
      return createTabsAdapter(tabs, platform, routerMajor);
    case 'split-view':
      return resolveSplitViewAdapterPlan(platform, routerMajor);
    case 'custom':
      return resolveCustomNavigatorAdapterPlan(node, platform, routerMajor, customNavigators);
  }
}

/*** Project each navigator's resolved configuration onto the shared recursive plan. */
function createNodeDetails(
  node: NavigatorNode,
  stack: StackImplementationConfig | undefined,
  tabs: TabsNavigatorPlan | undefined,
): NodeDetails {
  switch (node.type) {
    case 'stack':
      return {
        stack: {
          implementation: stack?.implementation ?? 'native',
          ...(stack?.options === undefined ? {} : { options: stack.options }),
        },
      };
    case 'drawer':
      return { drawer: { ...(node.options === undefined ? {} : { options: node.options }) } };
    case 'tabs':
      return tabs === undefined ? {} : { tabs };
    case 'split-view':
      return {
        splitView: {
          columns: {
            primary: node.columns.primary.screenId,
            ...(node.columns.supplementary === undefined
              ? {}
              : { supplementary: node.columns.supplementary.screenId }),
          },
          ...(node.inspector === undefined ? {} : { inspector: node.inspector.screenId }),
          ...(node.topColumnForCollapsing === undefined
            ? {}
            : { topColumnForCollapsing: node.topColumnForCollapsing }),
        },
      };
    case 'custom':
      return {
        custom: {
          navigatorId: node.navigatorId,
          ...(node.config === undefined ? {} : { config: node.config }),
        },
      };
    case 'slot':
      return {};
  }
}

type NodeDetails = Partial<
  Pick<NavigatorNodePlan, 'custom' | 'drawer' | 'splitView' | 'stack' | 'tabs'>
>;
