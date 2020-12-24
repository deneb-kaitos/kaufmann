module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'plugin:mocha/recommended',
    'plugin:security/recommended',
  ],
  plugins: [
    'chai-friendly',
    'mocha',
    'security',
  ],
  ignorePatterns: [
    '/node_modules/*',
    '**/*.spec.mjs',
  ],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'node/no-unpublished-import': 0,
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'import/extensions': 0,
    'import/named': 0,
    'lines-between-class-members': 0,
    'no-param-reassign': [2, {
      props: false,
    }]
  },
};
