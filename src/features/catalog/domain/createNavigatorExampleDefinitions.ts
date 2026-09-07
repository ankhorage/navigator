import type { NavigatorExampleDefinition } from '../../../types/navigatorExamples';
import { createCoreNavigatorExamples } from './createCoreNavigatorExamples';
import { createCustomNavigatorExamples } from './createCustomNavigatorExamples';
import { createDrawerNavigatorExamples } from './createDrawerNavigatorExamples';
import { createSplitViewNavigatorExamples } from './createSplitViewNavigatorExamples';
import { createTabsNavigatorExamples } from './createTabsNavigatorExamples';

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
