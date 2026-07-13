import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import angularTemplateParser from '@angular-eslint/template-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    'dist/**/*',
    'coverage/**/*',
    'node_modules/**/*',
    '**/node_modules',
    '**/dist',
    '**/.angular',
    '**/coverage',
    '**/out-tsc',
    '**/.vscode',
    '**/.idea',
  ]),
  {
    files: ['**/*.ts'],

    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@angular-eslint/recommended'
    ),

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.spec.json'],
        createDefaultProgram: true,
      },
    },

    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: compat.extends('plugin:@angular-eslint/template/recommended'),
    languageOptions: {
      parser: angularTemplateParser,
    },
  },
]);
