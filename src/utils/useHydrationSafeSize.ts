import type { NavigatorResponsiveSize } from '@ankhorage/contracts/navigator';
import { useBreakpoint } from '@ankhorage/surface';
import { useSyncExternalStore } from 'react';

/*** Resolve a hydration-safe semantic size from the Surface breakpoint owner. */
export function useHydrationSafeSize(): NavigatorResponsiveSize {
  const breakpoint = useBreakpoint();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydration,
    getServerHydration,
  );
  if (!hydrated) return 'compact';
  if (breakpoint === 'base' || breakpoint === 'sm') return 'compact';
  return breakpoint === 'md' ? 'medium' : 'expanded';
}

/*** Provide the stable no-op subscription required for the hydration snapshot boundary. */
function subscribeToHydration(): () => void {
  return () => undefined;
}

/*** Report that client rendering can consume the live responsive breakpoint. */
function getClientHydration(): boolean {
  return true;
}

/*** Keep server output deterministic at the compact presentation. */
function getServerHydration(): boolean {
  return false;
}
