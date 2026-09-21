import type { NavigatorGeneratedFile, NavigatorScreenModule } from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString } from '@ankhorage/utility/string';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

import { resolveNavigatorRootDirectory } from '../../../../utils/resolveNavigatorRootDirectory';

/*** Generate an Expo Router workspace layout from consumer-owned runtime and access bindings. */
export function generateWorkspaceLayout(input: {
  readonly rootDirectory: string;
  readonly useWorkspace: NavigatorScreenModule;
  readonly accessGate?: NavigatorScreenModule;
}): NavigatorGeneratedFile {
  const directory = resolveNavigatorRootDirectory(input.rootDirectory);
  assertStaticImportBinding(
    input.useWorkspace.module,
    input.useWorkspace.exportName,
    'Workspace runtime binding',
  );
  if (input.accessGate !== undefined) {
    assertStaticImportBinding(
      input.accessGate.module,
      input.accessGate.exportName,
      'Workspace access gate',
    );
  }

  const gateImport =
    input.accessGate === undefined
      ? ''
      : `import { ${input.accessGate.exportName} as WorkspaceAccessGate } from ${quoteJavaScriptString(input.accessGate.module)};\n`;
  const contents = `import { WorkspaceNavigator } from '@ankhorage/navigator/workspace';
import { ${input.useWorkspace.exportName} as useWorkspaceBinding } from ${quoteJavaScriptString(input.useWorkspace.module)};
${gateImport}
function WorkspaceContent() {
  const workspace = useWorkspaceBinding();
  return <WorkspaceNavigator {...workspace} />;
}

export default function NavigatorWorkspaceLayout() {
  return ${input.accessGate === undefined ? '<WorkspaceContent />' : '<WorkspaceAccessGate><WorkspaceContent /></WorkspaceAccessGate>'};
}
`;
  return { path: `${directory}/_layout.tsx`, contents };
}
