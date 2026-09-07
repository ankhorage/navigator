import packageJson from '../../package.json';
import { getNavigatorCatalog } from '../features/catalog/adapters/inbound/getNavigatorCatalog';

/*** Publish package identity and the single Navigator-owned capability catalog. */
export const NAVIGATOR_PACKAGE_METADATA = {
  packageName: packageJson.name,
  version: packageJson.version,
  manifestProperty: 'navigator',
  contractSubpath: '@ankhorage/contracts/navigator',
  precedence: ['platform override', 'node configuration', 'manifest default', 'stable default'],
  catalog: getNavigatorCatalog(),
} as const;
