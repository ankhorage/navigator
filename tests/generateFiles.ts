import type {
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
  NavigatorPlan,
} from '@ankhorage/contracts/navigator';

import { generateNavigator } from '../src/navigator';

/** Generate files through the structured public generation boundary. */
export function generateFiles(
  plan: NavigatorPlan,
  bindings: NavigatorGenerationBindings,
  options?: NavigatorGenerationOptions,
) {
  return generateNavigator(plan, bindings, options).files;
}
