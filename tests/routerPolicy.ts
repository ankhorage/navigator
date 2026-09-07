import expoRouterPackage from 'expo-router/package.json';

export const EXPO_ROUTER_VERSION = expoRouterPackage.version;

export function expoRouterVersionBefore(minimumMajor: number): string {
  return `${minimumMajor - 1}.0.0`;
}
