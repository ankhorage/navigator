import type {
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
  NavigatorPlan,
  NavigatorVerificationKind,
} from '@ankhorage/contracts/navigator';

import { getNavigatorCatalog } from '../features/catalog/adapters/inbound/getNavigatorCatalog';
import type { NavigatorVerificationResult } from '../types/NavigatorVerificationResult';
import { generateNavigator } from './generateNavigator';

/*** Verify deterministic Navigator-owned structure and report stronger runtime evidence separately. */
export function verifyNavigator(
  plan: NavigatorPlan,
  bindings: NavigatorGenerationBindings,
  options: NavigatorGenerationOptions = {},
): NavigatorVerificationResult {
  const first = generateNavigator(plan, bindings, options);
  const second = generateNavigator(plan, bindings, options);
  const deterministic = JSON.stringify(first) === JSON.stringify(second);
  const hasErrors = first.diagnostics.some(({ severity }) => severity === 'error');
  const checks = collectDeclaredChecks(plan).map(
    (kind): NavigatorVerificationResult['checks'][number] => {
      if (kind === 'structural') {
        return {
          kind,
          status: hasErrors ? 'unverified' : 'verified',
          message: hasErrors
            ? 'Structural and semantic diagnostics contain errors.'
            : 'Manifest semantics and resolved adapter constraints passed.',
        };
      }
      if (kind === 'generation') {
        const verified = deterministic && !hasErrors;
        return {
          kind,
          status: verified ? 'verified' : 'unverified',
          message: verified
            ? 'Repeated generation produced byte-identical structured results.'
            : hasErrors
              ? 'Generation is blocked by structured diagnostics.'
              : 'Repeated generation produced different structured results.',
        };
      }
      return {
        kind,
        status: 'unverified',
        message: `${kind} evidence requires the standalone example acceptance layer.`,
      };
    },
  );
  return {
    support: first.support,
    capabilityIds: first.capabilityIds,
    diagnostics: first.diagnostics,
    deterministic,
    checks,
  };
}

/*** Collect the verification layers declared by every resolved capability for one target. */
function collectDeclaredChecks(plan: NavigatorPlan): readonly NavigatorVerificationKind[] {
  const catalog = getNavigatorCatalog();
  const kinds = plan.capabilityIds.flatMap((capabilityId) => {
    const descriptor = catalog.capabilities.find(({ id }) => id === capabilityId);
    const target = descriptor?.targets.find(({ platform }) => platform === plan.context.platform);
    return target?.verification.map(({ kind }) => kind) ?? [];
  });
  return [...new Set(kinds)];
}
