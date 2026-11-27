import type {
  NavigatorGeneratedFile,
  NavigatorRoutePlan,
  NavigatorScreenModule,
} from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString } from '@ankhorage/utility/string';
import { assertStaticImportBinding } from '@ankhorage/utility/validation';

import { resolveExpoRouterRoutePath } from '../../domain/resolveExpoRouterRoutePath.js';

/*** Generate one routed screen re-export from its validated consumer binding. */
export function generateScreenFile(
  route: NavigatorRoutePlan,
  directory: string,
  screens: Readonly<Record<string, NavigatorScreenModule>>,
): NavigatorGeneratedFile | undefined {
  if (route.screenId === undefined) return undefined;
  const binding = Reflect.get(screens, route.screenId) as NavigatorScreenModule | undefined;
  if (binding === undefined)
    throw new Error(`Missing screen binding for ${JSON.stringify(route.screenId)}.`);
  assertStaticImportBinding(
    binding.module,
    binding.exportName,
    `Screen ${JSON.stringify(route.screenId)}`,
  );
  return {
    path: `${directory}/${resolveExpoRouterRoutePath(route)}.tsx`,
    contents: `export { ${binding.exportName} as default } from ${quoteJavaScriptString(binding.module)};\n`,
  };
}
