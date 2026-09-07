import { resolve } from 'node:path';

import { expect, test } from 'bun:test';
import ts from 'typescript';

import packageJson from '../package.json';

// Published symbol names are the compatibility contract, independent of internal file locations.
const publicSymbols = {
  '.': [
    'CustomNavigatorConfigIssue',
    'CustomNavigatorRegistration',
    'CustomNavigatorRegistry',
    'defineCustomNavigatorRegistry',
    'ExpoRouterNavigatorModule',
    'NavigatorAdapterId',
    'NavigatorAdapterPlan',
    'NavigatorApiStability',
    'NavigatorDiagnostic',
    'NavigatorGeneratedFile',
    'NavigatorGenerationBindings',
    'NavigatorGenerationOptions',
    'NavigatorNodePlan',
    'NavigatorPlan',
    'NavigatorResponsiveSize',
    'NavigatorRoutePlan',
    'NavigatorRuntimePlatform',
    'NavigatorScreenModule',
    'NavigatorSupportStatus',
    'NavigatorValidationContext',
    'ResolvedTabsImplementation',
    'ResolvedTabsPresentation',
    'TabsNavigatorPlan',
    'CreateNavigatorPlanOptions',
    'createNavigatorPlan',
    'resolveTabsNavigatorPlan',
    'generateNavigatorFiles',
    'ResolvedCustomTabsPresentation',
    'resolveCustomTabsPresentation',
    'resolveNavigatorPreset',
    'validateNavigatorManifest',
  ],
  './metadata': ['NAVIGATOR_PACKAGE_METADATA'],
  './tabs': [
    'CustomTabsIconSourceResolver',
    'CustomTabsLayout',
    'CustomTabsLayoutProps',
    'CustomTabsPresentationProps',
    'CustomTabsRoute',
  ],
  './tabs/native-icons': [
    'NativeFontAwesome5Family',
    'NativeFontAwesome6Family',
    'NativeFontAwesomeFamily',
    'NativeIoniconsFamily',
    'NativeMaterialDesignIconsFamily',
  ],
} as const;

test('preserves every published subpath and its resolved type and runtime exports', () => {
  expect(Object.keys(packageJson.exports).sort()).toEqual(
    [...Object.keys(publicSymbols), './package.json'].sort(),
  );
  expect(packageJson.main).toBe(packageJson.exports['.'].default);
  expect(packageJson.types).toBe(packageJson.exports['.'].types);
  const entries = Object.entries(publicSymbols).map(([subpath, symbols]) => {
    const entry = packageJson.exports[subpath as keyof typeof publicSymbols];
    expect(entry.types).toBe(entry.default.replace(/\.js$/u, '.d.ts'));
    return {
      file: resolve(
        import.meta.dir,
        '..',
        entry.default.replace('./dist/', './src/').replace(/\.js$/u, '.ts'),
      ),
      symbols,
    };
  });
  const program = ts.createProgram(
    entries.map((entry) => entry.file),
    {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      skipLibCheck: true,
      noEmit: true,
    },
  );
  const checker = program.getTypeChecker();
  for (const { file, symbols } of entries) {
    const source = program.getSourceFile(file);
    expect(source, file).toBeDefined();
    const module = source === undefined ? undefined : checker.getSymbolAtLocation(source);
    expect(module, file).toBeDefined();
    const exports = module === undefined ? [] : checker.getExportsOfModule(module);
    expect(exports.map((symbol) => symbol.name).sort(), file).toEqual([...symbols].sort());
    for (const symbol of exports) {
      const target =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      expect(target.declarations?.length, `${file}: ${symbol.name}`).toBeGreaterThan(0);
    }
  }
});
