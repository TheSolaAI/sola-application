import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn', // Enforce Prettier formatting
      'react-hooks/rules-of-hooks': 'warn', // Enforce correct hook usage
      'react-hooks/exhaustive-deps': 'warn', // Warn on missing dependencies in useEffect
      '@typescript-eslint/no-unused-vars': 'warn', // Warn on unused variables in TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed for Next.js
    },
  },
];

export default eslintConfig;
