import { createKnipConfig } from '@ankhorage/devtools/knip';

import packageJson from './package.json';

export default createKnipConfig({
  entry: [
    ...Object.values(packageJson.exports).flatMap((entry) =>
      typeof entry === 'string'
        ? []
        : [entry.default.replace('./dist/', 'src/').replace(/\.js$/u, '.ts')],
    ),
    'docs/readme-usage.ts',
    'scripts/**/*.ts',
    'tests/**/*.test.ts',
  ],
  ignoreFiles: [
    '.prettierrc.js',
    'eslint.config.mjs',
    'eslint.examples.config.mjs',
    'eslint.local.config.mjs',
    'examples/**',
    'paradox.config.ts',
    'prettier.local.config.js',
  ],
  ignoreDependencies: ['react-native-pager-view', 'react-native-tab-view'],
});
