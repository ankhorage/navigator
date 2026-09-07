import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type {
  NavigatorExampleId,
  NavigatorExampleVerificationResult,
} from '../types/navigatorExamples';
import { generateNavigatorExamples } from './generateNavigatorExamples';

/*** Verify checked-in example bytes and app-owned lockfiles against deterministic generation. */
export async function verifyNavigatorExamplesAsync(
  targetDirectory: string,
  cwd: string,
  id?: NavigatorExampleId,
): Promise<NavigatorExampleVerificationResult> {
  const generated = generateNavigatorExamples(id);
  const root = resolve(cwd, targetDirectory);
  const results = await Promise.all(
    generated.examples.map(async (example) => {
      const prefix = `examples/${example.id}/`;
      const files = generated.files.filter(({ path }) => path.startsWith(prefix));
      const comparisons = await Promise.all(
        files.map(async (file) => ({
          path: file.path,
          actual: await readOptionalFile(resolve(root, file.path)),
          expected: file.contents,
        })),
      );
      const lockPath = `${prefix}bun.lock`;
      const lock = await readOptionalFile(resolve(root, lockPath));
      const missingFiles = [
        ...comparisons.filter(({ actual }) => actual === undefined).map(({ path }) => path),
        ...(lock === undefined ? [lockPath] : []),
      ];
      const changedFiles = comparisons
        .filter(
          ({ path, actual, expected }) =>
            actual !== undefined && !matchesGeneratedFile(path, actual, expected),
        )
        .map(({ path }) => path);
      return {
        id: example.id,
        current: missingFiles.length === 0 && changedFiles.length === 0,
        missingFiles,
        changedFiles,
      };
    }),
  );
  return { examples: results, verified: results.every(({ current }) => current) };
}

/*** Read one expected file while treating absence as verification data. */
async function readOptionalFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

/*** Compare semantic data and Navigator-owned route output without coupling to formatter whitespace. */
function matchesGeneratedFile(path: string, actual: string, expected: string): boolean {
  if (path.endsWith('.json')) return canonicalJson(actual) === canonicalJson(expected);
  if (path.includes('/src/app/') || path.includes('/src/guards/')) return actual === expected;
  if (path.endsWith('/navigator.custom-navigators.ts')) return actual === expected;
  return true;
}

/*** Normalize JSON while preserving array order and object insertion order. */
function canonicalJson(contents: string): string | undefined {
  try {
    return JSON.stringify(JSON.parse(contents) as unknown);
  } catch {
    return undefined;
  }
}
