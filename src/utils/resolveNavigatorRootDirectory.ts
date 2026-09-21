/*** Resolve a safe directory below the Expo Router app root without filesystem normalization. */
export function resolveNavigatorRootDirectory(rootDirectory: string | undefined): string {
  const directory = rootDirectory ?? 'src/app';
  const segments = directory.split('/');
  if (
    segments[0] !== 'src' ||
    segments[1] !== 'app' ||
    segments.length < 2 ||
    segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..') ||
    segments.slice(2).some((segment) => !/^[A-Za-z0-9_.()[\]-]+$/u.test(segment))
  ) {
    throw new Error(
      `Navigator root directory ${JSON.stringify(directory)} must be src/app or a safe descendant.`,
    );
  }
  return directory;
}
