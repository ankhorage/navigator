import {
  CUSTOM_TABS_PRESENTATIONS,
  FIXED_CUSTOM_TABS_PRESENTATIONS,
  NAVIGATOR_PRESETS,
  NAVIGATOR_TYPES,
} from '@ankhorage/contracts/navigator';

export const NAVIGATOR_PACKAGE_METADATA = {
  packageName: '@ankhorage/navigator',
  manifestProperty: 'navigator',
  contractSubpath: '@ankhorage/contracts/navigator',
  navigatorTypes: NAVIGATOR_TYPES,
  presets: NAVIGATOR_PRESETS,
  precedence: ['platform override', 'node configuration', 'manifest default', 'stable default'],
  coreAdapters: {
    slot: { support: 'supported', stability: 'stable', module: 'expo-router' },
    nativeStack: { support: 'supported', stability: 'stable', module: 'expo-router' },
    javascriptStack: {
      support: 'supported',
      stability: 'stable',
      module: 'expo-router/js-stack',
      minimumExpoRouterVersion: '56.0.0',
    },
    drawer: { support: 'supported', stability: 'stable', module: 'expo-router/drawer' },
  },
  optionalAdapters: {
    tabs: {
      support: 'supported',
      native: { platforms: ['android', 'ios'], stability: 'alpha' },
      javascript: { platforms: ['android', 'ios', 'web'], stability: 'stable' },
      custom: { platforms: ['web'], stability: 'stable', presentationOwner: '@ankhorage/surface' },
    },
    experimentalStack: {
      support: 'supported',
      stability: 'alpha',
      minimumExpoRouterVersion: '56.0.0',
      platforms: ['android', 'ios'],
      webFallback: 'stack.native',
      status: 'testing-only',
      supportedOptions: ['title', 'headerShown', 'headerTransparent', 'headerBackVisible'],
      android: {
        cannotMixWith: 'stack.native',
        appConfigRequirement: 'android.predictiveBackGestureEnabled',
      },
    },
    splitView: {
      support: 'supported',
      stability: 'alpha',
      status: 'testing-only',
      minimumExpoRouterVersion: '55.0.0',
      module: 'expo-router/unstable-split-view',
      platforms: ['ios'],
      fallback: { android: 'slot', web: 'slot' },
      maximumAdditionalColumns: 2,
      inspectorMinimumIosVersion: 26,
    },
    custom: {
      support: 'registered',
      minimumExpoRouterVersion: '56.0.0',
      integration: 'expo-router-standard',
      routerOwner: 'expo-router',
      config: 'schema-validated-json',
    },
  },
  tabs: {
    implementations: ['adaptive', 'javascript', 'native', 'custom'],
    customPresentations: CUSTOM_TABS_PRESENTATIONS,
    fixedCustomPresentations: FIXED_CUSTOM_TABS_PRESENTATIONS,
    adaptiveDefault: {
      android: 'native',
      ios: 'native',
      web: 'custom',
      webResponsive: {
        compact: 'bottom',
        medium: 'rail',
        expanded: 'sidebar',
      },
    },
    expoRouter: {
      javascriptBottom: 'expo-router/js-tabs',
      javascriptTop: 'expo-router/js-top-tabs',
      custom: 'expo-router/ui',
      native: 'expo-router/unstable-native-tabs',
      nativeStability: 'alpha',
    },
  },
} as const;
