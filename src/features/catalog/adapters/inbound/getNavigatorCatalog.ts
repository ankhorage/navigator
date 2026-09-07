import type { NavigatorCatalog } from '@ankhorage/contracts/navigator';

import packageJson from '../../../../../package.json';
import { createNavigatorCatalog } from '../../domain/createNavigatorCatalog';

/*** Return the package-owned catalog with dependencies derived from published owner metadata. */
export function getNavigatorCatalog(): NavigatorCatalog {
  return createNavigatorCatalog({
    packageName: packageJson.name,
    version: packageJson.version,
    peerDependencies: packageJson.peerDependencies,
  });
}
