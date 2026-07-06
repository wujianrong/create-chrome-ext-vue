// vue规则:  https://eslint.vuejs.org/rules/
// eslint8规则: https://eslint.org/docs/v8.x/rules/
// 'plugin:prettier/recommended'
module.exports = {
  env: {
    browser: true
  },
  extends: ['plugin:vue/base', 'plugin:vue/essential', 'standard'],
  plugins: ['import'],
  rules: {
    // 0 禁用规则, 1 报警告, 2 报错
    'lines-between-class-members': 0,
    'no-void': 0,
    // 'no-empty': 1,
    // 'object-curly-newline': 0,
    'no-case-declarations': 1,
    // 'no-useless-return': 1,
    'multiline-ternary': 0,
    'no-prototype-builtins': 0,
    'array-bracket-spacing': 0, // style
    // 'array-callback-return': 0,
    'quotes': 0, // style
    'no-async-promise-executor': 0,
    'quote-props': 1,
    'prefer-const': 0,
    'no-trailing-spaces': 0, // style
    'semi': 0, // style
    'dot-notation': 0, // style
    'camelcase': 0, // style
    'comma-dangle': 0, // style
    'indent': 0, // style style
    // 'no-extend-native': 2,
    'no-multiple-empty-lines': 0, // style
    // 'no-return-assign': 0,
    'object-curly-spacing': 0, // style
    'space-before-function-paren': [0, 'always'], // style
    'max-lines': [2, { max: 1000 }],
    'vue/multi-word-component-names': 0,
    'import/dynamic-import-chunkname': [
      2,
      {
        importFunctions: ['dynamicImport'],
        webpackChunknameFormat: '[a-zA-Z0-57-9-/_]+',
        allowEmpty: false
      }
    ],
    'vue/no-mutating-props': 0,
    // 'vue/valid-next-tick': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/no-side-effects-in-computed-properties': 2,
    'vue/require-valid-default-prop': 1,
    'vue/require-prop-type-constructor': 1,
    'vue/no-unused-components': 1,
    'vue/no-reserved-component-names': 1,
    'import/no-namespace': [
      1,
      {
        message: '不要使用批量导入'
      }
    ],
    'no-restricted-syntax': [
      1,
      {
        selector: 'ExportAllDeclaration',
        message: '不要使用批量导出'
      }
    ]
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser'
    //  "globals": globals.browser
  }
}
