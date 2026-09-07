import type { NavigatorAdapterPlan } from '@ankhorage/contracts/navigator';

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
