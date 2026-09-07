import type {
  NavigatorAdapterPlan,
  NavigatorRuntimePlatform,
  StackImplementationConfig,
} from '@ankhorage/contracts/navigator';

/*** Resolve a Stack implementation to its version- and platform-aware Expo Router adapter. */
export function createStackAdapter(
  stack: StackImplementationConfig | undefined,
  platform: NavigatorRuntimePlatform,
  routerMajor: number | undefined,
): NavigatorAdapterPlan {
  const implementation = stack?.implementation ?? 'native';
  if (implementation === 'javascript') {
    return {
      id: 'stack.javascript',
      module: 'expo-router/js-stack',
      exportName: 'Stack',
      support: routerMajor !== undefined && routerMajor >= 56 ? 'supported' : 'unsupported',
      stability: 'stable',
      limitations: ['Requires Expo Router 56.0.0 or newer.'],
    };
  }
  if (implementation === 'experimental') {
    return {
      id: 'stack.experimental',
      module: 'expo-router',
      exportName: 'ExperimentalStack',
      support: routerMajor !== undefined && routerMajor >= 56 ? 'testing-only' : 'unsupported',
      stability: 'alpha',
      limitations:
        platform === 'web'
          ? ['Testing-only API; Expo Router falls back to the standard Stack on web.']
          : [
              'Testing-only API; supports only title and header visibility options.',
              ...(platform === 'android'
                ? [
                    'Cannot coexist with the standard native Stack on Android.',
                    'Requires android.predictiveBackGestureEnabled in app config.',
                  ]
                : []),
            ],
    };
  }
  return {
    id: 'stack.native',
    module: 'expo-router',
    exportName: 'Stack',
    support: 'supported',
    stability: 'stable',
    limitations: [],
  };
}
