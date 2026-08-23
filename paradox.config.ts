import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'ZORA Navigation',
  },

  package: {
    root: '.',
    entrypoints: ['src/index.ts'],
  },

  output: {
    dir: './paradox',
  },
});
