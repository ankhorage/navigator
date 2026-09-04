import type { NavigatorPreset, NavigatorType } from '@ankhorage/contracts/navigator';

const PRESET_LAYERS = {
  stack: ['stack'],
  tabs: ['tabs'],
  'tabs-stack': ['tabs', 'stack'],
  drawer: ['drawer'],
  'drawer-stack': ['drawer', 'stack'],
  'drawer-tabs': ['drawer', 'tabs'],
  'drawer-tabs-stack': ['drawer', 'tabs', 'stack'],
  'root-stack-tabs': ['stack', 'tabs'],
  'root-stack-tabs-stack': ['stack', 'tabs', 'stack'],
  'root-stack-drawer': ['stack', 'drawer'],
  'root-stack-drawer-stack': ['stack', 'drawer', 'stack'],
  'root-stack-drawer-tabs': ['stack', 'drawer', 'tabs'],
  'root-stack-drawer-tabs-stack': ['stack', 'drawer', 'tabs', 'stack'],
} as const satisfies Record<NavigatorPreset, readonly NavigatorType[]>;

/*** Resolve a canonical navigator preset into its ordered topology layers. */
export function resolveNavigatorPreset(
  preset: NavigatorPreset | undefined,
  fallbackType: NavigatorType,
): readonly NavigatorType[] {
  return preset === undefined ? [fallbackType] : PRESET_LAYERS[preset];
}
