import type { NavigatorRuntimePlatform } from './NavigatorRuntimePlatform';

export interface NavigatorValidationContext {
  platform: NavigatorRuntimePlatform;
  expoRouterVersion: string;
}
