import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

// Last in the list, so it switches off every rule that fights the formatter;
// Prettier runs as its own step. https://prettier.io/docs/integrating-with-linters
import eslintConfigPrettier from "eslint-config-prettier";

import globals from "globals";

import { globalIgnores } from "eslint/config";

export default tseslint.config([
    globalIgnores([
        "**/node_modules/**",
        "**/.react-router/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "eslint.config.js",
        "stylelint.config.js"
    ]),
    {
        files: ["*.{ts,tsx}", "**/*.{ts,tsx}"],
        extends: [
            eslint.configs.recommended,

            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,

            reactHooks.configs.flat["recommended-latest"],
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
            "unused-imports": unusedImports
        },

        rules: {
            ...react.configs.flat["jsx-runtime"].rules,

            "no-console": [
                "warn",
                {
                    allow: ["error", "warn"]
                }
            ],

            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            // <dialog closedby> is in React 19.3, not yet in the plugin's list.
            "react/no-unknown-property": ["error", { ignore: ["closedby"] }],

            "@typescript-eslint/no-empty-object-type": "off",
            // A loader or action refuses a request by throwing the Response
            // React Router built (redirect, data with a status), not an Error.
            "@typescript-eslint/only-throw-error": [
                "error",
                { allow: [{ from: "lib", name: "Response" }] }
            ],
            "@typescript-eslint/return-await": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true
                }
            ],

            // The route module exports React Router reads, beside the component.
            "react-refresh/only-export-components": [
                "error",
                {
                    allowConstantExport: true,
                    allowCompoundComponents: true,
                    allowExportNames: [
                        "meta",
                        "links",
                        "headers",
                        "handle",
                        "loader",
                        "clientLoader",
                        "action",
                        "clientAction",
                        "middleware",
                        "clientMiddleware",
                        "shouldRevalidate",
                        "ErrorBoundary",
                        "HydrateFallback",
                        "Layout"
                    ]
                }
            ],

            // tsc already reports a case that falls through
            // (noFallthroughCasesInSwitch); this finds the comment left behind.
            "no-fallthrough": [
                "error",
                { reportUnusedFallthroughComment: true }
            ],

            // eslint-plugin-unused-imports replaces it, as its docs set up;
            // with both on, every unused variable is reported twice.
            "@typescript-eslint/no-unused-vars": "off",

            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
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
                        "parent",
                        ["sibling", "index"],
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
                        },
                        {
                            pattern: "*.css",
                            patternOptions: { matchBase: true, nocase: true },
                            group: "sibling",
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
    },

    eslintConfigPrettier
]);
