import type { NavigatorAdapterPlan } from '../../../utils/NavigatorAdapterPlan';

/*** Describe the standard Expo Router Drawer adapter. */
export function createDrawerAdapter(): NavigatorAdapterPlan {
  return {
    id: 'drawer',
    module: 'expo-router/drawer',
    exportName: 'Drawer',
    support: 'supported',
    stability: 'stable',
    limitations: [],
  };
}
