import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'NAVIGATOR',
  },

  package: {
    root: '.',
    entrypoints: ['src/index.ts', 'src/metadata/index.ts'],
  },

  output: {
    dir: './paradox',
  },
});
