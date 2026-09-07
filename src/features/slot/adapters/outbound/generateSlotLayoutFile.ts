import type { NavigatorGeneratedFile } from '../../../../utils/NavigatorGeneratedFile';

/*** Render a stateless Slot layout using the validated adapter import. */
export function generateSlotLayoutFile(
  directory: string,
  componentName: string,
  imports: string,
): NavigatorGeneratedFile {
  return {
    path: `${directory}/_layout.tsx`,
    contents: `${imports}\n\nexport default function NavigatorLayout() {\n  return <${componentName} />;\n}\n`,
  };
}
