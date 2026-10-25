import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorNodePlan,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString, serializeJavaScriptLiteral } from '@ankhorage/utility/string';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

import { resolveExpoRouterRoutePath } from '../../../routing/domain/resolveExpoRouterRoutePath';

/*** Generate the specialized layout file for a supported tabs implementation. */
export function generateTabsLayoutFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile | undefined {
  if (node.type !== 'tabs') return undefined;
  if (node.tabs?.implementation === 'native') {
    return createNativeTabsFile(node, directory, bindings);
  }
  if (node.tabs?.implementation === 'headless') {
    return createHeadlessTabsFile(node, directory, bindings);
  }
  return undefined;
}

/*** Create the generated Native Tabs layout file and its narrow runtime imports. */
function createNativeTabsFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  const componentName = node.adapter.exportName ?? 'NativeTabs';
  const imports = [
    `import { ${componentName} } from ${quoteJavaScriptString(node.adapter.module ?? '')};`,
  ];
  const iconFamilies = [
    ...new Set(
      node.routes.flatMap((route) =>
        route.icon === undefined ? [] : [nativeIconFamily(nativeIconProvider(route.icon))],
      ),
    ),
  ].sort();
  if (iconFamilies.length > 0) {
    imports.push(
      `import { ${iconFamilies.join(', ')} } from '@ankhorage/navigator/tabs/native-icons';`,
    );
  }
  let accessoryName: string | undefined;
  if (node.tabs?.bottomAccessoryScreenId !== undefined) {
    const binding = Reflect.get(bindings.screens, node.tabs.bottomAccessoryScreenId) as
      NavigatorScreenModule | undefined;
    if (binding === undefined) throw new Error('Missing Native Tabs bottom-accessory binding.');
    assertStaticImportBinding(binding.module, binding.exportName, 'Native Tabs bottom accessory');
    accessoryName = 'NavigatorBottomAccessory';
    imports.push(
      `import { ${binding.exportName} as ${accessoryName} } from ${quoteJavaScriptString(binding.module)};`,
    );
  }
  return {
    path: `${directory}/_layout.tsx`,
    contents: createNativeTabsContents(
      node,
      componentName,
      imports.sort().join('\n'),
      accessoryName,
    ),
  };
}

/*** Map a supported provider to the Navigator-owned Native Tabs family export. */
function nativeIconFamily(provider: NativeIconProvider): string {
  switch (provider) {
    case 'FontAwesome':
      return 'NativeFontAwesomeFamily';
    case 'FontAwesome5':
      return 'NativeFontAwesome5Family';
    case 'FontAwesome6':
      return 'NativeFontAwesome6Family';
    case 'Ionicons':
      return 'NativeIoniconsFamily';
    case 'MaterialDesignIcons':
      return 'NativeMaterialDesignIconsFamily';
  }
}

type NativeIconProvider =
  'FontAwesome' | 'FontAwesome5' | 'FontAwesome6' | 'Ionicons' | 'MaterialDesignIcons';

/*** Resolve and validate the native vector-icon provider for one planned route icon. */
function nativeIconProvider(icon: NavigatorRoutePlan['icon']): NativeIconProvider {
  if (icon === undefined || 'source' in icon) {
    throw new Error('Native Tabs require a supported named icon.');
  }
  const provider = icon.provider ?? 'Ionicons';
  switch (provider) {
    case 'FontAwesome':
    case 'FontAwesome5':
    case 'FontAwesome6':
    case 'Ionicons':
    case 'MaterialDesignIcons':
      return provider;
    default:
      throw new Error(`Native Tabs icon provider ${JSON.stringify(provider)} is unsupported.`);
  }
}

