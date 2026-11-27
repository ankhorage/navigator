import type { NavigatorScreenModule } from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString } from '@ankhorage/utility/string';

/*** Render static adapter, optional root-wrapper, and guard imports for one generated layout. */
export function createNavigatorLayoutImports(
  adapterModule: string,
  componentName: string,
  guardImports: readonly string[],
  rootLayoutWrapper: NavigatorScreenModule | undefined,
): string {
  const wrapperImport =
    rootLayoutWrapper === undefined
      ? []
      : [
          `import { ${rootLayoutWrapper.exportName} as NavigatorRootLayoutWrapper } from ${quoteJavaScriptString(rootLayoutWrapper.module)};`,
        ];
  return [
    `import { ${componentName} } from ${quoteJavaScriptString(adapterModule)};`,
    ...wrapperImport,
    ...(guardImports.length > 0 ? ['', ...guardImports] : []),
  ].join('\n');
}
