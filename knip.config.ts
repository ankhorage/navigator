import { createKnipConfig } from '@ankhorage/devtools/knip';

import packageJson from './package.json';

export default createKnipConfig({
  entry: [
    ...Object.values(packageJson.exports).flatMap((entry) =>
      typeof entry === 'string'
        ? []
        : [entry.default.replace('./dist/', 'src/').replace(/\.js$/u, '.ts')],
    ),
    'tests/**/*.test.ts',
  ],
  ignoreFiles: [
    '.prettierrc.js',
    'eslint.config.mjs',
    'eslint.local.config.mjs',
    'paradox.config.ts',
    'prettier.local.config.js',
  ],
});
