import type { NavigatorResponsiveSize } from '@ankhorage/contracts/navigator';
import { useWindowDimensions } from 'react-native';

/*** Resolve Navigator-owned responsive policy from the current React Native viewport. */
export function useHydrationSafeSize(): NavigatorResponsiveSize {
  const { width } = useWindowDimensions();
  if (width >= 1024) return 'expanded';
  if (width >= 768) return 'medium';
  return 'compact';
}
