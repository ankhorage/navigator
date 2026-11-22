import { expect, test } from 'bun:test';

import { resolveNavigatorIcon } from './resolveNavigatorIcon';

test('preserves named font icon metadata for the presentation owner', () => {
  expect(
    resolveNavigatorIcon({ name: 'home-outline', provider: 'Ionicons', source: undefined }),
  ).toEqual({ name: 'home-outline', provider: 'Ionicons', source: undefined });
});

test('preserves media icon metadata without requiring a Surface resolver', () => {
  const reference = { mediaId: 'brand-mark' };
  expect(resolveNavigatorIcon({ source: reference })).toEqual({ source: reference });
});
