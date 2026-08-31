// ESLint flat config for PomoMate (ESLint 9 + eslint-config-expo).
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'server/**',
      'babel.config.js',
    ],
  },
  ...expoConfig,
  {
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
];
