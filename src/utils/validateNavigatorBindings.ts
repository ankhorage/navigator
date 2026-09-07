import type {
  NavigatorDiagnostic,
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

import { isNavigatorGenerationBindings } from './isNavigatorGenerationBindings';

/*** Validate only the narrow generated-module bindings required by a resolved navigator plan. */
export function validateNavigatorBindings(
  plan: NavigatorPlan,
  bindings: unknown,
  options: NavigatorGenerationOptions = {},
): readonly NavigatorDiagnostic[] {
  if (!isNavigatorGenerationBindings(bindings)) {
    return [
      {
        code: 'invalid-generation-bindings',
        severity: 'error',
        path: '',
        message:
          'Bindings must contain only screen, guard, icon-resolver, and Tabs-presentation module/symbol records.',
      },
    ];
  }
  const diagnostics: NavigatorDiagnostic[] = [];
  validateSuppliedBindings(diagnostics, bindings);
  validateNodeBindings(diagnostics, plan.root, bindings, options.includeScreenFiles ?? true);
  return diagnostics.sort((left, right) =>
    `${left.path}\0${left.code}\0${left.message}`.localeCompare(
      `${right.path}\0${right.code}\0${right.message}`,
    ),
  );
}

/*** Validate every supplied module record, including currently unreferenced bindings. */
function validateSuppliedBindings(
  diagnostics: NavigatorDiagnostic[],
  bindings: NavigatorGenerationBindings,
): void {
  for (const [group, modules] of Object.entries({
    screens: bindings.screens,
    guards: bindings.guards,
    tabPresentations: bindings.tabPresentations ?? {},
  })) {
    for (const [id, binding] of Object.entries(modules)) {
      validateStaticImport(
        diagnostics,
        binding,
        `/${group}/${id}`,
        `${group} ${JSON.stringify(id)}`,
      );
    }
  }
  if (bindings.iconSourceResolver !== undefined) {
    validateStaticImport(
      diagnostics,
      bindings.iconSourceResolver,
      '/iconSourceResolver',
      'icon source resolver',
    );
  }
}

/*** Traverse one node and validate every screen, guard, and presentation module it references. */
function validateNodeBindings(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNodePlan,
  bindings: NavigatorGenerationBindings,
  includeScreenFiles: boolean,
): void {
  for (const [index, route] of node.routes.entries()) {
    const routePointer = `${node.pointer}/routes/${index}`;
    if (includeScreenFiles && route.screenId !== undefined) {
      validateModuleBinding(
        diagnostics,
        Reflect.get(bindings.screens, route.screenId),
        `${routePointer}/screenId`,
        'missing-screen-binding',
        `screen ${JSON.stringify(route.screenId)}`,
      );
    }
    for (const [guardIndex, guard] of route.guards.entries()) {
      validateModuleBinding(
        diagnostics,
        Reflect.get(bindings.guards, guard),
        `${routePointer}/guards/${guardIndex}`,
        'missing-guard-binding',
        `guard ${JSON.stringify(guard)}`,
      );
    }
    if (route.navigator !== undefined) {
      validateNodeBindings(diagnostics, route.navigator, bindings, includeScreenFiles);
    }
  }
  validateTabsBindings(diagnostics, node, bindings);
  validateSplitViewBindings(diagnostics, node, bindings);
}

/*** Validate optional Headless and Native Tabs runtime bindings. */
function validateTabsBindings(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNodePlan,
  bindings: NavigatorGenerationBindings,
): void {
  if (node.type !== 'tabs' || node.tabs === undefined) return;
  if (node.tabs.bottomAccessoryScreenId !== undefined) {
    validateModuleBinding(
      diagnostics,
      Reflect.get(bindings.screens, node.tabs.bottomAccessoryScreenId),
      `${node.pointer}/tabs/bottomAccessoryScreenId`,
      'missing-bottom-accessory-binding',
      `Native Tabs bottom-accessory screen ${JSON.stringify(node.tabs.bottomAccessoryScreenId)}`,
    );
  }
  if (node.tabs.customPresentationId !== undefined) {
    validateModuleBinding(
      diagnostics,
      Reflect.get(bindings.tabPresentations ?? {}, node.tabs.customPresentationId),
      `${node.pointer}/tabs/customPresentationId`,
      'missing-tab-presentation-binding',
      `Tabs presentation ${JSON.stringify(node.tabs.customPresentationId)}`,
    );
  }
  if (node.routes.some((route) => route.icon !== undefined && 'source' in route.icon)) {
    validateModuleBinding(
      diagnostics,
      bindings.iconSourceResolver,
      `${node.pointer}/tabs/iconSourceResolver`,
      'missing-icon-source-resolver-binding',
      'Tabs icon-source resolver',
    );
  }
}

/*** Validate Split View column and inspector screen bindings. */
function validateSplitViewBindings(
  diagnostics: NavigatorDiagnostic[],
  node: NavigatorNodePlan,
  bindings: NavigatorGenerationBindings,
): void {
  if (node.type !== 'split-view' || node.splitView === undefined) return;
  for (const [role, screenId] of Object.entries({
    primary: node.splitView.columns.primary,
    supplementary: node.splitView.columns.supplementary,
    inspector: node.splitView.inspector,
  })) {
    if (screenId === undefined) continue;
    validateModuleBinding(
      diagnostics,
      Reflect.get(bindings.screens, screenId),
      `${node.pointer}/splitView/${role}`,
      'missing-split-view-binding',
      `Split View ${role} screen ${JSON.stringify(screenId)}`,
    );
  }
}

/*** Validate one required module/symbol pair and emit a portable diagnostic on failure. */
function validateModuleBinding(
  diagnostics: NavigatorDiagnostic[],
  binding: NavigatorScreenModule | undefined,
  path: string,
  missingCode: string,
  description: string,
): void {
  if (binding === undefined) {
    diagnostics.push({
      code: missingCode,
      severity: 'error',
      path,
      message: `Missing binding for ${description}.`,
    });
  }
}

/*** Emit a portable diagnostic for an unsafe supplied module or export name. */
function validateStaticImport(
  diagnostics: NavigatorDiagnostic[],
  binding: NavigatorScreenModule,
  path: string,
  description: string,
): void {
  try {
    assertStaticImportBinding(binding.module, binding.exportName, description);
  } catch (error) {
    diagnostics.push({
      code: 'invalid-module-binding',
      severity: 'error',
      path,
      message: error instanceof Error ? error.message : `Invalid binding for ${description}.`,
    });
  }
}
