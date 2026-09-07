import type { NavigatorNode, StackImplementation } from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic } from '../../../utils/NavigatorDiagnostic';

/*** Reject Stack options on other navigator types and native-only options on JavaScript Stack. */
export function validateStackRouteOptions(
  diagnostics: NavigatorDiagnostic[],
  route: NavigatorNode['routes'][number],
  routePointer: string,
  stackImplementation: StackImplementation | undefined,
): void {
  const { stackOptions } = route;
  if (stackImplementation === undefined && stackOptions !== undefined) {
    diagnostics.push({
      code: 'orphan-stack-options',
      severity: 'error',
      path: `${routePointer}/stackOptions`,
      message: 'stackOptions can only be authored for a route whose parent is a Stack.',
    });
    return;
  }
  const presentation = stackOptions?.presentation;
  if (
    stackImplementation === 'javascript' &&
    presentation !== undefined &&
    !['card', 'modal', 'transparentModal'].includes(presentation)
  ) {
    diagnostics.push({
      code: 'unsupported-stack-option',
      severity: 'error',
      path: `${routePointer}/stackOptions`,
      message: 'This route uses native-only options with the JavaScript Stack implementation.',
    });
  }
}
