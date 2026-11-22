import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples.js';
import { createCoreNavigatorExamples } from './createCoreNavigatorExamples.js';
import { createCustomNavigatorExamples } from './createCustomNavigatorExamples.js';
import { createDrawerNavigatorExamples } from './createDrawerNavigatorExamples.js';
import { createSplitViewNavigatorExamples } from './createSplitViewNavigatorExamples.js';
import { createTabsNavigatorExamples } from './createTabsNavigatorExamples.js';

/*** Return every required standalone example composition in stable identifier order. */
export function createNavigatorExampleDefinitions(): readonly NavigatorExampleDefinition[] {
  return [
    ...createCoreNavigatorExamples(),
    ...createCustomNavigatorExamples(),
    ...createDrawerNavigatorExamples(),
    ...createSplitViewNavigatorExamples(),
    ...createTabsNavigatorExamples(),
  ].sort((left, right) => left.id.localeCompare(right.id));
}
