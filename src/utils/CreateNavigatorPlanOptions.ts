import type { CustomNavigatorRegistry } from '../features/custom/domain/CustomNavigatorRegistry';
import type { NavigatorResponsiveSize } from './NavigatorResponsiveSize';
import type { NavigatorRuntimePlatform } from './NavigatorRuntimePlatform';

export interface CreateNavigatorPlanOptions {
  platform: NavigatorRuntimePlatform;
  expoRouterVersion: string;
  responsiveSize?: NavigatorResponsiveSize;
  customNavigators?: CustomNavigatorRegistry;
}
