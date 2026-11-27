import type { NavigatorGeneratedFile, NavigatorNodePlan } from '@ankhorage/contracts/navigator';
import { quoteJavaScriptString } from '@ankhorage/utility/string';

import { resolveExpoRouterRoutePath } from '../../domain/resolveExpoRouterRoutePath.js';

/*** Generate an opt-in Expo Router root redirect from the root navigator's configured initial route. */
export function generateRootRedirectFile(
  root: NavigatorNodePlan,
  directory: string,
): NavigatorGeneratedFile | undefined {
  if (root.initialRouteName === undefined) return undefined;
  const route = root.routes.find(({ name }) => name === root.initialRouteName);
  if (route === undefined)
    throw new Error(`Missing initial route ${JSON.stringify(root.initialRouteName)}.`);
  const expoRouterPath = resolveExpoRouterRoutePath(route);
  if (expoRouterPath === 'index') return undefined;
  if (route.path === undefined) {
    throw new Error(
      `Root redirect target ${JSON.stringify(root.initialRouteName)} requires a public route path.`,
    );
  }
  return {
    path: `${directory}/index.tsx`,
    contents: `import { Redirect } from 'expo-router';\n\nexport default function NavigatorRootRedirect() {\n  return <Redirect href=${quoteJavaScriptString(route.path)} />;\n}\n`,
  };
}
