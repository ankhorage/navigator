import type { CustomNavigatorRegistration } from '@ankhorage/contracts/navigator';

import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createExampleScreenRoute } from './createExampleScreenRoute';

/*** Define the registered custom navigator example and its narrow integration record. */
export function createCustomNavigatorExamples(): readonly NavigatorExampleDefinition[] {
  return [
    {
      id: 'registered-custom',
      title: 'Registered custom navigator',
      description: 'Registered Expo Router standard tab integration with validated JSON config.',
      manifest: {
        type: 'custom',
        navigatorId: 'example-tabs',
        config: { backBehavior: 'history' },
        routes: [
          createExampleScreenRoute('index', 'Overview'),
          createExampleScreenRoute('settings', 'Settings'),
        ],
      },
      bindings: {
        screens: { example: { module: '@/screens/example-screen', exportName: 'ExampleScreen' } },
        guards: {},
      },
      customNavigatorRegistrations: [EXAMPLE_TABS],
    },
  ];
}

const EXAMPLE_TABS: CustomNavigatorRegistration = {
  id: 'example-tabs',
  platforms: ['android', 'ios', 'web'],
  stability: 'alpha',
  integration: 'expo-router-standard',
  router: 'tab',
  module: '@/navigators/registered-custom-navigator',
  exportName: 'RegisteredCustomNavigator',
  validateConfig(config) {
    return config?.backBehavior === 'history'
      ? []
      : [
          {
            code: 'invalid-back-behavior',
            path: '/backBehavior',
            message: 'The example requires router-owned history behavior.',
          },
        ];
  },
};
