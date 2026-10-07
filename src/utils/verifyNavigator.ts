import type {
  NavigatorCatalog,
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
  NavigatorPlan,
} from '@ankhorage/contracts/navigator';

import packageJson from '../../package.json';
import { collectNavigatorVerificationKinds } from '../features/catalog/domain/collectNavigatorVerificationKinds';
import { createNavigatorCatalog } from '../features/catalog/domain/createNavigatorCatalog';
import type { NavigatorVerificationResult } from '../types/navigatorVerification';
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
  const checks = collectNavigatorVerificationKinds(createCatalog(), plan).map(
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

/*** Compose deterministic catalog policy for verification without depending on outer composition. */
function createCatalog(): NavigatorCatalog {
  return createNavigatorCatalog({
    packageName: packageJson.name,
    version: packageJson.version,
    peerDependencies: packageJson.peerDependencies,
  });
}
