import type { NavigatorAdapterPlan } from '../../../utils/NavigatorAdapterPlan';

/*** Describe the stateless Expo Router Slot adapter. */
export function createSlotAdapter(): NavigatorAdapterPlan {
  return {
    id: 'slot',
    module: 'expo-router',
    exportName: 'Slot',
    support: 'supported',
    stability: 'stable',
    limitations: [],
  };
}
