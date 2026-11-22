import type { NavigatorPlan, NavigatorRuntimePlatform } from '@ankhorage/contracts/navigator';

import packageJson from '../../package.json' with { type: 'json' };
import { defineCustomNavigatorRegistry } from '../features/custom/domain/defineCustomNavigatorRegistry.js';
import type { NavigatorExampleDefinition } from '../types/navigatorExamples.js';
import { createNavigatorPlan } from './createNavigatorPlan.js';

/*** Resolve one example through the same public planning policy used by library and CLI consumers. */
export function createNavigatorExamplePlan(
  definition: NavigatorExampleDefinition,
  platform: NavigatorRuntimePlatform,
): NavigatorPlan {
  const registrations = definition.customNavigatorRegistrations;
  return createNavigatorPlan(definition.manifest, {
    platform,
    expoRouterVersion: packageJson.devDependencies['expo-router'],
    ...(registrations === undefined
      ? {}
      : { customNavigators: defineCustomNavigatorRegistry(registrations) }),
  });
}
