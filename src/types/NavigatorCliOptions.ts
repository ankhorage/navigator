import type {
  NavigatorResponsiveSize,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

export interface NavigatorCliOptions {
  readonly format: 'human' | 'json';
  readonly id?: string;
  readonly kind?: 'capability' | 'preset';
  readonly manifestPath?: string;
  readonly bindingsPath?: string;
  readonly customNavigatorsPath?: string;
  readonly targetDirectory?: string;
  readonly platform?: NavigatorRuntimePlatform;
  readonly expoRouterVersion?: string;
  readonly responsiveSize?: NavigatorResponsiveSize;
  readonly rootDirectory?: string;
  readonly includeScreenFiles: boolean;
}
