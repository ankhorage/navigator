import { defineParadoxConfig } from '@ankhorage/paradox';

import packageJson from './package.json';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'NAVIGATOR',
    description:
      'Standalone manifest-driven Navigator capability for cataloging, validating, planning, generating, and verifying Expo Router navigation.',
    usage: {
      entrypoints: ['docs/readme-usage.ts'],
    },
  },

  package: {
    root: '.',
    entrypoints: Object.values(packageJson.exports).flatMap((entry) =>
      typeof entry === 'string'
        ? []
        : [entry.default.replace('./dist/', 'src/').replace(/\.js$/u, '.ts')],
    ),
  },

  output: {
    dir: './paradox',
  },
});
