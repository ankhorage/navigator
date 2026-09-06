import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '../definitions/NavigatorPlan';
import { generateSplitViewLayoutFile } from './generateSplitViewLayoutFile';
import { generateTabsLayoutFile } from './generateTabsLayoutFile';
import { assertModuleBinding, quote } from './generationSafety';

const APP_DIRECTORY = 'src/app';
const SAFE_ROUTE_NAME = /^[A-Za-z0-9_.()[\]-]+$/u;

function assertRouteName(name: string): void {
  if (!SAFE_ROUTE_NAME.test(name) || name === '.' || name === '..') {
    throw new Error(`Route name ${JSON.stringify(name)} is not a safe generated file segment.`);
  }
}

function routeOptions(node: NavigatorNodePlan, route: NavigatorRoutePlan): string | undefined {
  const options: Record<string, unknown> = {};
  if (route.label !== undefined) options.title = route.label;

  if (node.type === 'stack' && route.stackOptions !== undefined) {
    Object.assign(options, route.stackOptions);
  }
  if (node.type === 'drawer') {
    if (route.label !== undefined) options.drawerLabel = route.label;
    if (route.showInPrimaryNavigation === false) {
      options.drawerItemStyle = { display: 'none' };
    }
  }
  return Object.keys(options).length === 0 ? undefined : JSON.stringify(options);
}

function renderScreen(
  componentName: string,
  node: NavigatorNodePlan,
  route: NavigatorRoutePlan,
  guardAliases: ReadonlyMap<string, string>,
): string {
  const options = routeOptions(node, route);
  const screen = `<${componentName}.Screen name=${quote(route.name)}${options === undefined ? '' : ` options={${options}}`} />`;
  if (route.guards.length === 0) return `      ${screen}`;

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
    assertModuleBinding(binding, `Guard ${JSON.stringify(guard)}`);
    const alias = `navigatorGuard${index}`;
    guardAliases.set(guard, alias);
    return `import { ${binding.exportName} as ${alias} } from ${quote(binding.module)};`;
  });
}

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
      : `initialRouteName=${quote(node.initialRouteName)}`,
    navigatorOptions === undefined
      ? undefined
      : `screenOptions={${JSON.stringify(navigatorOptions)}}`,
    node.type === 'custom' && node.custom?.config !== undefined
      ? `{...${JSON.stringify(node.custom.config)}}`
      : undefined,
  ].filter((value): value is string => value !== undefined);
  const openingTag = `<${componentName}${props.length === 0 ? '' : ` ${props.join(' ')}`}>`;
  const screens = node.routes
    .map((route) => renderScreen(componentName, node, route, guardAliases))
    .join('\n');
  return `${imports}\n\nexport default function NavigatorLayout() {\n  return (\n    ${openingTag}\n${screens}\n    </${componentName}>\n  );\n}\n`;
}

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
  assertModuleBinding(
    { module: node.adapter.module, exportName: componentName },
    `Adapter ${JSON.stringify(node.adapter.id)}`,
  );
  const guardAliases = new Map<string, string>();
  const guardImports = createGuardImports(node, bindings, guardAliases);
  const imports = [
    `import { ${componentName} } from ${quote(node.adapter.module)};`,
    ...guardImports,
  ].join('\n');

  if (node.type === 'slot') {
    return {
      path: `${directory}/_layout.tsx`,
      contents: `${imports}\n\nexport default function NavigatorLayout() {\n  return <${componentName} />;\n}\n`,
    };
  }

  return {
    path: `${directory}/_layout.tsx`,
    contents: createNavigatorContents(node, componentName, imports, guardAliases),
  };
}

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
  assertModuleBinding(binding, `Screen ${JSON.stringify(route.screenId)}`);
  return {
    path: `${directory}/${route.name}.tsx`,
    contents: `export { ${binding.exportName} as default } from ${quote(binding.module)};\n`,
  };
}

function collectFiles(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile[] {
  const files = [createLayoutFile(node, directory, bindings)];
  for (const route of node.routes) {
    assertRouteName(route.name);
    const screen = createScreenFile(route, directory, bindings);
    if (screen !== undefined) files.push(screen);
    if (route.navigator !== undefined) {
      files.push(...collectFiles(route.navigator, `${directory}/${route.name}`, bindings));
    }
  }
  return files;
}

function collectRouteIds(node: NavigatorNodePlan, parent: string[] = []): string[] {
  return node.routes.flatMap((route) => {
    const segments = [...parent, route.name];
    const routeId = segments.join('/');
    return route.navigator === undefined
      ? [routeId]
      : [routeId, ...collectRouteIds(route.navigator, segments)];
  });
}

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

/*** Generate deterministic Expo Router files from a validated disposable plan and narrow bindings. */
export function generateNavigatorFiles(
  plan: NavigatorPlan,
  bindings: NavigatorGenerationBindings,
): readonly NavigatorGeneratedFile[] {
  const errors = plan.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (!plan.supported || errors.length > 0) {
    throw new Error(
      `Cannot generate an unsupported navigator plan: ${errors.map((error) => error.code).join(', ') || 'adapter unavailable'}.`,
    );
  }
  validateFlowBindings(plan, bindings);
  const files = collectFiles(plan.root, APP_DIRECTORY, bindings).sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  const paths = new Set<string>();
  for (const file of files) {
    if (paths.has(file.path))
      throw new Error(`Generated file path ${JSON.stringify(file.path)} is duplicated.`);
    paths.add(file.path);
  }
  return files;
}
