import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'NAVIGATOR',
    description:
      'Standalone Navigator capability with topology configured independently from platform implementation and visual presentation. Adaptive tabs provide native and responsive web adapters; Experimental Stack stays testing-only, validates its narrow option surface, and uses the upstream web fallback.',
  },

  package: {
    root: '.',
    entrypoints: ['src/index.ts', 'src/metadata/index.ts', 'src/tabs/index.ts'],
  },

  output: {
    dir: './paradox',
  },
});
