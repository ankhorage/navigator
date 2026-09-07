import { defineParadoxConfig } from '@ankhorage/paradox';

import packageJson from './package.json';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'NAVIGATOR',
    description:
      'Standalone Navigator capability with topology configured independently from platform implementation and visual presentation. Adaptive tabs provide native and responsive web adapters; experimental Stack and Split View stay testing-only with validated upstream fallbacks.',
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
