import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/*** Read one explicit CLI input as unknown JSON for owner-boundary parsing. */
export async function readNavigatorCliJson(path: string, cwd: string): Promise<unknown> {
  const source = await readFile(resolve(cwd, path), 'utf8');
  return JSON.parse(source) as unknown;
}
