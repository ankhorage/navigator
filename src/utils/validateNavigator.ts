import type {
  CreateNavigatorPlanOptions,
  NavigatorDiagnostic,
  NavigatorGenerationOptions,
} from '@ankhorage/contracts/navigator';
import { isAppNavigatorManifest } from '@ankhorage/contracts/navigator';

import { createNavigatorPlan } from './createNavigatorPlan';
import { validateNavigatorBindings } from './validateNavigatorBindings';

/*** Structurally and semantically validate standalone navigator input without writing files. */
export function validateNavigator(
  manifest: unknown,
  bindings: unknown,
  options: CreateNavigatorPlanOptions,
  generationOptions: NavigatorGenerationOptions = {},
): readonly NavigatorDiagnostic[] {
  if (!isAppNavigatorManifest(manifest)) {
    return [
      {
        code: 'invalid-navigator-manifest',
        severity: 'error',
        path: '',
        message: 'Input must be a structurally valid AppNavigatorManifest value.',
      },
    ];
  }
  const plan = createNavigatorPlan(manifest, options);
  return [
    ...plan.diagnostics,
    ...validateNavigatorBindings(plan, bindings, generationOptions),
  ].sort((left, right) =>
    `${left.path}\0${left.code}\0${left.message}`.localeCompare(
      `${right.path}\0${right.code}\0${right.message}`,
    ),
  );
}
