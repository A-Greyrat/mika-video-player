module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['eslint-plugin-prettier'],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-shadow': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'react/display-name': 'off',
    // jsx 单引号
    'jsx-quotes': [2, 'prefer-single'],
    'react/prop-types': 'off',
    'import/no-cycle': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'no-unused-expressions': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'no-continue': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    // 关闭variable必须全部大写规则
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        modifiers: ['const'],
        format: null,
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'no-restricted-exports': 'off',
    'no-restricted-syntax': 'off',
    'consistent-return': 'off',
    camelcase: 'off',
    'no-nested-ternary': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    // 统一eslint prettier配置
    'prettier/prettier': [
      'warn',
      {},
      {
        usePrettierrc: true,
      },
    ],
  },
};
