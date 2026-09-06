import type {
  NavigatorGeneratedFile,
  NavigatorGenerationBindings,
  NavigatorNodePlan,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '../definitions/NavigatorPlan';
import { assertModuleBinding, quote } from './generationSafety';

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

/*** Read the required native vector-icon name from one planned route icon. */
function nativeIconName(icon: NavigatorRoutePlan['icon']): string {
  if (icon === undefined || 'source' in icon) {
    throw new Error('Native Tabs require a supported named icon.');
  }
  return icon.name;
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
      : `\n\nexport const unstable_settings = { initialRouteName: ${quote(node.initialRouteName)} };`;
  const minimize =
    node.tabs?.minimizeBehavior === undefined
      ? ''
      : ` minimizeBehavior=${quote(node.tabs.minimizeBehavior)}`;
  const triggers = node.routes
    .map((route) => {
      const label = route.label ?? route.name;
      const icon =
        route.icon === undefined
          ? ''
          : `\n        <${componentName}.Trigger.Icon src={<${componentName}.Trigger.VectorIcon family={${nativeIconFamily(nativeIconProvider(route.icon))}} name=${quote(nativeIconName(route.icon))} />} />`;
      return `      <${componentName}.Trigger name=${quote(route.name)}>\n        <${componentName}.Trigger.Label>{${quote(label)}}</${componentName}.Trigger.Label>${icon}\n      </${componentName}.Trigger>`;
    })
    .join('\n');
  const accessory =
    accessoryName === undefined
      ? ''
      : `\n      <${componentName}.BottomAccessory>\n        <${accessoryName} />\n      </${componentName}.BottomAccessory>`;
  return `${imports}${initialRoute}\n\nexport default function NavigatorLayout() {\n  return (\n    <${componentName}${minimize}>\n${triggers}${accessory}\n    </${componentName}>\n  );\n}\n`;
}

/*** Create the generated Native Tabs layout file and its narrow runtime imports. */
function createNativeTabsFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  const componentName = node.adapter.exportName ?? 'NativeTabs';
  const imports = [`import { ${componentName} } from ${quote(node.adapter.module ?? '')};`];
  const iconFamilies = [
    ...new Set(
      node.routes.flatMap((route) =>
        route.icon === undefined ? [] : [nativeIconFamily(nativeIconProvider(route.icon))],
      ),
    ),
  ].sort();
  if (iconFamilies.length > 0) {
    imports.push(
      `import { ${iconFamilies.join(', ')} } from "@ankhorage/navigator/tabs/native-icons";`,
    );
  }
  let accessoryName: string | undefined;
  if (node.tabs?.bottomAccessoryScreenId !== undefined) {
    const binding = Reflect.get(bindings.screens, node.tabs.bottomAccessoryScreenId) as
      NavigatorScreenModule | undefined;
    if (binding === undefined) throw new Error('Missing Native Tabs bottom-accessory binding.');
    assertModuleBinding(binding, 'Native Tabs bottom accessory');
    accessoryName = 'NavigatorBottomAccessory';
    imports.push(
      `import { ${binding.exportName} as ${accessoryName} } from ${quote(binding.module)};`,
    );
  }
  return {
    path: `${directory}/_layout.tsx`,
    contents: createNativeTabsContents(node, componentName, imports.join('\n'), accessoryName),
  };
}

/*** Create the generated Web custom-tabs layout file and registered integration imports. */
function createCustomTabsFile(
  node: NavigatorNodePlan,
  directory: string,
  bindings: NavigatorGenerationBindings,
): NavigatorGeneratedFile {
  const { tabs } = node;
  if (tabs?.presentations === undefined) {
    throw new Error('Custom Tabs planning did not preserve responsive presentations.');
  }
  const imports = ['import { CustomTabsLayout } from "@ankhorage/navigator/tabs";'];
  let customPresentation = '';
  let iconSourceResolver = '';
  if (tabs.customPresentationId !== undefined) {
    const binding = Reflect.get(bindings.tabPresentations ?? {}, tabs.customPresentationId) as
      NavigatorScreenModule | undefined;
    if (binding === undefined) throw new Error('Missing registered custom Tabs presentation.');
    assertModuleBinding(binding, 'Custom Tabs presentation');
    customPresentation = ' customPresentation={NavigatorCustomTabsPresentation}';
    imports.push(
      `import { ${binding.exportName} as NavigatorCustomTabsPresentation } from ${quote(binding.module)};`,
    );
  }
  if (node.routes.some((route) => route.icon !== undefined && 'source' in route.icon)) {
    const binding = bindings.iconSourceResolver;
    if (binding === undefined) throw new Error('Missing registered Tabs icon-source resolver.');
    assertModuleBinding(binding, 'Tabs icon-source resolver');
    iconSourceResolver = ' resolveIconSource={NavigatorResolveTabsIconSource}';
    imports.push(
      `import { ${binding.exportName} as NavigatorResolveTabsIconSource } from ${quote(binding.module)};`,
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
    node.initialRouteName === undefined ? '' : ` initialRouteName=${quote(node.initialRouteName)}`;
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${imports.join('\n')}\n\nconst routes = ${JSON.stringify(routes)} as const;\nconst presentations = ${JSON.stringify(tabs.presentations)} as const;\n\nexport default function NavigatorLayout() {\n  return <CustomTabsLayout${customPresentation}${initialRoute} presentations={presentations}${iconSourceResolver} routes={routes} />;\n}\n`,
  };
}

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
