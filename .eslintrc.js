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
  },
};
