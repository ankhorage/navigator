import type { NavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createExampleScreenRoute } from './createExampleScreenRoute';

/*** Define standalone Drawer compositions without introducing product-flow semantics. */
export function createDrawerNavigatorExamples(): readonly NavigatorExampleDefinition[] {
  return [...createDrawerRootExamples(), ...createStackRootExamples()];
}

/*** Define compositions rooted directly in Drawer. */
function createDrawerRootExamples(): readonly NavigatorExampleDefinition[] {
  return [
    definition('drawer', 'Drawer', 'Root Drawer with direct routes and no forced Stack.', drawer()),
    definition(
      'drawer-stack',
      'Drawer → Stack',
      'Drawer whose primary branch owns Stack navigation.',
      drawer(stackRoute('(overview)', 'Overview')),
    ),
    definition(
      'drawer-tabs',
      'Drawer → Tabs',
      'Drawer with a JavaScript bottom Tabs branch.',
      drawer(nested('workspace', 'Workspace', tabs('bottom'))),
    ),
    definition(
      'drawer-tabs-stack',
      'Drawer → Tabs → Stack',
      'Drawer with bottom Tabs whose primary branch owns a Stack.',
      drawer(nested('workspace', 'Workspace', tabsWithStack('bottom'))),
    ),
    definition(
      'drawer-tabs-top',
      'Drawer → Top Tabs',
      'Drawer with a JavaScript top Tabs branch.',
      drawer(nested('workspace', 'Workspace', tabs('top'))),
    ),
  ];
}

/*** Define neutral Stack sequences that lead into Drawer compositions. */
function createStackRootExamples(): readonly NavigatorExampleDefinition[] {
  return [
    definition(
      'stack-drawer',
      'Stack → Drawer',
      'Neutral entry Stack followed by a Drawer.',
      stack(drawer()),
    ),
    definition(
      'stack-drawer-stack',
      'Stack → Drawer → Stack',
      'Neutral entry Stack followed by a Drawer with a Stack branch.',
      stack(drawer(stackRoute('(overview)', 'Overview'))),
    ),
    definition(
      'stack-drawer-tabs',
      'Stack → Drawer → Tabs',
      'Neutral entry Stack followed by Drawer and bottom Tabs.',
      stack(drawer(nested('sections', 'Sections', tabs('bottom')))),
    ),
    definition(
      'stack-drawer-tabs-stack',
      'Stack → Drawer → Tabs → Stack',
      'Neutral entry Stack followed by Drawer, bottom Tabs, and a branch Stack.',
      stack(drawer(nested('sections', 'Sections', tabsWithStack('bottom')))),
    ),
  ];
}

/*** Create one example definition with the common screen binding. */
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

/*** Define a Drawer with direct content and an optional leading nested branch. */
function drawer(branch?: NavigatorNode['routes'][number]): NavigatorNode {
  return {
    type: 'drawer',
    routes: [
      ...(branch === undefined ? [createExampleScreenRoute('index', 'Overview')] : [branch]),
      createExampleScreenRoute('settings', 'Settings'),
    ],
  };
}

/*** Define a neutral Stack sequence that leads into another navigator. */
function stack(navigator: NavigatorNode): NavigatorNode {
  return {
    type: 'stack',
    implementation: 'native',
    routes: [
      createExampleScreenRoute('index', 'Entry'),
      { name: 'workspace', label: 'Workspace', navigator },
    ],
  };
}

/*** Define JavaScript Tabs with direct screen routes. */
function tabs(presentation: 'bottom' | 'top'): NavigatorNode {
  return {
    type: 'tabs',
    implementation: 'javascript',
    presentation,
    routes: [
      createExampleScreenRoute('index', 'Overview'),
      createExampleScreenRoute('activity', 'Activity'),
    ],
  };
}

/*** Define JavaScript Tabs whose primary branch owns a Stack. */
function tabsWithStack(presentation: 'bottom' | 'top'): NavigatorNode {
  return {
    type: 'tabs',
    implementation: 'javascript',
    presentation,
    routes: [
      stackRoute('(overview)', 'Overview'),
      createExampleScreenRoute('activity', 'Activity'),
    ],
  };
}

/*** Create one nested Stack route. */
function stackRoute(name: string, label: string): NavigatorNode['routes'][number] {
  return {
    name,
    label,
    navigator: {
      type: 'stack',
      implementation: 'native',
      routes: [
        createExampleScreenRoute('index', 'Overview'),
        createExampleScreenRoute('details', 'Details'),
      ],
    },
  };
}

/*** Create one ordinary nested navigator route. */
function nested(
  name: string,
  label: string,
  navigator: NavigatorNode,
): NavigatorNode['routes'][number] {
  return { name, label, navigator };
}
