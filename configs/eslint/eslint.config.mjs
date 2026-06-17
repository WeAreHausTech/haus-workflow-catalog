import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  // Ignore generated and build output
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', '.react-router/**'],
  },

  // Core JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules (flat configs array)
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,

  // React recommended rules (flat configs array)
  pluginReact.configs.flat.recommended,

  // Tanstack Query recommended rules (flat configs array)
  pluginQuery.configs['flat/recommended'],

  // JSX A11y recommended rules (flat configs array)
  jsxA11y.flatConfigs.recommended,

  // CommonJS config files (e.g. prettier.config.cjs)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  // Project-wide language settings and small React tweaks
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Not needed with React 17+ / automatic JSX runtime
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // React Hooks rules with Recoil support
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)',
        },
      ],
      // Allow intentionally unused vars/args when prefixed with _
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-console': 'warn',
      'no-debugger': 'error',

      // TS strictness
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier,
])
