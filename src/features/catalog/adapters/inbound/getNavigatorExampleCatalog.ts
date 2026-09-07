import type {
  NavigatorCapabilityVerification,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import type {
  NavigatorExampleDescriptor,
  NavigatorExampleTarget,
} from '../../../../types/navigatorExamples';
import { createNavigatorExamplePlan } from '../../../../utils/createNavigatorExamplePlan';
import { verifyNavigator } from '../../../../utils/verifyNavigator';
import { createNavigatorExampleDefinitions } from '../../domain/createNavigatorExampleDefinitions';
import { getNavigatorCatalog } from './getNavigatorCatalog';

/*** Return the standalone composition catalog with target truth derived from Navigator policy. */
export function getNavigatorExampleCatalog(): readonly NavigatorExampleDescriptor[] {
  return createNavigatorExampleDefinitions().map((definition) => ({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    targets: PLATFORMS.map((platform) => createTarget(definition, platform)),
  }));
}

const PLATFORMS = ['android', 'ios', 'web'] as const;

/*** Resolve one target entry through planning and the package-owned verification vocabulary. */
function createTarget(
  definition: ReturnType<typeof createNavigatorExampleDefinitions>[number],
  platform: NavigatorRuntimePlatform,
): NavigatorExampleTarget {
  const plan = createNavigatorExamplePlan(definition, platform);
  const verification = verifyNavigator(plan, definition.bindings);
  return {
    platform,
    support: plan.support,
    capabilityIds: plan.capabilityIds,
    diagnostics: plan.diagnostics,
    verification: mergeDeclaredVerification(plan.capabilityIds, platform, verification.checks),
  };
}

/*** Preserve declared layers while applying the verifier's current structural evidence. */
function mergeDeclaredVerification(
  capabilityIds: readonly string[],
  platform: NavigatorRuntimePlatform,
  checks: readonly NavigatorCapabilityVerification[],
): readonly NavigatorCapabilityVerification[] {
  const catalog = getNavigatorCatalog();
  const declaredKinds = capabilityIds.flatMap((capabilityId) => {
    const capability = catalog.capabilities.find(({ id }) => id === capabilityId);
    return capability?.targets.find((target) => target.platform === platform)?.verification ?? [];
  });
  const statuses = new Map(checks.map((check) => [check.kind, check.status]));
  return [...new Set(declaredKinds.map(({ kind }) => kind))].map((kind) => ({
    kind,
    status: statuses.get(kind) ?? 'unverified',
  }));
}
