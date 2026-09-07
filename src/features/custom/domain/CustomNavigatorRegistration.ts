import type { CustomNavigatorNode } from '@ankhorage/contracts/navigator';

import type { NavigatorApiStability } from '../../../utils/NavigatorApiStability';
import type { NavigatorRuntimePlatform } from '../../../utils/NavigatorRuntimePlatform';
import type { CustomNavigatorConfigIssue } from './CustomNavigatorConfigIssue';

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
