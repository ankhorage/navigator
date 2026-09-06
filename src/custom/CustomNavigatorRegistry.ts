import type { CustomNavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorApiStability, NavigatorRuntimePlatform } from '../definitions/NavigatorPlan';
import { assertModuleBinding } from '../generation/generationSafety';

export interface CustomNavigatorConfigIssue {
  code: string;
  message: string;
  path?: string;
}

export interface CustomNavigatorRegistration {
  readonly id: string;
  readonly platforms: readonly NavigatorRuntimePlatform[];
  readonly stability: NavigatorApiStability;
  readonly integration: 'expo-router-standard';
  readonly router: 'stack' | 'tab';
  readonly module: string;
  readonly exportName: string;
  readonly validateConfig: (
    config: CustomNavigatorNode['config'],
  ) => readonly CustomNavigatorConfigIssue[];
}

declare const CUSTOM_NAVIGATOR_REGISTRY: unique symbol;

export type CustomNavigatorRegistry = Readonly<Record<string, CustomNavigatorRegistration>> & {
  readonly [CUSTOM_NAVIGATOR_REGISTRY]: true;
};

const REGISTRATION_ID = /^[A-Za-z][A-Za-z0-9._-]*$/u;
const RUNTIME_PLATFORMS = new Set<NavigatorRuntimePlatform>(['android', 'ios', 'web']);

/*** Define an immutable, duplicate-free custom navigator registry for one composition boundary. */
export function defineCustomNavigatorRegistry(
  registrations: readonly CustomNavigatorRegistration[],
): CustomNavigatorRegistry {
  const registry = Object.create(null) as Record<string, CustomNavigatorRegistration>;
  for (const registration of registrations) {
    if (!REGISTRATION_ID.test(registration.id)) {
      throw new Error(
        `Invalid custom navigator registration id ${JSON.stringify(registration.id)}.`,
      );
    }
    if (Object.hasOwn(registry, registration.id)) {
      throw new Error(
        `Duplicate custom navigator registration id ${JSON.stringify(registration.id)}.`,
      );
    }
    if (
      registration.platforms.length === 0 ||
      new Set(registration.platforms).size !== registration.platforms.length ||
      registration.platforms.some((platform) => !RUNTIME_PLATFORMS.has(platform))
    ) {
      throw new Error(
        `Custom navigator ${JSON.stringify(registration.id)} must declare unique supported platforms.`,
      );
    }
    if (typeof registration.validateConfig !== 'function') {
      throw new Error(
        `Custom navigator ${JSON.stringify(registration.id)} must provide a config validator.`,
      );
    }
    assertModuleBinding(registration, `Custom navigator ${JSON.stringify(registration.id)}`);
    registry[registration.id] = Object.freeze({
      ...registration,
      platforms: Object.freeze([...registration.platforms]),
    });
  }
  return Object.freeze(registry) as CustomNavigatorRegistry;
}
