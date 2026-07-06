import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
<<<<<<< Updated upstream
import {defineConfig, globalIgnores} from 'eslint/config'
=======
<<<<<<< HEAD
import { defineConfig, globalIgnores } from 'eslint/config'
>>>>>>> Stashed changes
import nextPlugin from '@next/eslint-plugin-next'

export default defineConfig([
    globalIgnores(['dist', '.next', 'next-env.d.ts']),
    nextPlugin.configs['core-web-vitals'],
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
<<<<<<< Updated upstream
=======
  },
=======
import {defineConfig, globalIgnores} from 'eslint/config'
import nextPlugin from '@next/eslint-plugin-next'

export default defineConfig([
    globalIgnores(['dist', '.next', 'next-env.d.ts']),
    nextPlugin.configs['core-web-vitals'],
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
])
