// eslint.config.js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        RTCDataChannel: 'readonly',
        MediaRecorder: 'readonly',
        RTCPeerConnection: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        history: 'readonly',
        location: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        WebSocket: 'readonly',
        EventSource: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        matchMedia: 'readonly',
        crypto: 'readonly',
        React: 'readonly',
        RTCSessionDescriptionInit: 'readonly',
        jsVectorMap: 'readonly',
        HTMLElement: 'readonly',
        Window: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        TextEncoder: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-undef': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
];
