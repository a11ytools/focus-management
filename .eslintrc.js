module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks'
  ],
  rules: {
    // Custom rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
  },
  env: {
    browser: true,
    node: true,
    // Add Vitest environment
    jest: true
  },
  globals: {
    describe: 'readonly',
    expect: 'readonly',
    it: 'readonly',
    test: 'readonly',
    beforeEach: 'readonly',
    beforeAll: 'readonly',
    afterEach: 'readonly',
    afterAll: 'readonly',
    vi: 'readonly',
  }
}; 