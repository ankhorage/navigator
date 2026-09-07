import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString, serializeJavaScriptLiteral } from '@ankhorage/utility/string';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

import { resolveDrawerRouteOptions } from '../features/drawer/adapters/outbound/resolveDrawerRouteOptions';
import { generateSlotLayoutFile } from '../features/slot/adapters/outbound/generateSlotLayoutFile';
import { generateSplitViewLayoutFile } from '../features/split-view/adapters/outbound/generateSplitViewLayoutFile';
import { generateTabsLayoutFile } from '../features/tabs/adapters/outbound/generateTabsLayoutFile';

/*** Generate deterministic Expo Router files from a validated disposable plan and narrow bindings. */
export function generateNavigatorFiles(
  plan: NavigatorPlan,
  bindings: NavigatorGenerationBindings,
  options: NavigatorGenerationOptions = {},
): readonly NavigatorGeneratedFile[] {
  const errors = plan.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (!plan.supported || errors.length > 0) {
    throw new Error(
      `Cannot generate an unsupported navigator plan: ${errors.map((error) => error.code).join(', ') || 'adapter unavailable'}.`,
    );
  }
  validateFlowBindings(plan, bindings);
  const rootDirectory = resolveRootDirectory(options.rootDirectory);
  const files = collectFiles(
    plan.root,
    rootDirectory,
    bindings,
    options.includeScreenFiles ?? true,
  ).sort((left, right) => left.path.localeCompare(right.path));
  const paths = new Set<string>();
  for (const file of files) {
    if (paths.has(file.path))
      throw new Error(`Generated file path ${JSON.stringify(file.path)} is duplicated.`);
    paths.add(file.path);
  }
  return files;
}

/*** Require enabled onboarding and authentication flows to reference an existing route. */
function validateFlowBindings(plan: NavigatorPlan, bindings: NavigatorGenerationBindings): void {
  const routeIds = new Set(collectRouteIds(plan.root));
  for (const [enabled, routeId, name] of [
    [plan.flows.onboarding, bindings.flows?.onboardingRoute, 'onboarding'],
    [plan.flows.authentication, bindings.flows?.authenticationRoute, 'authentication'],
  ] as const) {
    if (!enabled) continue;
    if (routeId === undefined) throw new Error(`Missing ${name} flow-route binding.`);
    if (!routeIds.has(routeId)) {
      throw new Error(
        `${name[0]?.toUpperCase()}${name.slice(1)} flow route ${JSON.stringify(routeId)} does not exist.`,
      );
    }
  }
}

/*** Collect nested route identifiers without changing their authored segment names. */
function collectRouteIds(node: NavigatorNodePlan, parent: string[] = []): string[] {
  return node.routes.flatMap((route) => {
    const segments = [...parent, route.name];
    const routeId = segments.join('/');
    return route.navigator === undefined
      ? [routeId]
      : [routeId, ...collectRouteIds(route.navigator, segments)];
  });
}

/*** Resolve a safe directory below the Expo Router app root without filesystem normalization. */
function resolveRootDirectory(rootDirectory: string | undefined): string {
  const directory = rootDirectory ?? APP_DIRECTORY;
  const segments = directory.split('/');
  if (
    segments[0] !== 'src' ||
    segments[1] !== 'app' ||
    segments.length < 2 ||
    segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..') ||
    segments.slice(2).some((segment) => !SAFE_ROUTE_NAME.test(segment))
  ) {
    throw new Error(
      `Navigator root directory ${JSON.stringify(directory)} must be src/app or a safe descendant.`,
    );
  }
  return directory;
}

const APP_DIRECTORY = 'src/app';

const SAFE_ROUTE_NAME = /^[A-Za-z0-9_.()[\]-]+$/u;

