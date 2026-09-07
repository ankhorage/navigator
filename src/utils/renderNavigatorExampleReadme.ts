import type {
  NavigatorExampleDefinition,
  NavigatorExampleDescriptor,
} from '../types/navigatorExamples';

/*** Render standalone install, generation, execution, and target-status documentation. */
export function renderNavigatorExampleReadme(
  definition: NavigatorExampleDefinition,
  descriptor: NavigatorExampleDescriptor,
  generationPlatform: string | undefined,
): string {
  const rows = descriptor.targets
    .map(
      ({ platform, support, capabilityIds, diagnostics }) =>
        `| ${platform} | ${support} | ${capabilityIds.join(', ') || 'none'} | ${diagnostics.map(({ code }) => code).join(', ') || 'none'} |`,
    )
    .join('\n');
  const generated =
    generationPlatform === undefined
      ? 'Navigator generation is intentionally rejected on every target. The runnable shell displays the expected diagnostics and must not be treated as a fallback implementation.'
      : `The checked-in Router files were generated for \`${generationPlatform}\` through the public Navigator API. The manifest uses an implementation whose generated source is shared by every supported target listed below.`;
  return `# ${definition.title}

${definition.description}

${generated}

## Target matrix

| Platform | Support | Capabilities | Diagnostics |
| --- | --- | --- | --- |
${rows}

## Install and run

\`\`\`sh
bun install --frozen-lockfile
bun run typecheck
bun run start
\`\`\`

Use \`bun run web\`, \`bun run ios\`, or \`bun run android\` only for targets reported as supported or testing-only above.

## Regenerate

From an installed Ankh CLI environment:

\`\`\`sh
ankh navigator examples generate --id ${definition.id} --target .
\`\`\`

The app declares only registry packages. It has its own lockfile and does not use a workspace, sibling source import, local tarball, or TypeScript path alias to Navigator.
`;
}
