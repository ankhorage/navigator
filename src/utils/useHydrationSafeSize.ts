import type { NavigatorResponsiveSize } from '@ankhorage/contracts/navigator';
import { useSyncExternalStore } from 'react';
import { Dimensions } from 'react-native';

/*** Resolve Navigator-owned responsive policy from the current React Native viewport. */
export function useHydrationSafeSize(): NavigatorResponsiveSize {
  return useSyncExternalStore(subscribeToWindowSize, resolveWindowSize, resolveServerSize);
}

/*** Subscribe React to React Native viewport changes after browser hydration. */
function subscribeToWindowSize(onStoreChange: () => void): () => void {
  const subscription = Dimensions.addEventListener('change', onStoreChange);
  return () => subscription.remove();
}

/*** Resolve the responsive policy from the current native window dimensions. */
function resolveWindowSize(): NavigatorResponsiveSize {
  const { width } = Dimensions.get('window');
  if (width >= 1024) return 'expanded';
  if (width >= 768) return 'medium';
  return 'compact';
}

/*** Keep static and initial browser markup compact until React completes hydration. */
function resolveServerSize(): NavigatorResponsiveSize {
  return 'compact';
}
