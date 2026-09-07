import type {
  NavigatorCapabilityDescriptor,
  NavigatorCatalog,
  NavigatorDependencyRequirement,
  NavigatorPreset,
  NavigatorPresetDescriptor,
  NavigatorRuntimePlatform,
  NavigatorSupportStatus,
  NavigatorType,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';
import { resolveNavigatorPreset } from '../../../utils/resolveNavigatorPreset';

/*** Create the package-owned navigation catalog from explicit owner dependency policy. */
export function createNavigatorCatalog(policy: NavigatorCatalogDependencyPolicy): NavigatorCatalog {
  return {
    capabilities: [
      ...createCoreCapabilities(policy),
      ...createTabsCapabilities(policy),
      ...createExtensionCapabilities(policy),
    ],
    presets: createPresets(),
  } satisfies NavigatorCatalog;
}

/*** Describe Slot, Stack, and root Drawer capabilities. */
function createCoreCapabilities(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorCapabilityDescriptor[] {
  return [
    capability(policy, 'slot', 'slot'),
    capability(policy, 'stack.native', 'stack', {
      implementation: 'native',
      presentation: 'card',
    }),
    capability(policy, 'stack.javascript', 'stack', {
      implementation: 'javascript',
      presentation: 'card',
      requirements: [requiresRouter(NAVIGATOR_ROUTER_POLICY.javaScriptStackMinimumMajor)],
    }),
    capability(policy, 'stack.experimental', 'stack', {
      implementation: 'experimental',
      stability: 'alpha',
      targetSupport: { android: 'testing-only', ios: 'testing-only', web: 'unsupported' },
      requirements: [
        requiresRouter(NAVIGATOR_ROUTER_POLICY.experimentalStackMinimumMajor),
        requires(
          'android-predictive-back',
          'Android requires android.predictiveBackGestureEnabled in app config.',
        ),
      ],
      incompatibilities: ['stack.native'],
      limitations: ['Testing-only native API with a restricted header-option surface.'],
    }),
    capability(policy, 'drawer', 'drawer', {
      dependencies: [
        'expo-router',
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-worklets',
      ]
        .sort()
        .map((packageName) => dependency(policy, packageName)),
    }),
  ];
}

/*** Describe native, JavaScript, and Headless Tabs variants. */
function createTabsCapabilities(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorCapabilityDescriptor[] {
  const headless = (['bottom', 'top', 'rail', 'sidebar', 'responsive', 'custom'] as const).map(
    (presentation) =>
      capability(policy, `tabs.headless.${presentation}`, 'tabs', {
        implementation: 'headless',
        presentation,
        dependencies: [...headlessTabsDependencies(policy)],
        requirements:
          presentation === 'custom'
            ? [requires('registered-presentation', 'Requires a registered presentation binding.')]
            : [],
        limitations: ['Visual chrome is Surface-owned over one Expo Router headless topology.'],
      }),
  );
  return [
    capability(policy, 'tabs.native', 'tabs', {
      implementation: 'native',
      stability: 'alpha',
      targetSupport: { android: 'supported', ios: 'supported', web: 'unsupported' },
      dependencies: [...nativeTabsDependencies(policy)],
      requirements: [requiresRouter(NAVIGATOR_ROUTER_POLICY.nativeTabsMinimumMajor)],
      limitations: ['Alpha Expo Router API; Android supports at most five visible routes.'],
    }),
    capability(policy, 'tabs.javascript.bottom', 'tabs', {
      implementation: 'javascript',
      presentation: 'bottom',
    }),
    capability(policy, 'tabs.javascript.top', 'tabs', {
      implementation: 'javascript',
      presentation: 'top',
    }),
    ...headless,
  ];
}

/*** Describe testing-only Split View and registered extension capability metadata. */
function createExtensionCapabilities(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorCapabilityDescriptor[] {
  const splitOptions = {
    stability: 'alpha',
    targetSupport: { android: 'unsupported', ios: 'testing-only', web: 'unsupported' },
    requirements: [requiresRouter(NAVIGATOR_ROUTER_POLICY.splitViewMinimumMajor)],
    limitations: [
      'Testing-only iOS API; the Android and Web Slot fallback is not a split-pane UI.',
    ],
  } as const;
  return [
    capability(policy, 'split-view.two-column', 'split-view', {
      presentation: 'two-column',
      ...splitOptions,
    }),
    capability(policy, 'split-view.three-column', 'split-view', {
      presentation: 'three-column',
      ...splitOptions,
    }),
    capability(policy, 'custom.registered', 'custom', {
      requirements: [
        requires('registered-navigator', 'Requires an immutable registered custom navigator.'),
        requiresRouter(NAVIGATOR_ROUTER_POLICY.customNavigatorMinimumMajor),
      ],
      limitations: ['The registration owns platform support and schema-validates its JSON config.'],
    }),
  ];
}

/*** Enumerate the finite transparent preset catalog in contract order. */
function createPresets(): readonly NavigatorPresetDescriptor[] {
  return (
    [
      'slot',
      'stack',
      'tabs',
      'tabs-stack',
      'stack-tabs',
      'stack-tabs-stack',
      'drawer',
      'drawer-stack',
      'stack-drawer',
      'stack-drawer-stack',
      'drawer-tabs',
      'drawer-tabs-stack',
      'stack-drawer-tabs',
      'stack-drawer-tabs-stack',
      'split-view',
      'custom',
    ] as const satisfies readonly NavigatorPreset[]
  ).map(createPreset);
}

interface NavigatorCatalogDependencyPolicy {
  packageName: string;
  version: string;
  peerDependencies: Readonly<Record<string, string>>;
}

/*** Build one capability descriptor with deterministic targets and owner-derived dependencies. */
function capability(
  policy: NavigatorCatalogDependencyPolicy,
  id: string,
  topology: NavigatorType,
  options: CapabilityOptions = {},
): NavigatorCapabilityDescriptor {
  return {
    id,
    topology,
    ...(options.implementation === undefined ? {} : { implementation: options.implementation }),
    ...(options.presentation === undefined ? {} : { presentation: options.presentation }),
    stability: options.stability ?? 'stable',
    targets: (['android', 'ios', 'web'] as const).map((platform) => ({
      platform,
      support: resolveTargetSupport(options.targetSupport, platform),
      verification: [
        { kind: 'structural', status: 'verified' },
        { kind: 'generation', status: 'verified' },
        { kind: 'install', status: 'unverified' },
        { kind: 'export', status: 'unverified' },
        { kind: platform === 'web' ? 'browser' : 'simulator', status: 'unverified' },
        ...(platform === 'web' ? [] : ([{ kind: 'device', status: 'unverified' }] as const)),
      ],
    })),
    dependencies: options.dependencies ?? [dependency(policy, 'expo-router')],
    requirements: options.requirements ?? [],
    incompatibilities: options.incompatibilities ?? [],
    limitations: options.limitations ?? [],
  };
}

/*** Resolve platform status without indexing consumer-provided object keys. */
function resolveTargetSupport(
  support: CapabilityOptions['targetSupport'],
  platform: NavigatorRuntimePlatform,
): NavigatorSupportStatus {
  if (support === undefined) return 'supported';
  switch (platform) {
    case 'android':
      return support.android;
    case 'ios':
      return support.ios;
    case 'web':
      return support.web;
  }
}

interface CapabilityOptions {
  implementation?: NavigatorCapabilityDescriptor['implementation'];
  presentation?: NavigatorCapabilityDescriptor['presentation'];
  stability?: NavigatorCapabilityDescriptor['stability'];
  targetSupport?: Readonly<Record<NavigatorRuntimePlatform, NavigatorSupportStatus>>;
  dependencies?: readonly NavigatorDependencyRequirement[];
  requirements?: NavigatorCapabilityDescriptor['requirements'];
  incompatibilities?: NavigatorCapabilityDescriptor['incompatibilities'];
  limitations?: NavigatorCapabilityDescriptor['limitations'];
}

/*** Create one capability requirement record. */
function requires(id: string, description: string): { id: string; description: string } {
  return { id, description };
}

/*** Describe one Expo Router major-version requirement from owner policy. */
function requiresRouter(major: number): { id: string; description: string } {
  return requires(`expo-router-${major}`, `Requires Expo Router ${major}.0.0 or newer.`);
}

/*** Resolve a consumer dependency from package-owned peer or package-version metadata. */
function dependency(
  policy: NavigatorCatalogDependencyPolicy,
  packageName: string,
): NavigatorDependencyRequirement {
  const versionRange =
    packageName === policy.packageName
      ? `^${policy.version}`
      : Reflect.get(policy.peerDependencies, packageName);
  if (typeof versionRange !== 'string') {
    throw new Error(`Navigator has no owner version policy for ${JSON.stringify(packageName)}.`);
  }
  return { packageName, versionRange, kind: 'dependency' };
}

/*** Report the runtime requirements of Navigator-owned Headless Tabs. */
function headlessTabsDependencies(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorDependencyRequirement[] {
  return [
    policy.packageName,
    '@ankhorage/surface',
    'expo-router',
    'react',
    'react-dom',
    'react-native',
    'react-native-safe-area-context',
    'react-native-web',
  ].map((packageName) => dependency(policy, packageName));
}

/*** Report the conservative runtime requirements of Native Tabs icon generation. */
function nativeTabsDependencies(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorDependencyRequirement[] {
  return [
    'expo-router',
    policy.packageName,
    '@react-native-vector-icons/fontawesome',
    '@react-native-vector-icons/fontawesome5',
    '@react-native-vector-icons/fontawesome6',
    '@react-native-vector-icons/ionicons',
    '@react-native-vector-icons/material-design-icons',
  ]
    .sort()
    .map((packageName) => dependency(policy, packageName));
}

/*** Build one transparent structural preset descriptor in contract order. */
function createPreset(id: NavigatorPreset): NavigatorPresetDescriptor {
  return {
    id,
    description: describePreset(id),
    topology: resolveNavigatorPreset(id, 'slot'),
  };
}

/*** Describe one structural preset without adding application-flow semantics. */
function describePreset(id: NavigatorPreset): string {
  switch (id) {
    case 'slot':
      return 'Slot root with direct routed content.';
    case 'stack':
      return 'Stack root with direct routes.';
    case 'tabs':
      return 'Tabs root with direct routes.';
    case 'tabs-stack':
      return 'Tabs whose branches own Stack navigation.';
    case 'stack-tabs':
      return 'Stack followed by Tabs.';
    case 'stack-tabs-stack':
      return 'Stack followed by Tabs whose branches own Stacks; often useful for a neutral pre-main sequence.';
    case 'drawer':
      return 'Drawer root with direct routes and no forced Stack.';
    case 'drawer-stack':
      return 'Drawer whose branches own Stack navigation.';
    case 'stack-drawer':
      return 'Stack followed by a Drawer.';
    case 'stack-drawer-stack':
      return 'Stack followed by a Drawer whose branches own Stacks.';
    case 'drawer-tabs':
      return 'Drawer followed by Tabs.';
    case 'drawer-tabs-stack':
      return 'Drawer followed by Tabs whose branches own Stacks.';
    case 'stack-drawer-tabs':
      return 'Stack followed by Drawer and Tabs.';
    case 'stack-drawer-tabs-stack':
      return 'Stack followed by Drawer, Tabs, and branch Stacks.';
    case 'split-view':
      return 'Split View root with routed main content.';
    case 'custom':
      return 'Registered custom navigator root.';
  }
}
