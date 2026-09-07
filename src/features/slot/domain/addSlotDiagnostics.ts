import type { NavigatorDiagnostic, NavigatorNode } from '@ankhorage/contracts/navigator';

/*** Reject stateful initial routes and protected screen registrations on a stateless Slot. */
export function addSlotDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNode,
  pointer: string,
): void {
  if (node.type !== 'slot') return;
  if (node.initialRouteName !== undefined) {
    diagnostics.push({
      code: 'unsupported-slot-initial-route',
      severity: 'error',
      path: `${pointer}/initialRouteName`,
      message: 'Slot cannot declare an initial route because it has no navigator state of its own.',
    });
  }
  for (const [index, route] of node.routes.entries()) {
    if ((route.guards ?? []).length === 0) continue;
    diagnostics.push({
      code: 'unsupported-slot-guard',
      severity: 'error',
      path: `${pointer}/routes/${index}/guards`,
      message: 'Slot cannot declare route guards because it has no Screen registration API.',
    });
  }
}
