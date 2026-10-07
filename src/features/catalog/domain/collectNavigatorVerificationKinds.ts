import type {
  NavigatorCatalog,
  NavigatorPlan,
  NavigatorVerificationKind,
} from '@ankhorage/contracts/navigator';

/*** Collect verification layers declared by every resolved capability for one target. */
export function collectNavigatorVerificationKinds(
  catalog: NavigatorCatalog,
  plan: NavigatorPlan,
): readonly NavigatorVerificationKind[] {
  const kinds = plan.capabilityIds.flatMap((capabilityId) => {
    const descriptor = catalog.capabilities.find(({ id }) => id === capabilityId);
    const target = descriptor?.targets.find(({ platform }) => platform === plan.context.platform);
    return target?.verification.map(({ kind }) => kind) ?? [];
  });
  return [...new Set(kinds)];
}