/*** Traverse the plan to emit layouts and optional screen bindings in their route directories. */
function collectFiles(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
  includeScreenFiles: boolean,
): NavigatorGeneratedFile[] {
  const files = [createLayoutFile(node, directory, bindings)];
  for (const route of node.routes) {
    assertRouteName(route.name);
    if (includeScreenFiles) {
      const screen = createScreenFile(route, directory, bindings);
      if (screen !== undefined) files.push(screen);
    }
    if (route.navigator !== undefined) {
      files.push(
        ...collectFiles(
          route.navigator,
          `${directory}/${route.name}`,
          bindings,
          includeScreenFiles,
        ),
      );
    }
  }
  return files;
}

/*** Dispatch specialized layout generation or render the shared Screen-registration contract. */
function createLayoutFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  if (
    node.adapter.support !== 'supported' ||
    node.adapter.module === undefined ||
    node.adapter.exportName === undefined
  ) {
    throw new Error(
      `Cannot generate unavailable navigator adapter ${JSON.stringify(node.adapter.id)} at ${node.pointer || '/'}.`,
    );
  }

  const tabsLayout = generateTabsLayoutFile(node, directory, bindings);
  if (tabsLayout !== undefined) return tabsLayout;
  const splitViewLayout = generateSplitViewLayoutFile(node, directory, bindings);
  if (splitViewLayout !== undefined) return splitViewLayout;

  const componentName = node.adapter.exportName;
  assertStaticImportBinding(
    node.adapter.module,
    componentName,
    `Adapter ${JSON.stringify(node.adapter.id)}`,
  );
  const guardAliases = new Map<string, string>();
  const guardImports = createGuardImports(node, bindings, guardAliases);
  const imports = [
    `import { ${componentName} } from ${quoteJavaScriptString(node.adapter.module)};`,
    ...(guardImports.length > 0 ? ['', ...guardImports] : []),
  ].join('\n');

  if (node.type === 'slot') {
    return generateSlotLayoutFile(directory, componentName, imports);
  }

  return {
    path: `${directory}/_layout.tsx`,
    contents: createNavigatorContents(node, componentName, imports, guardAliases),
  };
}

/*** Validate and alias every distinct guard binding used by a navigator's routes. */
function createGuardImports(
  node: NavigatorNodePlan,
  bindings: NavigatorGenerationBindings,
  guardAliases: Map<string, string>,
): string[] {
  const guards = [...new Set(node.routes.flatMap((route) => route.guards))].sort();
  return guards.map((guard, index) => {
    const binding = Reflect.get(bindings.guards, guard) as NavigatorScreenModule | undefined;
    if (binding === undefined)
      throw new Error(`Missing guard binding for ${JSON.stringify(guard)}.`);
    assertStaticImportBinding(binding.module, binding.exportName, `Guard ${JSON.stringify(guard)}`);
    const alias = `navigatorGuard${index}`;
    guardAliases.set(guard, alias);
    return `import { ${binding.exportName} as ${alias} } from ${quoteJavaScriptString(binding.module)};`;
  });
}

/*** Render navigator options and registered screens using the resolved adapter component. */
function createNavigatorContents(
  node: NavigatorNodePlan,
  componentName: string,
  imports: string,
  guardAliases: ReadonlyMap<string, string>,
): string {
  const navigatorOptions =
    node.type === 'stack'
      ? node.stack?.options
      : node.type === 'drawer'
        ? node.drawer?.options
        : undefined;
  const props = [
    node.initialRouteName === undefined
      ? undefined
      : `initialRouteName=${JSON.stringify(node.initialRouteName)}`,
    navigatorOptions === undefined
      ? undefined
      : `screenOptions={${serializeJavaScriptLiteral(navigatorOptions)}}`,
    node.type === 'custom' && node.custom?.config !== undefined
      ? `{...${serializeJavaScriptLiteral(node.custom.config)}}`
      : undefined,
  ].filter((value): value is string => value !== undefined);
  const openingTag = `<${componentName}${props.length === 0 ? '' : ` ${props.join(' ')}`}>`;
  const screens = node.routes
    .map((route) => renderScreen(componentName, node, route, guardAliases))
    .join('\n');
  return `${imports}\n\nexport default function NavigatorLayout() {\n  return (\n    ${openingTag}\n${screens}\n    </${componentName}>\n  );\n}\n`;
}

