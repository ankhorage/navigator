import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, parse, relative, resolve, sep } from 'node:path';

import type { NavigatorGeneratedFile } from '@ankhorage/contracts/navigator';

/*** Materialize a prevalidated generated file set below one explicit target directory. */
export async function writeNavigatorGeneratedFiles(
  targetDirectory: string,
  cwd: string,
  files: readonly NavigatorGeneratedFile[],
): Promise<readonly string[]> {
  const root = resolve(cwd, targetDirectory);
  if (parse(root).root === root) {
    throw new Error('Navigator target directory cannot be a filesystem root.');
  }
  const destinations = files.map((file) => ({
    file,
    destination: resolve(root, file.path),
  }));
  for (const { file, destination } of destinations) {
    const local = relative(root, destination).split(sep).join('/');
    if (local.startsWith('..') || local === '' || local !== file.path) {
      throw new Error(`Generated path ${JSON.stringify(file.path)} escapes the target directory.`);
    }
  }
  for (const { file, destination } of destinations) {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.contents, 'utf8');
  }
  return files.map(({ path }) => path);
}
