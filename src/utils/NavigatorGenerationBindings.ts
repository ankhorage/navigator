import type { NavigatorScreenModule } from './NavigatorScreenModule';

export interface NavigatorGenerationBindings {
  screens: Readonly<Record<string, NavigatorScreenModule>>;
  guards: Readonly<Record<string, NavigatorScreenModule>>;
  iconSourceResolver?: NavigatorScreenModule;
  flows?: {
    onboardingRoute?: string;
    authenticationRoute?: string;
  };
  tabPresentations?: Readonly<Record<string, NavigatorScreenModule>>;
}