/*** Wrap a generated screen in the conjunction of its registered route guards. */
function renderScreen(
  componentName: string,
  node: NavigatorNodePlan,
  route: NavigatorRoutePlan,
  guardAliases: ReadonlyMap<string, string>,
): string {
  const options = routeOptions(node, route);
  const screen = renderScreenElement(
    componentName,
    route.name,
    options,
    route.guards.length === 0 ? '      ' : '        ',
  );
  if (route.guards.length === 0) return screen;

  const guardExpression = route.guards
    .map((guard) => {
      const alias = guardAliases.get(guard);
      if (alias === undefined)
        throw new Error(`Missing generated guard alias for ${JSON.stringify(guard)}.`);
      return `${alias}()`;
    })
    .join(' && ');
  return `      <${componentName}.Protected guard={${guardExpression}}>
${screen}
      </${componentName}.Protected>`;
}

/*** Merge route labels with the owning adapter's screen-option mapping. */
function routeOptions(
  node: NavigatorNodePlan,
  route: NavigatorRoutePlan,
): Readonly<Record<string, unknown>> | undefined {
  const options: Record<string, unknown> = {};
  if (route.label !== undefined) options.title = route.label;

  if (node.type === 'stack' && route.stackOptions !== undefined) {
    Object.assign(options, route.stackOptions);
  }
  if (node.type === 'drawer') {
    Object.assign(options, resolveDrawerRouteOptions(route));
  }
  if (
    node.type === 'tabs' &&
    node.tabs?.implementation === 'javascript' &&
    route.showInPrimaryNavigation === false
  ) {
    if (node.tabs.presentation === 'top') options.tabBarItemStyle = { display: 'none' };
    else options.href = null;
  }
  return Object.keys(options).length === 0 ? undefined : options;
}

/*** Render one generated Screen with a stable multiline options object when route options exist. */
function renderScreenElement(
  componentName: string,
  routeName: string,
  options: Readonly<Record<string, unknown>> | undefined,
  indentation: string,
): string {
  if (options === undefined) {
    return `${indentation}<${componentName}.Screen name=${JSON.stringify(routeName)} />`;
  }
  const optionLines = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${indentation}    ${key}: ${serializeJavaScriptLiteral(value)},`)
    .join('\n');
  return `${indentation}<${componentName}.Screen
${indentation}  name=${JSON.stringify(routeName)}
${indentation}  options={{
${optionLines}
${indentation}  }}
${indentation}/>`;
}

/*** Reject route segments that could escape or invalidate the generated directory. */
function assertRouteName(name: string): void {
  if (!SAFE_ROUTE_NAME.test(name) || name === '.' || name === '..') {
    throw new Error(`Route name ${JSON.stringify(name)} is not a safe generated file segment.`);
  }
}

/*** Emit a route module that re-exports its registered screen as the default component. */
function createScreenFile(
  route: NavigatorRoutePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile | undefined {
  if (route.screenId === undefined) return undefined;
  assertRouteName(route.name);
  const binding = Reflect.get(bindings.screens, route.screenId) as
    NavigatorScreenModule | undefined;
  if (binding === undefined)
    throw new Error(`Missing screen binding for ${JSON.stringify(route.screenId)}.`);
  assertStaticImportBinding(
    binding.module,
    binding.exportName,
    `Screen ${JSON.stringify(route.screenId)}`,
  );
  return {
    path: `${directory}/${route.name}.tsx`,
    contents: `export { ${binding.exportName} as default } from ${quoteJavaScriptString(binding.module)};\n`,
  };
}