/*** Render a complete Native Tabs layout module from one validated node plan. */
function createNativeTabsContents(
  node: NavigatorNodePlan,
  componentName: string,
  imports: string,
  accessoryName: string | undefined,
): string {
  const initialRouteName = resolveNavigatorInitialRouteName(node);
  const initialRoute =
    initialRouteName === undefined
      ? ''
      : `\n\nexport const unstable_settings = { initialRouteName: ${quoteJavaScriptString(initialRouteName)} };`;
  const minimize =
    node.tabs?.minimizeBehavior === undefined
      ? ''
      : ` minimizeBehavior=${JSON.stringify(node.tabs.minimizeBehavior)}`;
  const triggers = node.routes
    .map((route) => {
      const label = route.label ?? route.name;
      const icon =
        route.icon === undefined
          ? ''
          : `\n        <${componentName}.Trigger.Icon
${nativeIconSource(
  componentName,
  nativeIconFamily(nativeIconProvider(route.icon)),
  nativeIconName(route.icon),
)}
        />`;
      return `      <${componentName}.Trigger name=${JSON.stringify(resolveExpoRouterRoutePath(route))}>\n        <${componentName}.Trigger.Label>{${quoteJavaScriptString(label)}}</${componentName}.Trigger.Label>${icon}\n      </${componentName}.Trigger>`;
    })
    .join('\n');
  const accessory =
    accessoryName === undefined
      ? ''
      : `\n      <${componentName}.BottomAccessory>\n        <${accessoryName} />\n      </${componentName}.BottomAccessory>`;
  return `${imports}${initialRoute}\n\nexport default function NavigatorLayout() {\n  return (\n    <${componentName}${minimize}>\n${triggers}${accessory}\n    </${componentName}>\n  );\n}\n`;
}

/*** Render a Native Tabs vector icon source within the canonical generated-code print width. */
function nativeIconSource(componentName: string, family: string, name: string): string {
  const vectorIcon = `<${componentName}.Trigger.VectorIcon family={${family}} name=${JSON.stringify(name)} />`;
  const inlineSource = `          src={${vectorIcon}}`;
  if (inlineSource.length <= 100) return inlineSource;
  return `          src={
            <${componentName}.Trigger.VectorIcon
              family={${family}}
              name=${JSON.stringify(name)}
            />
          }`;
}

/*** Read the required native vector-icon name from one planned route icon. */
function nativeIconName(icon: NavigatorRoutePlan['icon']): string {
  if (icon === undefined || 'source' in icon) {
    throw new Error('Native Tabs require a supported named icon.');
  }
  return icon.name;
}

