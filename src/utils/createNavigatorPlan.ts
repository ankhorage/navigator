import type {
  AppNavigatorManifest,
  NavigatorNode,
  StackImplementationConfig,
} from '@ankhorage/contracts/navigator';

import { resolveCustomNavigatorAdapterPlan } from '../features/custom/application/resolveCustomNavigatorAdapterPlan';
import type { CustomNavigatorRegistry } from '../features/custom/domain/CustomNavigatorRegistry';
import { createDrawerAdapter } from '../features/drawer/application/createDrawerAdapter';
import { createSlotAdapter } from '../features/slot/application/createSlotAdapter';
import { resolveSplitViewAdapterPlan } from '../features/split-view/application/resolveSplitViewAdapterPlan';
import { createStackAdapter } from '../features/stack/application/createStackAdapter';
import { resolveEffectiveStackConfig } from '../features/stack/domain/resolveEffectiveStackConfig';
import { createTabsAdapter } from '../features/tabs/application/createTabsAdapter';
import { resolveTabsPlan } from '../features/tabs/application/resolveTabsPlan';
import { resolveEffectiveTabsConfig } from '../features/tabs/domain/resolveEffectiveTabsConfig';
import type { TabsNavigatorPlan } from '../features/tabs/domain/TabsNavigatorPlan';
import type { CreateNavigatorPlanOptions } from './CreateNavigatorPlanOptions';
import type { NavigatorAdapterPlan } from './NavigatorAdapterPlan';
import type { NavigatorNodePlan } from './NavigatorNodePlan';
import type { NavigatorPlan } from './NavigatorPlan';
import type { NavigatorResponsiveSize } from './NavigatorResponsiveSize';
import type { NavigatorRoutePlan } from './NavigatorRoutePlan';
import type { NavigatorRuntimePlatform } from './NavigatorRuntimePlatform';
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
    supported:
      diagnostics.every((diagnostic) => diagnostic.severity !== 'error') &&
      root.adapter.support === 'supported',
    flows: {
      onboarding: manifest.flows?.onboarding ?? false,
      authentication: manifest.flows?.authentication ?? false,
    },
  };
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
