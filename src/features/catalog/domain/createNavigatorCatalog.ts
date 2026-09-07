import type {
  NavigatorCapabilityDescriptor,
  NavigatorCatalog,
  NavigatorDependencyRequirement,
  NavigatorRuntimePlatform,
  NavigatorSupportStatus,
  NavigatorType,
} from '@ankhorage/contracts/navigator';

import { NAVIGATOR_ROUTER_POLICY } from '../../../utils/NAVIGATOR_ROUTER_POLICY';
import { createNavigatorPresetCatalog } from './createNavigatorPresetCatalog';

/*** Create the package-owned navigation catalog from explicit owner dependency policy. */
export function createNavigatorCatalog(policy: NavigatorCatalogDependencyPolicy): NavigatorCatalog {
  return {
    capabilities: [
      ...createCoreCapabilities(policy),
      ...createTabsCapabilities(policy),
      ...createExtensionCapabilities(policy),
    ],
    presets: createNavigatorPresetCatalog(),
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
      dependencies: [...javaScriptTopTabsDependencies(policy)],
    }),
    ...headless,
  ];
}

/*** Report the runtime requirements of Expo Router JavaScript Top Tabs. */
function javaScriptTopTabsDependencies(
  policy: NavigatorCatalogDependencyPolicy,
): readonly NavigatorDependencyRequirement[] {
  return ['expo-router', 'react-native-pager-view', 'react-native-tab-view'].map((packageName) =>
    dependency(policy, packageName),
  );
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
