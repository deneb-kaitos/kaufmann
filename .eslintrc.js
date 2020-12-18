module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: 'esprima',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
  ],
  plugins: [
    'chai-friendly',
  ],
  ignorePatterns: [
    '/node_modules/*',
  ],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'node/no-unpublished-import': 0,
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
  },
};
