import { areCapabilitiesEqual, isCapability } from '@ankhorage/contracts/capabilities';
import { describe, expect, test } from 'bun:test';

import packageJson from '../package.json';
import { CAPABILITIES } from '../src/capabilities';
import createCliProvider from '../src/cli/createCliProvider';

describe('Navigator capability catalog', () => {
  test('keeps package metadata aligned with the published source catalog', () => {
    expect(CAPABILITIES.every(isCapability)).toBe(true);
    expect(new Set(CAPABILITIES.map(({ id }) => id)).size).toBe(CAPABILITIES.length);
    expect(packageJson.ankh.capabilities).toHaveLength(CAPABILITIES.length);
    for (const capability of CAPABILITIES) {
      const metadata = packageJson.ankh.capabilities.find(({ id }) => id === capability.id);
      expect(metadata).toBeDefined();
      if (!isCapability(metadata)) throw new Error(`Invalid metadata for ${capability.id}.`);
      expect(areCapabilitiesEqual(metadata, capability)).toBe(true);
    }
  });

  test('exports canonical descriptors through the Ankh provider', () => {
    expect(createCliProvider.capabilities).toBe(CAPABILITIES);
    expect(createCliProvider.capabilities.every(isCapability)).toBe(true);
  });

  test('publishes the proven portable navigation invocation without a speculative result', () => {
    const navigation = CAPABILITIES.find(({ id }) => id === 'navigator.navigate');

    expect(navigation).toEqual({
      id: 'navigator.navigate',
      owner: '@ankhorage/navigator',
      access: ['invoke'],
      binding: { kind: 'action', bindableAs: ['target'] },
      label: 'Navigate',
      input: {
        schema: {
          type: 'object',
          required: ['route'],
          properties: {
            route: { type: 'string' },
            params: { type: 'object', additionalProperties: true },
          },
        },
      },
    });
    expect(navigation).not.toHaveProperty('output');
  });

  test('assigns every command to one distinct published Navigator capability', () => {
    const commandIds = createCliProvider.commands.map(({ capability }) => capability).sort();

    expect(new Set(commandIds).size).toBe(commandIds.length);
    for (const command of createCliProvider.commands) {
      expect(CAPABILITIES.some(({ id }) => id === command.capability)).toBe(true);
    }
    expect(commandIds).not.toContain('navigator.navigate');
  });

  test('does not publish obsolete string-only capability metadata', () => {
    expect(
      packageJson.ankh.capabilities.every((capability) => typeof capability === 'object'),
    ).toBe(true);
  });
});
