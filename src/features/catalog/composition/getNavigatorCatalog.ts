import type { NavigatorCatalog } from '@ankhorage/contracts/navigator';

import packageJson from '../../../../package.json' with { type: 'json' };
import { createNavigatorCatalog } from '../domain/createNavigatorCatalog.js';

/*** Return the package-owned catalog with dependencies derived from published owner metadata. */
export function getNavigatorCatalog(): NavigatorCatalog {
  return createNavigatorCatalog({
    packageName: packageJson.name,
    version: packageJson.version,
    peerDependencies: packageJson.peerDependencies,
  });
}
