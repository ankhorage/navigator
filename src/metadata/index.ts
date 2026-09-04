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
      nativeStability: 'unstable',
    },
  },
} as const;
