/*** Read the major version only from an exact semantic Expo Router version. */
export function parseExpoRouterMajor(version: string): number | undefined {
  const match = /^(\d+)\.\d+\.\d+(?:[-+].*)?$/u.exec(version);
  return match?.[1] === undefined ? undefined : Number(match[1]);
}
