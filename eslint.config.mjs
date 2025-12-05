import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
  {
    ignores: [
      '**/ngsw-worker.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/.dumps/**',
      '**/tmp/**',
      '**/eslint.config.{js,cjs,mjs}',
    ],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      parser: null,
    },
    plugins: {
      import: importPlugin,
      jsdoc: jsdocPlugin,
    },
  },
  eslintConfigPrettier,
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'no-console': 'error',
      'no-constructor-return': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'default-case-last': 'error',
      'max-depth': 'error',
      'no-alert': 'error',
      'no-empty-function': 'error',
      'no-empty-static-block': 'error',
      'no-invalid-this': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'no-unused-vars': 'off',
      'import/no-cycle': ['error', { ignoreExternal: true }],
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          banTransitiveDependencies: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core'],
              bannedExternalImports: ['@node/*'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:ui'],
            },
            {
              sourceTag: 'scope:page',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:ui', 'scope:page'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:ui', 'scope:page', 'scope:app'],
            },
            {
              sourceTag: 'scope:host',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:host'],
            },
            // {
            //   allSourceTags: ['scope:core', 'scope:ui', 'scope:page', 'scope:app', 'scope:host'],
            //   onlyDependOnLibsWithTags: ['scope:core'],
            // },
          ],
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {
      'no-console': ['error'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
