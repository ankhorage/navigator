import type {
  AppNavigatorManifest,
  NavigatorNode,
  NavigatorType,
  SplitViewNavigatorNode,
} from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic, NavigatorValidationContext } from '../definitions/NavigatorPlan';

interface SplitViewLocation {
  ancestors: readonly NavigatorType[];
  node: SplitViewNavigatorNode;
  pointer: string;
}

const COLLAPSE_COLUMNS = new Set(['primary', 'supplementary', 'secondary']);

/*** Collect every Split View together with its parent topology and manifest pointer. */
function collectSplitViews(
  node: NavigatorNode,
  pointer: string,
  ancestors: readonly NavigatorType[],
): SplitViewLocation[] {
  const current: SplitViewLocation[] =
    node.type === 'split-view' ? [{ ancestors, node, pointer }] : [];
  return [
    ...current,
    ...node.routes.flatMap((route, index) =>
      route.navigator === undefined
        ? []
        : collectSplitViews(route.navigator, `${pointer}/routes/${index}/navigator`, [
            ...ancestors,
            node.type,
          ]),
    ),
  ];
}

/*** Reject invalid or unavailable iPhone collapse-column selections. */
function addCollapseColumnDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  { node, pointer }: Pick<SplitViewLocation, 'node' | 'pointer'>,
): void {
  const collapseColumn = node.topColumnForCollapsing;
  if (collapseColumn !== undefined && !COLLAPSE_COLUMNS.has(collapseColumn)) {
    diagnostics.push({
      code: 'invalid-split-view-collapse-column',
      severity: 'error',
      path: `${pointer}/topColumnForCollapsing`,
      message: 'Split View collapse column must be primary, supplementary, or secondary.',
    });
  }
  if (collapseColumn === 'supplementary' && node.columns.supplementary === undefined) {
    diagnostics.push({
      code: 'missing-split-view-collapse-column',
      severity: 'error',
      path: `${pointer}/topColumnForCollapsing`,
      message: 'topColumnForCollapsing cannot select supplementary without that column.',
    });
  }
}

/*** Reject unresolved, duplicated, or incompatible Split View column references. */
function addColumnDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  { node, pointer }: SplitViewLocation,
): void {
  const references = [
    ['primary', node.columns.primary.screenId],
    ...(node.columns.supplementary === undefined
      ? []
      : ([['supplementary', node.columns.supplementary.screenId]] as const)),
    ...(node.inspector === undefined ? [] : ([['inspector', node.inspector.screenId]] as const)),
  ] as const;
  const seen = new Set<string>();
  for (const [name, screenId] of references) {
    if (screenId.trim().length === 0) {
      diagnostics.push({
        code: 'invalid-split-view-screen-reference',
        severity: 'error',
        path: `${pointer}/${name === 'inspector' ? 'inspector' : `columns/${name}`}/screenId`,
        message: 'Split View screen references must use a non-empty registered screen id.',
      });
    }
    if (seen.has(screenId)) {
      diagnostics.push({
        code: 'duplicate-split-view-screen-reference',
        severity: 'error',
        path: `${pointer}/${name === 'inspector' ? 'inspector' : `columns/${name}`}/screenId`,
        message: `Split View screen reference ${JSON.stringify(screenId)} is already used by another column.`,
      });
    }
    seen.add(screenId);
  }

  addCollapseColumnDiagnostics(diagnostics, { node, pointer });
}

/*** Reject Split View placement and route declarations unsupported by its Slot-based topology. */
function addTopologyDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  location: SplitViewLocation,
): void {
  const { ancestors, node, pointer } = location;
  if (ancestors.some((type) => type !== 'slot')) {
    diagnostics.push({
      code: 'invalid-split-view-placement',
      severity: 'error',
      path: pointer,
      message:
        'Split View is allowed only at the root or beneath Slot-only ancestry with no other navigator.',
    });
  }
  if (node.initialRouteName !== undefined) {
    diagnostics.push({
      code: 'unsupported-split-view-initial-route',
      severity: 'error',
      path: `${pointer}/initialRouteName`,
      message:
        'Split View delegates its routed main content to Slot and cannot set initialRouteName.',
    });
  }
  for (const [index, route] of node.routes.entries()) {
    if ((route.guards ?? []).length === 0) continue;
    diagnostics.push({
      code: 'unsupported-split-view-guard',
      severity: 'error',
      path: `${pointer}/routes/${index}/guards`,
      message: 'Split View uses a Slot fallback and cannot register protected route entries.',
    });
  }
}

/*** Add constrained placement, binding, flow, version, and fallback diagnostics for Split View. */
export function addSplitViewDiagnostics(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
  context: NavigatorValidationContext,
  routerMajor: number | undefined,
): void {
  const locations = collectSplitViews(manifest, '', []);
  if (locations.length === 0) return;
  for (const location of locations) {
    addTopologyDiagnostics(diagnostics, location);
    addColumnDiagnostics(diagnostics, location);
  }
  for (const location of locations.slice(1)) {
    diagnostics.push({
      code: 'multiple-split-views',
      severity: 'error',
      path: location.pointer,
      message: 'Only one Split View may exist in the app navigator hierarchy.',
    });
  }
  if (manifest.flows?.authentication === true || manifest.flows?.onboarding === true) {
    diagnostics.push({
      code: 'unsupported-split-view-flow-wrapper',
      severity: 'error',
      path: '/flows',
      message:
        'Split View cannot synthesize a root Stack wrapper for onboarding or authentication.',
    });
  }
  if (routerMajor !== undefined && routerMajor < 55) {
    diagnostics.push({
      code: 'unsupported-expo-router-version',
      severity: 'error',
      path: locations[0]?.pointer ?? '',
      message: 'Split View requires Expo Router 55.0.0 or newer.',
    });
  }
  if (context.platform !== 'ios') {
    diagnostics.push({
      code: 'split-view-slot-fallback',
      severity: 'warning',
      path: locations[0]?.pointer ?? '',
      message: `Split View renders Expo Router Slot on ${context.platform}; URLs and history remain routed without split-pane presentation.`,
    });
  }
}
