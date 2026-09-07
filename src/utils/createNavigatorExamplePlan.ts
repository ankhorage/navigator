import type { NavigatorPlan, NavigatorRuntimePlatform } from '@ankhorage/contracts/navigator';

import packageJson from '../../package.json';
import { defineCustomNavigatorRegistry } from '../features/custom/domain/defineCustomNavigatorRegistry';
import type { NavigatorExampleDefinition } from '../types/navigatorExamples';
import { createNavigatorPlan } from './createNavigatorPlan';

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
