import type { StackImplementationConfig } from '@ankhorage/contracts/navigator';

export interface ResolvedStackConfigSource {
  config: StackImplementationConfig;
  pointer: string;
}
