import { describe, expect, test } from 'bun:test';

import * as navigation from './index';

describe('@ankhorage/zora-navigation public API', () => {
  test('stays empty until the implementation issue introduces navigation exports', () => {
    expect(Object.keys(navigation)).toEqual([]);
  });
});
