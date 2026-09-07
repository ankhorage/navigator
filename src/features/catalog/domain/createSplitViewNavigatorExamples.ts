import type { NavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createExampleScreenRoute } from './createExampleScreenRoute';

/*** Define supported iOS Split View examples and explicit invalid nesting cases. */
export function createSplitViewNavigatorExamples(): readonly NavigatorExampleDefinition[] {
  return [
    definition(
      'split-view-two-column',
      'Split View — two column',
      'Testing-only iOS two-column Split View with explicit non-iOS diagnostics.',
      splitView(false),
    ),
    definition(
      'split-view-three-column',
      'Split View — three column',
      'Testing-only iOS three-column Split View with an inspector.',
      splitView(true),
    ),
    definition(
      'tabs-split-view',
      'Tabs → Split View',
      'Explicit unsupported case: Split View cannot be nested beneath Tabs.',
      {
        type: 'tabs',
        implementation: 'javascript',
        presentation: 'bottom',
        routes: [
          createExampleScreenRoute('index', 'Overview'),
          { name: 'split', label: 'Split', navigator: splitView(false) },
        ],
      },
    ),
    definition(
      'drawer-split-view',
      'Drawer → Split View',
      'Explicit unsupported case: Split View cannot be nested beneath Drawer.',
      {
        type: 'drawer',
        routes: [
          createExampleScreenRoute('index', 'Overview'),
          { name: 'split', label: 'Split', navigator: splitView(false) },
        ],
      },
    ),
  ];
}

/*** Create one Split View example definition with all referenced column bindings. */
function definition(
  id: NavigatorExampleDefinition['id'],
  title: string,
  description: string,
  manifest: NavigatorNode,
): NavigatorExampleDefinition {
  return {
    id,
    title,
    description,
    manifest,
    bindings: {
      screens: {
        example: { module: '@/screens/example-screen', exportName: 'ExampleScreen' },
        primary: { module: '@/screens/primary-column-screen', exportName: 'PrimaryColumnScreen' },
        supplementary: {
          module: '@/screens/supplementary-column-screen',
          exportName: 'SupplementaryColumnScreen',
        },
        inspector: { module: '@/screens/inspector-screen', exportName: 'InspectorScreen' },
      },
      guards: {},
    },
  };
}

/*** Define one two- or three-column Split View manifest. */
function splitView(threeColumn: boolean): NavigatorNode {
  return {
    type: 'split-view',
    columns: {
      primary: { screenId: 'primary' },
      ...(threeColumn ? { supplementary: { screenId: 'supplementary' } } : {}),
    },
    ...(threeColumn ? { inspector: { screenId: 'inspector' } } : {}),
    routes: [
      createExampleScreenRoute('index', 'Overview'),
      createExampleScreenRoute('details', 'Details'),
    ],
  };
}
