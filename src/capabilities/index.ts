import type { Capability } from '@ankhorage/contracts/capabilities';

/*** Publish the portable action capabilities implemented by Navigator's Ankh provider. */
export const CAPABILITIES = [
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
