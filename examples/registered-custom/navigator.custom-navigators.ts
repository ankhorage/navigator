import { defineCustomNavigatorRegistry } from '@ankhorage/navigator';

export default defineCustomNavigatorRegistry([
  {
    id: 'example-tabs',
    platforms: ['android', 'ios', 'web'],
    stability: 'alpha',
    integration: 'expo-router-standard',
    router: 'tab',
    module: '@/navigators/registered-custom-navigator',
    exportName: 'RegisteredCustomNavigator',
    validateConfig: (config) =>
      config?.backBehavior === 'history'
        ? []
        : [{ code: 'invalid-back-behavior', path: '/backBehavior', message: 'Expected history.' }],
  },
]);
