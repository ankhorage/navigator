import type {
  NavigatorDependencyRequirement,
  NavigatorNodePlan,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import packageJson from '../../package.json';

/*** Derive generated-app dependency requirements from the resolved navigator plan. */
export function resolveNavigatorDependencies(
  root: NavigatorNodePlan,
  platform: NavigatorRuntimePlatform,
): readonly NavigatorDependencyRequirement[] {
  const packageNames = new Set<string>(['expo-router']);
  visitNode(root, platform, packageNames);
  return [...packageNames].sort().map((packageName) => ({
    packageName,
    versionRange: resolveVersionRange(packageName),
    kind: 'dependency',
  }));
}

/*** Collect runtime packages imported by Navigator-owned generated files or runtime adapters. */
function visitNode(
  node: NavigatorNodePlan,
  platform: NavigatorRuntimePlatform,
  packageNames: Set<string>,
): void {
  if (node.adapter.id === 'drawer' && platform !== 'web') {
    packageNames.add('react-native-gesture-handler');
    packageNames.add('react-native-reanimated');
    packageNames.add('react-native-worklets');
  }
  if (node.adapter.id === 'tabs.headless') {
    packageNames.add(packageJson.name);
    packageNames.add('@ankhorage/surface');
    packageNames.add('react');
    packageNames.add('react-native');
    packageNames.add('react-native-safe-area-context');
    if (platform === 'web') {
      packageNames.add('react-dom');
      packageNames.add('react-native-web');
    }
  }
  if (node.adapter.id === 'tabs.native') {
    for (const route of node.routes) {
      const provider =
        route.icon === undefined || 'source' in route.icon
          ? undefined
          : (route.icon.provider ?? 'Ionicons');
      const packageName = provider === undefined ? undefined : ICON_PACKAGES.get(provider);
      if (packageName !== undefined) packageNames.add(packageName);
    }
    if (node.routes.some((route) => route.icon !== undefined)) packageNames.add(packageJson.name);
  }
  for (const route of node.routes) {
    if (route.navigator !== undefined) visitNode(route.navigator, platform, packageNames);
  }
}

/*** Resolve one dependency range from package-owned peer policy or the current package version. */
function resolveVersionRange(packageName: string): string {
  if (packageName === packageJson.name) return `^${packageJson.version}`;
  const range = Object.entries(packageJson.peerDependencies).find(
    ([candidate]) => candidate === packageName,
  )?.[1];
  if (typeof range !== 'string') {
    throw new Error(`Navigator has no owner version policy for ${JSON.stringify(packageName)}.`);
  }
  return range;
}

const ICON_PACKAGES = new Map([
  ['FontAwesome', '@react-native-vector-icons/fontawesome'],
  ['FontAwesome5', '@react-native-vector-icons/fontawesome5'],
  ['FontAwesome6', '@react-native-vector-icons/fontawesome6'],
  ['Ionicons', '@react-native-vector-icons/ionicons'],
  ['MaterialDesignIcons', '@react-native-vector-icons/material-design-icons'],
]);
