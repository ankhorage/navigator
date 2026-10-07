import packageJson from '../../package.json';

/*** Publish static Navigator package metadata without composing the runtime catalog. */
export const NAVIGATOR_PACKAGE_METADATA = {
  packageName: packageJson.name,
  version: packageJson.version,
  manifestProperty: 'navigator',
  contractSubpath: '@ankhorage/contracts/navigator',
  precedence: ['platform override', 'node configuration', 'manifest default', 'stable default'],
} as const;

/*** Define the Expo Router version policy shared by Navigator planning and validation. */
export const NAVIGATOR_ROUTER_POLICY = {
  customNavigatorMinimumMajor: 56,
  experimentalStackMinimumMajor: 56,
  javaScriptStackMinimumMajor: 56,
  nativeTabsMinimumMajor: 54,
  nativeTabsAccessoryMinimumMajor: 55,
  splitViewMinimumMajor: 55,
} as const;
