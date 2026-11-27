import type { NavigatorGeneratedFile } from '@ankhorage/contracts/navigator';

/*** Render a stateless Slot layout using the validated adapter import. */
export function generateSlotLayoutFile(
  directory: string,
  componentName: string,
  imports: string,
  hasRootLayoutWrapper = false,
): NavigatorGeneratedFile {
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${imports}\n\nexport default function NavigatorLayout() {\n  return ${hasRootLayoutWrapper ? `<NavigatorRootLayoutWrapper><${componentName} /></NavigatorRootLayoutWrapper>` : `<${componentName} />`};\n}\n`,
  };
}
