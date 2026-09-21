import { expect, test } from 'bun:test';

import { resolveWorkspaceNavigation } from './resolveWorkspaceNavigation';

const routes = [
  { id: 'home', label: 'Home', href: '/admin' },
  { id: 'apis', label: 'APIs', href: '/admin/apis' },
  { id: 'catalog', label: 'Catalog', href: '/admin/apis/catalog', parentId: 'apis' },
  {
    id: 'detail',
    label: 'Detail',
    href: '/admin/apis/catalog/42',
    parentId: 'catalog',
    visible: false,
  },
] as const;

test('highlights the selected destination and visible ancestors of a hidden detail route', () => {
  expect(resolveWorkspaceNavigation(routes, 'detail')).toEqual([
    { ...routes[0], active: false, selected: false, depth: 0 },
    { ...routes[1], active: true, selected: false, depth: 0 },
    { ...routes[2], active: true, selected: false, depth: 1 },
  ]);
});

test('keeps a contextual destination visible but unavailable without an href', () => {
  const resolved = resolveWorkspaceNavigation(
    [...routes, { id: 'properties', label: 'Properties', href: null }],
    'home',
  );
  expect(resolved.at(-1)).toMatchObject({ href: null, active: false, depth: 0 });
});

test('rejects duplicate, orphaned, and cyclic route definitions', () => {
  expect(() => resolveWorkspaceNavigation([routes[0], routes[0]], 'home')).toThrow('unique');
  expect(() =>
    resolveWorkspaceNavigation(
      [{ id: 'orphan', label: 'Orphan', href: '/', parentId: 'absent' }],
      '',
    ),
  ).toThrow('unknown parent');
  expect(() =>
    resolveWorkspaceNavigation(
      [
        { id: 'a', label: 'A', href: '/a', parentId: 'b' },
        { id: 'b', label: 'B', href: '/b', parentId: 'a' },
      ],
      'a',
    ),
  ).toThrow('parent cycle');
});
