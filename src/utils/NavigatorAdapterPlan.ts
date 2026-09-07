import type { NavigatorAdapterId } from './NavigatorAdapterId';
import type { NavigatorApiStability } from './NavigatorApiStability';
import type { NavigatorSupportStatus } from './NavigatorSupportStatus';

export interface NavigatorAdapterPlan {
  id: NavigatorAdapterId;
  /** Built-in Expo Router entry point or an explicitly registered custom module. */
  module?: string;
  exportName?: string;
  support: NavigatorSupportStatus;
  stability: NavigatorApiStability;
  limitations: readonly string[];
}
