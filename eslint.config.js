import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

import globals from "globals";

import { globalIgnores } from "eslint/config";

export default tseslint.config([
    globalIgnores([
        "**/node_modules/**",
        "**/.react-router/**",
        "**/dist/**",
        "**/build/**",
        "**/settings.json",
        "**/vite.config.ts",
        "vite.config.ts",
        "tailwind.config.js",
        "eslint.config.js",
        "postcss.config.js",
        "craco.config.js",
        "tsconfig.json",
        "tsconfig.app.json",
        "tsconfig.node.json",
        "check-fluent-syntax.js",
        "check-i18n-keys.js",
        "check-i18n-missing.js",
        "export-missing-keys.js",
        "get-missing-for-locale.js"
    ]),
    {
        files: ["*.{ts,tsx}", "**/*.{ts,tsx}"],
        extends: [
            eslint.configs.recommended,

            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,

            reactHooks.configs["recommended-latest"],
            reactRefresh.configs.vite,
            importPlugin.flatConfigs.recommended,
            react.configs.flat.recommended,
            eslintPluginJsxA11y.flatConfigs.recommended
        ],

        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname
            },
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2023
            }
        },

        settings: {
            react: {
                version: "detect"
            }
        },

        plugins: {
            react: react,
            "unused-imports": unusedImports,
            prettier: eslintPluginPrettier
        },

        rules: {
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            // "@typescript-eslint/no-empty-interface": "off",

            "no-console": [
                "warn",
                {
                    allow: ["error", "warn"]
                }
            ],

            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",

            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/return-await": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true
                }
            ],

            "prettier/prettier": [
                "warn",
                {
                    endOfLine: "auto"
                }
            ],

            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true
                }
            ],

            // Import order for FSD architecture
            "import/no-unresolved": "off",
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["sibling", "index"],
                        "parent",
                        "type",
                        "object"
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    },
                    pathGroups: [
                        {
                            pattern: "react",
                            group: "builtin",
                            position: "before"
                        },
                        // App layer
                        {
                            pattern: "~/app/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/app/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/app/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/app/**",
                            group: "internal",
                            position: "after"
                        },
                        // Pages layer
                        {
                            pattern: "~/pages/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/pages/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/pages/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/pages/**",
                            group: "internal",
                            position: "after"
                        },
                        // Widgets layer
                        {
                            pattern: "~/widgets/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/widgets/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/widgets/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/widgets/**",
                            group: "internal",
                            position: "after"
                        },
                        // Features layer
                        {
                            pattern: "~/features/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/features/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/features/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/features/**",
                            group: "internal",
                            position: "after"
                        },
                        // Entities layer
                        {
                            pattern: "~/entities/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/entities/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/entities/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/entities/**",
                            group: "internal",
                            position: "after"
                        },
                        // Shared layer
                        {
                            pattern: "~/shared/**/api/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/shared/**/model/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/shared/**/ui/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "~/shared/**",
                            group: "internal",
                            position: "after"
                        }
                    ],
                    pathGroupsExcludedImportTypes: ["react"],
                    warnOnUnassignedImports: true
                }
            ],

            "prefer-const": [
                "error",
                {
                    destructuring: "all",
                    ignoreReadBeforeAssign: false
                }
            ]
        }
    }
]);
