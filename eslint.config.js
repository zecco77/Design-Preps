import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'dist-server/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
