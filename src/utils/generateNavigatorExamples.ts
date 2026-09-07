import type {
  NavigatorDependencyRequirement,
  NavigatorGeneratedFile,
  NavigatorRuntimePlatform,
} from '@ankhorage/contracts/navigator';

import { getNavigatorExampleCatalog } from '../features/catalog/adapters/inbound/getNavigatorExampleCatalog';
import { createNavigatorExampleDefinitions } from '../features/catalog/domain/createNavigatorExampleDefinitions';
import type {
  NavigatorExampleDefinition,
  NavigatorExampleDescriptor,
  NavigatorExampleGenerationResult,
  NavigatorExampleId,
  NavigatorExampleTarget,
} from '../types/navigatorExamples';
import { createNavigatorExamplePlan } from './createNavigatorExamplePlan';
import { createNavigatorExampleScaffold } from './createNavigatorExampleScaffold';
import { generateNavigator } from './generateNavigator';
import { renderNavigatorExamplesIndex } from './renderNavigatorExamplesIndex';

/*** Generate one or every complete root examples application as a deterministic file set. */
export function generateNavigatorExamples(
  id?: NavigatorExampleId,
): NavigatorExampleGenerationResult {
  const definitions = selectDefinitions(id);
  const descriptors = getNavigatorExampleCatalog().filter((descriptor) =>
    definitions.some((definition) => definition.id === descriptor.id),
  );
  const files = definitions.flatMap((definition) => {
    const descriptor = descriptors.find((candidate) => candidate.id === definition.id);
    if (descriptor === undefined) throw new Error(`Missing example descriptor ${definition.id}.`);
    return generateExample(definition, descriptor);
  });
  const index =
    id === undefined
      ? [{ path: 'examples/README.md', contents: renderNavigatorExamplesIndex(descriptors) }]
      : [];
  return {
    examples: descriptors,
    files: [...files, ...index].sort((left, right) => left.path.localeCompare(right.path)),
  };
}

/*** Select one stable example id or return the complete catalog. */
function selectDefinitions(
  id: NavigatorExampleId | undefined,
): readonly NavigatorExampleDefinition[] {
  const definitions = createNavigatorExampleDefinitions();
  if (id === undefined) return definitions;
  const selected = definitions.find((definition) => definition.id === id);
  if (selected === undefined) throw new Error(`Unknown Navigator example ${JSON.stringify(id)}.`);
  return [selected];
}

/*** Generate one prefixed app from a supported target or an explicit unsupported shell. */
function generateExample(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
): readonly NavigatorGeneratedFile[] {
  const generationPlatform = selectGenerationPlatform(descriptor);
  const generations = supportedPlatforms(descriptor).map((platform) => {
    const plan = createNavigatorExamplePlan(definition, platform);
    return { plan, result: generateNavigator(plan, definition.bindings), platform };
  });
  const selected = generations.find(({ platform }) => platform === generationPlatform);
  const requirements = mergeRequirements(generations.flatMap(({ plan }) => plan.dependencies));
  const navigatorFiles = selected?.result.files ?? [];
  const scaffold = createNavigatorExampleScaffold(
    definition,
    descriptor,
    requirements,
    generationPlatform,
  );
  return [...scaffold, ...navigatorFiles].map((file) => ({
    path: `examples/${definition.id}/${file.path}`,
    contents: file.contents,
  }));
}

/*** Choose Web when supported, then iOS, then Android for stable checked-in source. */
function selectGenerationPlatform(
  descriptor: NavigatorExampleDescriptor,
): NavigatorRuntimePlatform | undefined {
  return (['web', 'ios', 'android'] as const).find((platform) =>
    descriptor.targets.some(
      (target) => target.platform === platform && target.support !== 'unsupported',
    ),
  );
}

/*** Return every target that can truthfully execute the composition. */
function supportedPlatforms(
  descriptor: NavigatorExampleDescriptor,
): readonly NavigatorRuntimePlatform[] {
  return descriptor.targets.filter(isSupportedTarget).map(({ platform }) => platform);
}

/*** Narrow one catalog target to an executable support claim. */
function isSupportedTarget(target: NavigatorExampleTarget): boolean {
  return target.support !== 'unsupported';
}

/*** Merge target-aware requirements without weakening concrete version policy. */
function mergeRequirements(
  requirements: readonly NavigatorDependencyRequirement[],
): readonly NavigatorDependencyRequirement[] {
  const byPackage = new Map<string, NavigatorDependencyRequirement>();
  for (const requirement of requirements) {
    const current = byPackage.get(requirement.packageName);
    if (current !== undefined && current.versionRange !== requirement.versionRange) {
      throw new Error(`Example dependency policy differs for ${requirement.packageName}.`);
    }
    byPackage.set(requirement.packageName, requirement);
  }
  return [...byPackage.values()].sort((left, right) =>
    left.packageName.localeCompare(right.packageName),
  );
}
