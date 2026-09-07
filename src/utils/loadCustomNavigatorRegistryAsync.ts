import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { CustomNavigatorRegistry } from '@ankhorage/contracts/navigator';

/*** Load an explicit consumer-owned custom navigator registry module. */
export async function loadCustomNavigatorRegistryAsync(
  path: string | undefined,
  cwd: string,
): Promise<CustomNavigatorRegistry | undefined> {
  if (path === undefined) return undefined;
  const loaded = (await import(pathToFileURL(resolve(cwd, path)).href)) as Record<string, unknown>;
  const candidate = loaded.customNavigators ?? loaded.default;
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    throw new Error(
      'Custom navigator module must export customNavigators or a default registry created by defineCustomNavigatorRegistry.',
    );
  }
  for (const registration of Object.values(candidate)) {
    if (
      typeof registration !== 'object' ||
      registration === null ||
      typeof Reflect.get(registration, 'validateConfig') !== 'function'
    ) {
      throw new Error('Custom navigator module contains an invalid registration.');
    }
  }
  return candidate as CustomNavigatorRegistry;
}
