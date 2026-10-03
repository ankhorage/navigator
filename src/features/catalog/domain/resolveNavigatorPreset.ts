import type { NavigatorPreset, NavigatorType } from '@ankhorage/contracts/navigator';

/*** Resolve a canonical navigator preset into its ordered topology layers. */
export function resolveNavigatorPreset(
  preset: NavigatorPreset | undefined,
  fallbackType: NavigatorType,
): readonly NavigatorType[] {
  switch (preset) {
    case undefined:
      return [fallbackType];
    case 'slot':
      return ['slot'];
    case 'stack':
      return ['stack'];
    case 'tabs':
      return ['tabs'];
    case 'tabs-stack':
      return ['tabs', 'stack'];
    case 'drawer':
      return ['drawer'];
    case 'drawer-stack':
      return ['drawer', 'stack'];
    case 'drawer-tabs':
      return ['drawer', 'tabs'];
    case 'drawer-tabs-stack':
      return ['drawer', 'tabs', 'stack'];
    case 'stack-tabs':
      return ['stack', 'tabs'];
    case 'stack-tabs-stack':
      return ['stack', 'tabs', 'stack'];
    case 'stack-drawer':
      return ['stack', 'drawer'];
    case 'stack-drawer-stack':
      return ['stack', 'drawer', 'stack'];
    case 'stack-drawer-tabs':
      return ['stack', 'drawer', 'tabs'];
    case 'stack-drawer-tabs-stack':
      return ['stack', 'drawer', 'tabs', 'stack'];
    case 'split-view':
      return ['split-view'];
    case 'custom':
      return ['custom'];
  }
}
