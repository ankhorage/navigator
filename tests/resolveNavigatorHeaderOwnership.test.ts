import { describe, expect, test } from 'bun:test';
import type { AppNavigatorManifest } from '@ankhorage/contracts/navigator';
import expoRouterPackage from 'expo-router/package.json' with { type: 'json' };

import { createNavigatorPlan, resolveNavigatorHeaderOwnership } from '../src/navigator';

function resolve(manifest: AppNavigatorManifest, externalHeaderVisible = false) {
  const plan = createNavigatorPlan(manifest, {
    expoRouterVersion: expoRouterPackage.version,
    platform: 'web',
  });
  return resolveNavigatorHeaderOwnership(plan, { externalHeaderVisible, screenId: 'home' });
}

describe('resolveNavigatorHeaderOwnership', () => {
  test('assigns an otherwise visible Stack header to Navigator', () => {
    expect(
      resolve({
        type: 'stack',
        routes: [{ name: 'home', label: 'Home', screenId: 'home' }],
      }),
    ).toEqual({
      owner: 'navigator',
      navigatorHeaders: [{ navigatorPointer: '', routeName: 'home', title: 'Home' }],
    });
  });

  test('assigns external app chrome when the Stack header is explicitly hidden', () => {
    expect(
      resolve(
        {
          type: 'stack',
          options: { headerShown: false },
          routes: [{ name: 'home', screenId: 'home' }],
        },
        true,
      ),
    ).toEqual({ owner: 'external', navigatorHeaders: [] });
  });

  test('reports a conflict instead of silently accepting two visible headers', () => {
    expect(
      resolve(
        {
          type: 'stack',
          routes: [{ name: 'home', screenId: 'home' }],
        },
        true,
      ),
    ).toMatchObject({ owner: 'conflict', navigatorHeaders: [{ routeName: 'home' }] });
  });

  test('reports stacked headers on one nested active path as a conflict', () => {
    expect(
      resolve({
        type: 'stack',
        routes: [
          {
            name: 'workspace',
            navigator: {
              type: 'stack',
              routes: [{ name: 'home', screenId: 'home' }],
            },
          },
        ],
      }),
    ).toMatchObject({
      owner: 'conflict',
      navigatorHeaders: [{ routeName: 'workspace' }, { routeName: 'home' }],
    });
  });
});
