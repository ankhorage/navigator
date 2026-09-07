import type {
  AppNavigatorManifest,
  CreateNavigatorPlanOptions,
  NavigatorGenerationBindings,
  NavigatorGenerationOptions,
} from '@ankhorage/contracts/navigator';
import { isAppNavigatorManifest } from '@ankhorage/contracts/navigator';

import type { NavigatorCliOptions } from '../types/navigatorCli';
import { isNavigatorGenerationBindings } from './isNavigatorGenerationBindings';
import { loadCustomNavigatorRegistryAsync } from './loadCustomNavigatorRegistryAsync';
import { readNavigatorCliJsonAsync } from './readNavigatorCliJsonAsync';

/*** Load and narrow standalone manifest, binding, registry, and target-context CLI input. */
export async function loadNavigatorCliInputAsync(
  options: NavigatorCliOptions,
  cwd: string,
  requireBindings: boolean,
): Promise<LoadedNavigatorCliInput> {
  if (
    options.manifestPath === undefined ||
    options.platform === undefined ||
    options.expoRouterVersion === undefined
  ) {
    throw new Error('Manifest, platform, and Expo Router version are required.');
  }
  const manifest = await readNavigatorCliJsonAsync(options.manifestPath, cwd);
  if (!isAppNavigatorManifest(manifest)) {
    throw new Error('Manifest file must contain a structurally valid AppNavigatorManifest value.');
  }
  const bindings = await loadBindings(options.bindingsPath, cwd, requireBindings);
  const customNavigators = await loadCustomNavigatorRegistryAsync(
    options.customNavigatorsPath,
    cwd,
  );
  return {
    manifest,
    bindings,
    planOptions: {
      platform: options.platform,
      expoRouterVersion: options.expoRouterVersion,
      ...optional('responsiveSize', options.responsiveSize),
      ...optional('customNavigators', customNavigators),
    },
    generationOptions: {
      includeScreenFiles: options.includeScreenFiles,
      ...optional('rootDirectory', options.rootDirectory),
    },
  };
}

interface LoadedNavigatorCliInput {
  readonly manifest: AppNavigatorManifest;
  readonly bindings: NavigatorGenerationBindings | undefined;
  readonly planOptions: CreateNavigatorPlanOptions;
  readonly generationOptions: NavigatorGenerationOptions;
}

/*** Load required or optional generated-module bindings from JSON. */
async function loadBindings(
  path: string | undefined,
  cwd: string,
  required: boolean,
): Promise<NavigatorGenerationBindings | undefined> {
  if (path === undefined) {
    if (required) throw new Error('A bindings file is required for this command.');
    return undefined;
  }
  const bindings = await readNavigatorCliJsonAsync(path, cwd);
  if (!isNavigatorGenerationBindings(bindings)) {
    throw new Error('Bindings file must contain only valid module/symbol binding records.');
  }
  return bindings;
}

/*** Include one optional typed value without materializing undefined. */
function optional<Key extends 'customNavigators' | 'responsiveSize' | 'rootDirectory'>(
  key: Key,
  value: (CreateNavigatorPlanOptions & NavigatorGenerationOptions)[Key],
): Partial<Pick<CreateNavigatorPlanOptions & NavigatorGenerationOptions, Key>> {
  return value === undefined
    ? {}
    : ({ [key]: value } as Pick<CreateNavigatorPlanOptions & NavigatorGenerationOptions, Key>);
}
