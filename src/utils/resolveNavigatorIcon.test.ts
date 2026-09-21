import { expect, test } from 'bun:test';

import { resolveNavigatorIcon } from './resolveNavigatorIcon';

test('keeps named font icons when the optional source field is undefined', () => {
  expect(
    resolveNavigatorIcon({ name: 'home-outline', provider: 'Ionicons', source: undefined }),
  ).toEqual({
    name: 'home-outline',
    provider: 'Ionicons',
    variant: undefined,
  });
});

test('uses a consumer resolver for media icons in adapters that accept them', () => {
  const reference = { mediaId: 'brand-mark' };
  expect(
    resolveNavigatorIcon({ source: reference }, (source) => ({ uri: source.mediaId })),
  ).toEqual({
    source: { uri: 'brand-mark' },
  });
});
