import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'NAVIGATOR',
    description:
      'Standalone Navigator capability with topology configured independently from platform implementation and visual presentation. Adaptive tabs use Native Tabs on Android/iOS and one stable Expo Router headless topology with Surface-owned responsive presentation on Web.',
  },

  package: {
    root: '.',
    entrypoints: ['src/index.ts', 'src/metadata/index.ts', 'src/tabs/index.ts'],
  },

  output: {
    dir: './paradox',
  },
});
