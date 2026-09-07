import { assertModuleBinding } from '../../../utils/assertModuleBinding';
import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import type { CustomNavigatorRegistration } from './CustomNavigatorRegistration';
import type { CustomNavigatorRegistry } from './CustomNavigatorRegistry';

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

const REGISTRATION_ID = /^[A-Za-z][A-Za-z0-9._-]*$/u;

const RUNTIME_PLATFORMS = new Set<NavigatorRuntimePlatform>(['android', 'ios', 'web']);
