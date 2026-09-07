import type { NavigatorExampleDescriptor } from '../types/navigatorExamples';

/*** Render the root catalog index from the same public descriptors used for verification. */
export function renderNavigatorExamplesIndex(
  examples: readonly NavigatorExampleDescriptor[],
): string {
  const rows = examples
    .map(({ id, title, targets }) => {
      const statuses = targets.map(({ platform, support }) => `${platform}: ${support}`).join('; ');
      return `| [\`${id}\`](./${id}) | ${title} | ${statuses} |`;
    })
    .join('\n');
  return `# Navigator standalone examples

Each directory below is an isolated Expo Router application generated from its checked-in manifest and bindings through Navigator's public API. Every app owns its package metadata and lockfile and depends only on registry packages.

| Example | Composition | Target status |
| --- | --- | --- |
${rows}

## Generate and verify

From the Navigator repository root:

\`\`\`sh
bun run examples:generate
bun run examples:verify
bun run examples:validate
\`\`\`

Open an individual directory for its install, run, target-support, and diagnostics instructions. Unsupported compositions remain catalogued explicitly and are not counted as runtime support.
`;
}
