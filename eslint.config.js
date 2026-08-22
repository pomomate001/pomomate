// ESLint flat config for PomoMate (ESLint 9 + eslint-config-expo).
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'babel.config.js'],
  },
];
