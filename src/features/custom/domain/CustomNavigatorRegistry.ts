import type { CustomNavigatorRegistration } from './CustomNavigatorRegistration';

export type CustomNavigatorRegistry = Readonly<Record<string, CustomNavigatorRegistration>> & {
  readonly [CUSTOM_NAVIGATOR_REGISTRY]: true;
};

declare const CUSTOM_NAVIGATOR_REGISTRY: unique symbol;
