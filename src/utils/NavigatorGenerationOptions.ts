/** Options for placing Navigator-owned files inside a consumer-owned Expo Router app shell. */
export interface NavigatorGenerationOptions {
  /** Directory that receives the root navigator layout. Must be `src/app` or one of its safe descendants. */
  rootDirectory?: string;
  /** Emit routed screen re-export modules in addition to layouts. Defaults to true. */
  includeScreenFiles?: boolean;
}
