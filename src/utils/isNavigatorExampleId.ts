import { createNavigatorExampleDefinitions } from '../features/catalog/domain/createNavigatorExampleDefinitions';
import type { NavigatorExampleId } from '../types/navigatorExamples';

/*** Check one CLI value against the package-owned example catalog. */
export function isNavigatorExampleId(value: string): value is NavigatorExampleId {
  return createNavigatorExampleDefinitions().some(({ id }) => id === value);
}