/*** Create the generated cross-platform headless-tabs layout and registered integration imports. */
function createHeadlessTabsFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  const { tabs } = node;
  if (tabs?.presentations === undefined) {
    throw new Error('Headless Tabs planning did not preserve responsive presentations.');
  }
  const imports: GeneratedImport[] = [...HEADLESS_TABS_IMPORTS];
  let customPresentation = '';
  let iconSourceResolver = '';
  if (tabs.customPresentationId !== undefined) {
    const binding = Reflect.get(bindings.tabPresentations ?? {}, tabs.customPresentationId) as
      NavigatorScreenModule | undefined;
    if (binding === undefined) throw new Error('Missing registered custom Tabs presentation.');
    assertStaticImportBinding(binding.module, binding.exportName, 'Custom Tabs presentation');
    customPresentation = ' customPresentation={NavigatorCustomTabsPresentation}';
    imports.push(
      createGeneratedImport(binding.module, binding.exportName, 'NavigatorCustomTabsPresentation'),
    );
  }
  if (node.routes.some((route) => route.icon !== undefined && 'source' in route.icon)) {
    const binding = bindings.iconSourceResolver;
    if (binding === undefined) throw new Error('Missing registered Tabs icon-source resolver.');
    assertStaticImportBinding(binding.module, binding.exportName, 'Tabs icon-source resolver');
    iconSourceResolver = ' resolveIconSource={NavigatorResolveTabsIconSource}';
    imports.push(
      createGeneratedImport(binding.module, binding.exportName, 'NavigatorResolveTabsIconSource'),
    );
  }
  const routes = createHeadlessTabRoutes(node.routes);
  const initialRouteName = resolveNavigatorInitialRouteName(node);
  const initialRoute =
    initialRouteName === undefined ? '' : ` initialRouteName=${JSON.stringify(initialRouteName)}`;
  const routeSource = renderHeadlessTabRoutes(routes);
  const component = createHeadlessTabsComponent(
    customPresentation,
    initialRoute,
    iconSourceResolver,
  );
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${sortGeneratedImports(imports)}\n\nconst routes = ${routeSource} as const;\nconst presentations = ${serializeJavaScriptLiteral(tabs.presentations)} as const;\n\nexport default function NavigatorLayout() {\n${renderHeadlessTabsReturn(component)}\n}\n`,
  };
}

/*** Convert planned routes to the route records consumed by the Headless Tabs adapter. */
function createHeadlessTabRoutes(
  routes: readonly NavigatorRoutePlan[],
): readonly Record<string, unknown>[] {
  return routes.map((route) => ({
    name: resolveExpoRouterRoutePath(route),
    href: route.path,
    label: route.label ?? route.name,
    ...(route.icon === undefined ? {} : { icon: route.icon }),
    visible: route.showInPrimaryNavigation !== false,
  }));
}

/*** Map semantic initial-route identity to the generated Expo Router module registration. */
function resolveNavigatorInitialRouteName(node: NavigatorNodePlan): string | undefined {
  if (node.initialRouteName === undefined) return undefined;
  const route = node.routes.find(({ name }) => name === node.initialRouteName);
  if (route === undefined)
    throw new Error(`Missing initial route ${JSON.stringify(node.initialRouteName)}.`);
  return resolveExpoRouterRoutePath(route);
}

type GeneratedImport = Readonly<{ module: string; statement: string }>;

const HEADLESS_TABS_IMPORTS: readonly GeneratedImport[] = [
  {
    module: '@ankhorage/navigator/tabs',
    statement: "import { HeadlessTabsLayout } from '@ankhorage/navigator/tabs';",
  },
  {
    module: '@ankhorage/surface',
    statement: "import { ResponsiveProvider } from '@ankhorage/surface';",
  },
];

/*** Create one generated named import with its source available for canonical ordering. */
function createGeneratedImport(
  module: string,
  exportName: string,
  localName: string,
): GeneratedImport {
  return {
    module,
    statement: `import { ${exportName} as ${localName} } from ${quoteJavaScriptString(module)};`,
  };
}

/*** Sort generated imports with package imports before absolute application imports. */
function sortGeneratedImports(imports: readonly GeneratedImport[]): string {
  const sorted = [...imports].sort((left, right) =>
    generatedImportSortKey(left.module).localeCompare(generatedImportSortKey(right.module)),
  );
  return sorted
    .map(
      ({ statement, module }, index) =>
        `${index > 0 && generatedImportGroup(module) !== generatedImportGroup(sorted[index - 1]?.module ?? '') ? '\n' : ''}${statement}`,
    )
    .join('\n');
}

/*** Create the simple-import-sort-compatible ordering key for one generated module source. */
function generatedImportSortKey(module: string): string {
  return `${generatedImportGroup(module)}${module}`;
}

/*** Resolve the simple-import-sort group for one generated module source. */
function generatedImportGroup(module: string): string {
  return /^@?\w/u.test(module) ? '0' : '1';
}

/*** Create the responsive wrapper around one generated Headless Tabs runtime component. */
function createHeadlessTabsComponent(
  customPresentation: string,
  initialRoute: string,
  iconSourceResolver: string,
): string {
  return `<ResponsiveProvider>\n${renderHeadlessTabsLayout(
    customPresentation,
    initialRoute,
    iconSourceResolver,
  )}\n    </ResponsiveProvider>`;
}

/*** Render the Headless Tabs runtime component without requiring a consumer formatter pass. */
function renderHeadlessTabsLayout(
  customPresentation: string,
  initialRoute: string,
  iconSourceResolver: string,
): string {
  const properties = [
    customPresentation.trim(),
    initialRoute.trim(),
    'presentations={presentations}',
    iconSourceResolver.trim(),
    'routes={routes}',
  ].filter((property) => property !== '');
  const inline = `      <HeadlessTabsLayout ${properties.join(' ')} />`;
  if (inline.length <= 100) return inline;
  return `      <HeadlessTabsLayout\n${properties.map((property) => `        ${property}`).join('\n')}\n      />`;
}

/*** Render Headless Tabs route records as stable multiline source objects. */
function renderHeadlessTabRoutes(routes: readonly Readonly<Record<string, unknown>>[]): string {
  return `[
${routes
  .map(
    (route) => `  {
${Object.entries(route)
  .filter(([, value]) => value !== undefined)
  .map(([key, value]) => `    ${key}: ${serializeJavaScriptLiteral(value)},`)
  .join('\n')}
  },`,
  )
  .join('\n')}
]`;
}

/*** Render the Headless Tabs return statement without exceeding the canonical print width. */
function renderHeadlessTabsReturn(component: string): string {
  const directReturn = `  return ${component};`;
  return directReturn.length <= 100 ? directReturn : `  return (\n    ${component}\n  );`;
}
