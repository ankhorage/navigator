import type { NavigatorPreset, NavigatorType } from '@ankhorage/contracts/navigator';

/*** Resolve a canonical navigator preset into its ordered topology layers. */
export function resolveNavigatorPreset(
  preset: NavigatorPreset | undefined,
  fallbackType: NavigatorType,
): readonly NavigatorType[] {
  switch (preset) {
    case undefined:
      return [fallbackType];
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
    case 'root-stack-tabs':
      return ['stack', 'tabs'];
    case 'root-stack-tabs-stack':
      return ['stack', 'tabs', 'stack'];
    case 'root-stack-drawer':
      return ['stack', 'drawer'];
    case 'root-stack-drawer-stack':
      return ['stack', 'drawer', 'stack'];
    case 'root-stack-drawer-tabs':
      return ['stack', 'drawer', 'tabs'];
    case 'root-stack-drawer-tabs-stack':
      return ['stack', 'drawer', 'tabs', 'stack'];
  }
}
