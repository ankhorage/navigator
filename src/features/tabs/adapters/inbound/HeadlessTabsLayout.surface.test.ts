import { expect, test } from 'bun:test';

test('current Surface runtime provides headless-tabs layout primitives', async () => {
  const surface = await import('@ankhorage/surface');

  expect(typeof surface.Divider).toBe('function');
  expect(typeof surface.View).toBe('function');
  expect(typeof surface.useBreakpoint).toBe('function');
});
