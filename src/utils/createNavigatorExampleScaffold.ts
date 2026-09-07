import type {
  NavigatorDependencyRequirement,
  NavigatorGeneratedFile,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import packageJson from '../../package.json';
import type {
  NavigatorExampleDefinition,
  NavigatorExampleDescriptor,
} from '../types/navigatorExamples';
import { createNavigatorExampleScreenFiles } from './createNavigatorExampleScreenFiles';
import { renderNavigatorExampleReadme } from './renderNavigatorExampleReadme';

/*** Create one complete app-owned Expo shell around Navigator-generated route files. */
export function createNavigatorExampleScaffold(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
  requirements: readonly NavigatorDependencyRequirement[],
  generationPlatform: NavigatorRuntimePlatform | undefined,
): readonly NavigatorGeneratedFile[] {
  const supportedPlatforms = descriptor.targets
    .filter(({ support }) => support !== 'unsupported')
    .map(({ platform }) => platform);
  const runnablePlatforms = supportedPlatforms.length === 0 ? ['web'] : supportedPlatforms;
  return [
    { path: '.gitignore', contents: '.expo/\ndist/\nnode_modules/\n' },
    {
      path: 'README.md',
      contents: renderNavigatorExampleReadme(definition, descriptor, generationPlatform),
    },
    { path: 'app.json', contents: json(createAppConfig(definition, runnablePlatforms)) },
    { path: 'expo-env.d.ts', contents: '/// <reference types="expo/types" />\n' },
    { path: 'navigator.bindings.json', contents: json(definition.bindings) },
    { path: 'navigator.example.json', contents: json(descriptor) },
    { path: 'navigator.manifest.json', contents: json(definition.manifest) },
    {
      path: 'package.json',
      contents: json(createPackageManifest(definition, requirements, generationPlatform)),
    },
    { path: 'tsconfig.json', contents: json(createTypeScriptConfig()) },
    ...createNavigatorExampleScreenFiles(definition, descriptor),
    ...(definition.customNavigatorRegistrations === undefined
      ? []
      : [{ path: 'navigator.custom-navigators.ts', contents: renderCustomRegistry() }]),
  ];
}

/*** Create an Expo Router application manifest with only truthfully runnable platforms. */
function createAppConfig(
  definition: NavigatorExampleDefinition,
  platforms: readonly string[],
): Readonly<Record<string, unknown>> {
  return {
    expo: {
      name: `Navigator — ${definition.title}`,
      slug: `navigator-${definition.id}`,
      scheme: `navigator-${definition.id}`,
      version: '1.0.0',
      orientation: 'default',
      platforms,
      plugins: ['expo-router'],
      experiments: { typedRoutes: true },
      web: { output: 'static' },
    },
  };
}

/*** Create one isolated dependency graph from owner policy and the selected plan requirements. */
function createPackageManifest(
  definition: NavigatorExampleDefinition,
  requirements: readonly NavigatorDependencyRequirement[],
  generationPlatform: NavigatorRuntimePlatform | undefined,
): Readonly<Record<string, unknown>> {
  const dependencies = new Map<string, string>();
  const base = ['@ankhorage/navigator', 'expo', 'expo-router', 'react', 'react-native'];
  const supportsWeb = supportsWebTarget(generationPlatform, requirements);
  for (const packageName of [
    ...base,
    ...(supportsWeb ? ['react-dom', 'react-native-web'] : []),
    ...requirements.map(({ packageName }) => packageName),
  ]) {
    dependencies.set(packageName, resolvePackageRange(packageName));
  }
  const customPath =
    definition.customNavigatorRegistrations === undefined
      ? ''
      : ' --custom-navigators navigator.custom-navigators.ts';
  return {
    name: `navigator-example-${definition.id}`,
    version: '1.0.0',
    private: true,
    main: 'expo-router/entry',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
      typecheck: 'tsc --noEmit',
      'export:android': 'expo export --platform android --output-dir dist/android',
      'export:ios': 'expo export --platform ios --output-dir dist/ios',
      'export:web': 'expo export --platform web --output-dir dist/web',
      ...(generationPlatform === undefined
        ? {}
        : { 'generate:navigator': createGenerationScript(generationPlatform, customPath) }),
    },
    dependencies: Object.fromEntries(
      [...dependencies].sort(([left], [right]) => left.localeCompare(right)),
    ),
    devDependencies: {
      '@ankhorage/ankh': packageJson.devDependencies['@ankhorage/ankh'],
      '@types/react': packageJson.devDependencies['@types/react'],
      typescript: packageJson.devDependencies.typescript,
    },
    packageManager: packageJson.packageManager,
  };
}

/*** Decide whether the isolated app needs Web runtime peers. */
function supportsWebTarget(
  platform: NavigatorRuntimePlatform | undefined,
  requirements: readonly NavigatorDependencyRequirement[],
): boolean {
  return (
    platform === undefined ||
    platform === 'web' ||
    requirements.some(({ packageName }) => packageName === 'react-dom')
  );
}

/*** Render the example-local public CLI invocation without workspace paths. */
function createGenerationScript(platform: NavigatorRuntimePlatform, customPath: string): string {
  return `ankh navigator generate --manifest navigator.manifest.json --bindings navigator.bindings.json${customPath} --platform ${platform} --expo-router-version ${packageJson.devDependencies['expo-router']} --target .`;
}

/*** Resolve example versions from the package's published or acceptance dependency policy. */
function resolvePackageRange(packageName: string): string {
  if (packageName === packageJson.name) return packageJson.version;
  const development = Reflect.get(packageJson.devDependencies, packageName) as string | undefined;
  if (development !== undefined) return development;
  const peer = Reflect.get(packageJson.peerDependencies, packageName) as string | undefined;
  if (peer !== undefined && peer !== '*') return peer;
  throw new Error(
    `Navigator examples have no concrete package policy for ${JSON.stringify(packageName)}.`,
  );
}

/*** Create a strict Expo TypeScript configuration without a local Navigator alias. */
function createTypeScriptConfig(): Readonly<Record<string, unknown>> {
  return {
    extends: 'expo/tsconfig.base',
    compilerOptions: {
      baseUrl: '.',
      ignoreDeprecations: '6.0',
      paths: { '@/*': ['./src/*'] },
      strict: true,
    },
    include: [
      'expo-env.d.ts',
      'navigator.custom-navigators.ts',
      'src/**/*.ts',
      'src/**/*.tsx',
      '.expo/types/**/*.ts',
    ],
  };
}

/*** Render the executable custom registration consumed by the public CLI option. */
function renderCustomRegistry(): string {
  return `import { defineCustomNavigatorRegistry } from '@ankhorage/navigator';

export default defineCustomNavigatorRegistry([
  {
    id: 'example-tabs',
    platforms: ['android', 'ios', 'web'],
    stability: 'alpha',
    integration: 'expo-router-standard',
    router: 'tab',
    module: '@/navigators/registered-custom-navigator',
    exportName: 'RegisteredCustomNavigator',
    validateConfig: (config) =>
      config?.backBehavior === 'history'
        ? []
        : [{ code: 'invalid-back-behavior', path: '/backBehavior', message: 'Expected history.' }],
  },
]);
`;
}

/*** Serialize checked-in data files with stable formatting. */
function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
