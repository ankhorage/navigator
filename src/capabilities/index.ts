import type { Capability } from '@ankhorage/contracts/capability';

/*** Publish the portable capabilities owned by Navigator. */
export const CAPABILITIES = [
  {
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
  },
  {
    id: 'navigator.route',
    owner: '@ankhorage/navigator',
    access: ['read', 'subscribe'],
    binding: { kind: 'state', bindableAs: ['source'] },
    label: 'Current route',
    output: {
      schema: {
        type: 'object',
        required: ['pathname', 'params', 'canGoBack'],
        properties: {
          pathname: { type: 'string' },
          params: {
            type: 'object',
            additionalProperties: {
              oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
            },
          },
          canGoBack: { type: 'boolean' },
        },
      },
    },
  },
  {
    id: 'navigator.back',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
    label: 'Back',
  },
  {
    id: 'navigator.catalog',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.validate',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.plan',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.generate',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.verify',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.examples.generate',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
  {
    id: 'navigator.examples.verify',
    owner: '@ankhorage/navigator',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
  },
] as const satisfies readonly Capability[];
