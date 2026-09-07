import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorNodePlan,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString, serializeJavaScriptLiteral } from '@ankhorage/utility/string';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

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
  if (node.tabs?.implementation === 'custom') {
    return createCustomTabsFile(node, directory, bindings);
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
  const initialRoute =
    node.initialRouteName === undefined
      ? ''
      : `\n\nexport const unstable_settings = { initialRouteName: ${quoteJavaScriptString(node.initialRouteName)} };`;
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
      return `      <${componentName}.Trigger name=${JSON.stringify(route.name)}>\n        <${componentName}.Trigger.Label>{${quoteJavaScriptString(label)}}</${componentName}.Trigger.Label>${icon}\n      </${componentName}.Trigger>`;
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

/*** Create the generated cross-platform custom-tabs layout and registered integration imports. */
function createCustomTabsFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  const { tabs } = node;
  if (tabs?.presentations === undefined) {
    throw new Error('Custom Tabs planning did not preserve responsive presentations.');
  }
  const imports = ["import { CustomTabsLayout } from '@ankhorage/navigator/tabs';"];
  let customPresentation = '';
  let iconSourceResolver = '';
  if (tabs.customPresentationId !== undefined) {
    const binding = Reflect.get(bindings.tabPresentations ?? {}, tabs.customPresentationId) as
      NavigatorScreenModule | undefined;
    if (binding === undefined) throw new Error('Missing registered custom Tabs presentation.');
    assertStaticImportBinding(binding.module, binding.exportName, 'Custom Tabs presentation');
    customPresentation = ' customPresentation={NavigatorCustomTabsPresentation}';
    imports.push(
      `import { ${binding.exportName} as NavigatorCustomTabsPresentation } from ${quoteJavaScriptString(binding.module)};`,
    );
  }
  if (node.routes.some((route) => route.icon !== undefined && 'source' in route.icon)) {
    const binding = bindings.iconSourceResolver;
    if (binding === undefined) throw new Error('Missing registered Tabs icon-source resolver.');
    assertStaticImportBinding(binding.module, binding.exportName, 'Tabs icon-source resolver');
    iconSourceResolver = ' resolveIconSource={NavigatorResolveTabsIconSource}';
    imports.push(
      `import { ${binding.exportName} as NavigatorResolveTabsIconSource } from ${quoteJavaScriptString(binding.module)};`,
    );
  }
  const routes = node.routes.map((route) => ({
    name: route.name,
    href: route.path,
    label: route.label ?? route.name,
    ...(route.icon === undefined ? {} : { icon: route.icon }),
    visible: route.showInPrimaryNavigation !== false,
  }));
  const initialRoute =
    node.initialRouteName === undefined
      ? ''
      : ` initialRouteName=${JSON.stringify(node.initialRouteName)}`;
  const routeSource = renderCustomTabRoutes(routes);
  const component = `<CustomTabsLayout${customPresentation}${initialRoute} presentations={presentations}${iconSourceResolver} routes={routes} />`;
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${imports.sort().join('\n')}\n\nconst routes = ${routeSource} as const;\nconst presentations = ${serializeJavaScriptLiteral(tabs.presentations)} as const;\n\nexport default function NavigatorLayout() {\n${renderCustomTabsReturn(component)}\n}\n`,
  };
}

/*** Render custom-tab route records as stable multiline source objects. */
function renderCustomTabRoutes(routes: readonly Readonly<Record<string, unknown>>[]): string {
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

/*** Render the custom Tabs return statement without exceeding the canonical print width. */
function renderCustomTabsReturn(component: string): string {
  const directReturn = `  return ${component};`;
  return directReturn.length <= 100 ? directReturn : `  return (\n    ${component}\n  );`;
}
