import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import path from 'node:path';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsConfigRootDir: path.resolve(),
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'only-multiline'],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'max-len': ['error', { code: 88, ignoreUrls: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'class',
          format: ['PascalCase'],
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
