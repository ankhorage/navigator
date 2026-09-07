import type {
  AppNavigatorManifest,
  CreateNavigatorPlanOptions,
  CustomNavigatorRegistry,
  NavigatorAdapterPlan,
  NavigatorNode,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorResponsiveSize,
  NavigatorRoutePlan,
  NavigatorRuntimePlatform,
  NavigatorSupportStatus,
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
import { resolveNavigatorDependencies } from './resolveNavigatorDependencies';
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
  const support = diagnostics.some((diagnostic) => diagnostic.severity === 'error')
    ? 'unsupported'
    : resolvePlanSupport(root);
  return {
    context,
    root,
    diagnostics,
    support,
    capabilityIds: collectCapabilityIds(root),
    dependencies: resolveNavigatorDependencies(root, options.platform),
  };
}

/*** Reduce every nested adapter status to the plan's least-supported classification. */
function resolvePlanSupport(root: NavigatorNodePlan): NavigatorSupportStatus {
  const statuses = collectNodes(root).map((node) => node.adapter.support);
  if (statuses.includes('unsupported')) return 'unsupported';
  return statuses.includes('testing-only') ? 'testing-only' : 'supported';
}

/*** Report stable capability IDs for every distinct resolved node variant. */
function collectCapabilityIds(root: NavigatorNodePlan): readonly string[] {
  return [...new Set(collectNodes(root).map(resolveCapabilityId))].sort();
}

/*** Flatten one recursive plan in deterministic route order. */
function collectNodes(root: NavigatorNodePlan): readonly NavigatorNodePlan[] {
  return [
    root,
    ...root.routes.flatMap((route) =>
      route.navigator === undefined ? [] : collectNodes(route.navigator),
    ),
  ];
}

/*** Map one resolved node to its public catalog capability identifier. */
function resolveCapabilityId(node: NavigatorNodePlan): string {
  if (node.type === 'tabs' && node.tabs !== undefined) {
    if (node.tabs.implementation === 'native') return 'tabs.native';
    const presentation = node.tabs.presentation ?? 'bottom';
    if (node.tabs.implementation === 'javascript') return `tabs.javascript.${presentation}`;
    const responsive =
      node.tabs.presentations !== undefined &&
      new Set(Object.values(node.tabs.presentations)).size > 1;
    return `tabs.headless.${responsive ? 'responsive' : presentation}`;
  }
  if (node.type === 'split-view') {
    return node.splitView?.columns.supplementary === undefined
      ? 'split-view.two-column'
      : 'split-view.three-column';
  }
  if (node.type === 'custom') return 'custom.registered';
  return node.adapter.id;
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
