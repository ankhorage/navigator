import type { AppNavigatorManifest, NavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorDiagnostic } from '../definitions/NavigatorPlan';
import { resolveNavigatorPreset } from '../topology/resolveNavigatorPreset';

/*** Reject preset metadata that contradicts the explicitly authored navigator spine. */
export function validatePresetTopology(
  diagnostics: NavigatorDiagnostic[],
  manifest: AppNavigatorManifest,
): void {
  if (manifest.preset === undefined) return;
  const layers = resolveNavigatorPreset(manifest.preset, manifest.type);
  let reachedFinalLayer = layers.length === 1;

  function visit(node: NavigatorNode, depth: number, pointer: string): void {
    const expected = layers.at(depth);
    if (expected !== node.type) {
      diagnostics.push({
        code: 'preset-topology-mismatch',
        severity: 'error',
        path: `${pointer}/type`,
        message: `Preset ${JSON.stringify(manifest.preset)} expects ${JSON.stringify(expected)} at layer ${depth + 1}, not ${JSON.stringify(node.type)}.`,
      });
      return;
    }

    const children = node.routes.flatMap((route, index) =>
      route.navigator === undefined
        ? []
        : [{ node: route.navigator, pointer: `${pointer}/routes/${index}/navigator` }],
    );
    if (depth === layers.length - 1) {
      reachedFinalLayer = true;
      for (const child of children) {
        diagnostics.push({
          code: 'preset-topology-mismatch',
          severity: 'error',
          path: `${child.pointer}/type`,
          message: `Preset ${JSON.stringify(manifest.preset)} does not declare another navigator layer.`,
        });
      }
      return;
    }
    for (const child of children) visit(child.node, depth + 1, child.pointer);
  }

  visit(manifest, 0, '');
  if (!reachedFinalLayer) {
    diagnostics.push({
      code: 'incomplete-preset-topology',
      severity: 'error',
      path: '/preset',
      message: `Preset ${JSON.stringify(manifest.preset)} requires ${layers.length} authored navigator layers.`,
    });
  }
}
