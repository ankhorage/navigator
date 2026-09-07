import type { NavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createExampleScreenRoute } from './createExampleScreenRoute';

/*** Define standalone native, JavaScript, Headless, nested, and top Tabs examples. */
export function createTabsNavigatorExamples(): readonly NavigatorExampleDefinition[] {
  return [...createTabsRootExamples(), ...createStackRootExamples()];
}

/*** Define compositions rooted directly in Tabs. */
function createTabsRootExamples(): readonly NavigatorExampleDefinition[] {
  return [
    definition(
      'tabs',
      'Tabs',
      'Native Tabs on iOS and Android with explicit unsupported Web status.',
      nativeTabs(),
    ),
    definition(
      'tabs-stack',
      'Tabs → Stack',
      'Headless bottom Tabs whose primary branch owns Stack navigation.',
      headlessTabs([
        nested('(overview)', 'Overview', '/', stackRoutes()),
        createExampleScreenRoute('settings', 'Settings', { path: '/settings' }),
      ]),
    ),
    definition(
      'tabs-bottom-tabs-top',
      'Bottom Tabs → Top Tabs',
      'JavaScript bottom Tabs with a nested JavaScript top Tabs branch.',
      javascriptTabs('bottom', [
        createExampleScreenRoute('index', 'Overview'),
        nested('library', 'Library', undefined, javascriptTabs('top')),
      ]),
    ),
  ];
}

/*** Define neutral Stack sequences that lead into Tabs compositions. */
function createStackRootExamples(): readonly NavigatorExampleDefinition[] {
  return [
    definition(
      'stack-tabs',
      'Stack → Tabs',
      'A neutral entry Stack followed by JavaScript bottom Tabs.',
      stackWith('workspace', 'Workspace', javascriptTabs('bottom')),
    ),
    definition(
      'stack-tabs-stack',
      'Stack → Tabs → Stack',
      'A neutral entry Stack followed by responsive Headless Tabs and branch Stacks.',
      stackWith(
        'workspace',
        'Workspace',
        headlessTabs(
          [
            nested('(overview)', 'Overview', '/workspace', stackRoutes()),
            nested('library', 'Library', '/workspace/library', stackRoutes('index')),
          ],
          true,
        ),
      ),
    ),
    definition(
      'stack-tabs-top',
      'Stack → Top Tabs',
      'A Stack followed by JavaScript Tabs with a top presentation.',
      stackWith('workspace', 'Workspace', javascriptTabs('top')),
    ),
  ];
}

/*** Create one example definition with ordinary screen bindings. */
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
      screens: { example: { module: '@/screens/example-screen', exportName: 'ExampleScreen' } },
      guards: {},
    },
  };
}

/*** Define the Native Tabs example with portable named icons. */
function nativeTabs(): NavigatorNode {
  return {
    type: 'tabs',
    implementation: 'native',
    initialRouteName: 'index',
    routes: [
      createExampleScreenRoute('index', 'Overview', {
        icon: { provider: 'Ionicons', name: 'home' },
      }),
      createExampleScreenRoute('settings', 'Settings', {
        icon: { provider: 'Ionicons', name: 'settings' },
      }),
    ],
  };
}

/*** Define JavaScript Tabs with direct routes unless explicit branches are supplied. */
function javascriptTabs(
  presentation: 'bottom' | 'top',
  routes: NavigatorNode['routes'] = [
    createExampleScreenRoute('index', 'Overview'),
    createExampleScreenRoute('settings', 'Settings'),
  ],
): NavigatorNode {
  return { type: 'tabs', implementation: 'javascript', presentation, routes };
}

/*** Define Headless Tabs with fixed or responsive Surface presentation. */
function headlessTabs(routes: NavigatorNode['routes'], responsive = false): NavigatorNode {
  return responsive
    ? {
        type: 'tabs',
        implementation: 'headless',
        presentation: 'responsive',
        responsive: { compact: 'bottom', medium: 'rail', expanded: 'sidebar' },
        routes,
      }
    : { type: 'tabs', implementation: 'headless', presentation: 'bottom', routes };
}

/*** Define a native Stack with two neutral direct routes. */
function stackRoutes(indexName = 'index'): NavigatorNode {
  return {
    type: 'stack',
    implementation: 'native',
    routes: [
      createExampleScreenRoute(indexName, 'Overview'),
      createExampleScreenRoute('details', 'Details'),
    ],
  };
}

/*** Wrap one navigator behind a neutral root Stack sequence. */
function stackWith(name: string, label: string, navigator: NavigatorNode): NavigatorNode {
  return {
    type: 'stack',
    implementation: 'native',
    routes: [createExampleScreenRoute('index', 'Entry'), { name, label, navigator }],
  };
}

/*** Create one nested navigator route with an optional explicit Headless Tabs path. */
function nested(
  name: string,
  label: string,
  path: string | undefined,
  navigator: NavigatorNode,
): NavigatorNode['routes'][number] {
  return { name, label, ...(path === undefined ? {} : { path }), navigator };
}
