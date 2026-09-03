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
    files: ['jest.setup.js', '**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  {
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
];
