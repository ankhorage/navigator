import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorNodePlan,
  NavigatorScreenModule,
} from '../definitions/NavigatorPlan';
import { assertModuleBinding, quote } from './generationSafety';

interface SplitViewBinding {
  alias: string;
  element: 'Column' | 'Inspector';
  module: NavigatorScreenModule;
}

type SplitViewRole = 'primary' | 'supplementary' | 'inspector';

/*** Resolve one Split View screen reference through the narrow generated-screen binding port. */
function resolveSplitViewBinding(
  bindings: NavigatorGenerationBindings,
  screenId: string,
  role: SplitViewRole,
  element: SplitViewBinding['element'],
): SplitViewBinding {
  const module = Reflect.get(bindings.screens, screenId) as NavigatorScreenModule | undefined;
  if (module === undefined) {
    throw new Error(`Missing Split View ${role} screen binding for ${JSON.stringify(screenId)}.`);
  }
  assertModuleBinding(module, `Split View ${role} screen ${JSON.stringify(screenId)}`);
  const alias = `Navigator${role[0]?.toUpperCase()}${role.slice(1)}Screen`;
  return { alias, element, module };
}

/*** Render deterministic imports for referenced Split View column and inspector screens. */
function renderSplitViewImports(bindings: readonly SplitViewBinding[]): string {
  return bindings
    .map(
      ({ alias, module }) =>
        `import { ${module.exportName} as ${alias} } from ${quote(module.module)};`,
    )
    .join('\n');
}

/*** Render one referenced screen as an upstream Split View child. */
function renderSplitViewChild(binding: SplitViewBinding): string {
  return `      <SplitView.${binding.element}>\n        <${binding.alias} />\n      </SplitView.${binding.element}>`;
}

/*** Resolve the ordered primary, supplementary, and inspector bindings for one Split View. */
function collectSplitViewBindings(
  splitView: NonNullable<NavigatorNodePlan['splitView']>,
  bindings: NavigatorGenerationBindings,
): SplitViewBinding[] {
  return [
    resolveSplitViewBinding(bindings, splitView.columns.primary, 'primary', 'Column'),
    ...(splitView.columns.supplementary === undefined
      ? []
      : [
          resolveSplitViewBinding(
            bindings,
            splitView.columns.supplementary,
            'supplementary',
            'Column',
          ),
        ]),
    ...(splitView.inspector === undefined
      ? []
      : [resolveSplitViewBinding(bindings, splitView.inspector, 'inspector', 'Inspector')]),
  ];
}

/*** Generate a Split View layout while leaving the routed main column to Expo Router's Slot. */
export function generateSplitViewLayoutFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile | undefined {
  if (node.type !== 'split-view' || node.splitView === undefined) return undefined;
  const referencedScreens = collectSplitViewBindings(node.splitView, bindings);
  const props = [
    node.splitView.topColumnForCollapsing === undefined
      ? undefined
      : `topColumnForCollapsing=${quote(node.splitView.topColumnForCollapsing)}`,
    node.splitView.inspector === undefined ? undefined : 'showInspector',
  ].filter((value): value is string => value !== undefined);
  const openingTag = `<SplitView${props.length === 0 ? '' : ` ${props.join(' ')}`}>`;
  const imports = [
    'import { SplitView } from "expo-router/unstable-split-view";',
    renderSplitViewImports(referencedScreens),
  ].join('\n');
  const children = referencedScreens.map(renderSplitViewChild).join('\n');
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${imports}\n\nexport default function NavigatorLayout() {\n  return (\n    ${openingTag}\n${children}\n    </SplitView>\n  );\n}\n`,
  };
}
