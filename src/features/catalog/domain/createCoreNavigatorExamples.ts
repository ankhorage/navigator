import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createExampleScreenRoute } from './createExampleScreenRoute';

/*** Define the standalone Slot and Stack examples. */
export function createCoreNavigatorExamples(): readonly NavigatorExampleDefinition[] {
  return [
    {
      id: 'slot',
      title: 'Slot',
      description: 'Direct file-based routing without navigator-owned state.',
      manifest: {
        type: 'slot',
        preset: 'slot',
        routes: [
          createExampleScreenRoute('index', 'Overview'),
          createExampleScreenRoute('details', 'Details'),
        ],
      },
      bindings: sharedBindings(),
    },
    {
      id: 'stack',
      title: 'Stack',
      description: 'Native Stack routes with a protected destination and modal presentation.',
      manifest: {
        type: 'stack',
        preset: 'stack',
        implementation: 'native',
        initialRouteName: 'index',
        routes: [
          createExampleScreenRoute('index', 'Overview'),
          createExampleScreenRoute('details', 'Details', { guarded: true }),
          createExampleScreenRoute('modal', 'Modal', { presentation: 'modal' }),
        ],
      },
      bindings: sharedBindings(true),
    },
  ];
}

/*** Create narrow bindings shared by ordinary example screens and optional guards. */
function sharedBindings(guarded = false): NavigatorExampleDefinition['bindings'] {
  return {
    screens: { example: { module: '@/screens/example-screen', exportName: 'ExampleScreen' } },
    guards: guarded
      ? {
          'example-enabled': {
            module: '@/guards/is-example-enabled',
            exportName: 'isExampleEnabled',
          },
        }
      : {},
  };
}
