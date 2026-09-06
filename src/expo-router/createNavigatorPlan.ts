import type {
  AppNavigatorManifest,
  NavigatorNode,
  StackImplementationConfig,
  TabsImplementationConfig,
} from '@ankhorage/contracts/navigator';

import type { CustomNavigatorRegistry } from '../custom/CustomNavigatorRegistry';
import type {
  NavigatorAdapterPlan,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorResponsiveSize,
  NavigatorRoutePlan,
  NavigatorRuntimePlatform,
  TabsNavigatorPlan,
} from '../definitions/NavigatorPlan';
import { validateNavigatorManifest } from '../validation/validateNavigatorManifest';
import { resolveCustomNavigatorAdapterPlan } from './resolveCustomNavigatorPlan';
import {
  parseExpoRouterMajor,
  resolveEffectiveStackConfig,
  resolveEffectiveTabsConfig,
} from './resolveNavigatorConfig';
import { resolveSplitViewAdapterPlan } from './resolveSplitViewNavigatorPlan';
import { resolveTabsNavigatorPlan } from './resolveTabsNavigatorPlan';

export interface CreateNavigatorPlanOptions {
  platform: NavigatorRuntimePlatform;
  expoRouterVersion: string;
  responsiveSize?: NavigatorResponsiveSize;
  customNavigators?: CustomNavigatorRegistry;
}

/*** Resolve a Stack implementation to its version- and platform-aware Expo Router adapter. */
function createStackAdapter(
  stack: StackImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const implementation = stack?.implementation ?? 'native';
  if (implementation === 'javascript') {
    return {
      id: 'stack.javascript',
      module: 'expo-router/js-stack',
      exportName: 'Stack',
      support: routerMajor !== undefined && routerMajor >= 56 ? 'supported' : 'unavailable',
      stability: 'stable',
      limitations: ['Requires Expo Router 56.0.0 or newer.'],
    };
  }
  if (implementation === 'experimental') {
    return {
      id: 'stack.experimental',
      module: 'expo-router',
      exportName: 'ExperimentalStack',
      support: routerMajor !== undefined && routerMajor >= 56 ? 'supported' : 'unavailable',
      stability: 'alpha',
      limitations:
        platform === 'web'
          ? ['Testing-only API; Expo Router falls back to the standard Stack on web.']
          : [
              'Testing-only API; supports only title and header visibility options.',
              ...(platform === 'android'
                ? [
                    'Cannot coexist with the standard native Stack on Android.',
                    'Requires android.predictiveBackGestureEnabled in app config.',
                  ]
                : []),
            ],
    };
  }
  return {
    id: 'stack.native',
    module: 'expo-router',
    exportName: 'Stack',
    support: 'supported',
    stability: 'stable',
    limitations: [],
  };
}

function createTabsAdapter(
  tabs: TabsNavigatorPlan,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const nativeUnavailable =
    tabs.implementation === 'native' &&
    (platform === 'web' || routerMajor === undefined || routerMajor < 54);
  const customUnavailable = tabs.implementation === 'custom' && platform !== 'web';
  return {
    id: `tabs.${tabs.implementation}`,
    module: tabs.module,
    exportName: tabs.exportName,
    support: nativeUnavailable || customUnavailable ? 'unavailable' : 'supported',
    stability: tabs.stability,
    limitations:
      tabs.implementation === 'native'
        ? ['Alpha API; unavailable on web and requires Expo Router 54.0.0 or newer.']
        : tabs.implementation === 'custom'
          ? ['Web-only Surface presentation over Expo Router headless tabs.']
          : [],
  };
}

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
      return {
        id: 'slot',
        module: 'expo-router',
        exportName: 'Slot',
        support: 'supported',
        stability: 'stable',
        limitations: [],
      };
    case 'stack':
      return createStackAdapter(stack, platform, routerMajor);
    case 'drawer':
      return {
        id: 'drawer',
        module: 'expo-router/drawer',
        exportName: 'Drawer',
        support: 'supported',
        stability: 'stable',
        limitations: [],
      };
    case 'tabs':
      if (tabs === undefined) throw new Error('Tabs planning did not resolve an adapter.');
      return createTabsAdapter(tabs, platform, routerMajor);
    case 'split-view':
      return resolveSplitViewAdapterPlan(platform, routerMajor);
    case 'custom':
      return resolveCustomNavigatorAdapterPlan(node, platform, routerMajor, customNavigators);
  }
}

function resolveTabsPlan(
  config: TabsImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  responsiveSize: NavigatorResponsiveSize,
): TabsNavigatorPlan {
  if (config?.implementation === 'native' && platform === 'web') {
    return {
      implementation: 'native',
      module: 'expo-router/unstable-native-tabs',
      exportName: 'NativeTabs',
      stability: 'alpha',
    };
  }
  return resolveTabsNavigatorPlan(config, platform, responsiveSize);
}

type NodeDetails = Partial<
  Pick<NavigatorNodePlan, 'custom' | 'drawer' | 'splitView' | 'stack' | 'tabs'>
>;

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
