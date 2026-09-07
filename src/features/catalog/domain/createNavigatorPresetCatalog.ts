import type { NavigatorPreset, NavigatorPresetDescriptor } from '@ankhorage/contracts/navigator';

import { resolveNavigatorPreset } from '../../../utils/resolveNavigatorPreset';

/*** Enumerate the finite transparent preset catalog in contract order. */
export function createNavigatorPresetCatalog(): readonly NavigatorPresetDescriptor[] {
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
