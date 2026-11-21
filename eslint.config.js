import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

// Last in the list, so it switches off every rule that fights the formatter;
// Prettier runs as its own step. https://prettier.io/docs/integrating-with-linters
import eslintConfigPrettier from "eslint-config-prettier";

import globals from "globals";

// Files that run in Node rather than the browser: the tool configs and the
// scripts beside them.
const NODE_FILES = ["*.{js,mjs,cjs,ts}", "scripts/**/*.{js,mjs,cjs,ts}"];

export default defineConfig([
    globalIgnores([
        "**/node_modules/**",
        "**/.react-router/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**"
    ]),

    {
        // In the config rather than a CLI flag, so the editor reports a
        // stale disable comment too.
        linterOptions: {
            reportUnusedDisableDirectives: "error"
        }
    },

    // Plain JavaScript: the configs and scripts, without type information.
    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [eslint.configs.recommended]
    },

    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            eslint.configs.recommended,

            // A superset of recommendedTypeChecked.
            tseslint.configs.strictTypeChecked,

            reactHooks.configs.flat["recommended-latest"],
            reactRefresh.configs.vite,
            importPlugin.flatConfigs.recommended,
            // Turns off what the compiler checks better (import/named) and
            // teaches the resolver the TypeScript extensions.
            importPlugin.flatConfigs.typescript,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            jsxA11y.flatConfigs.recommended
        ],

        languageOptions: {
            parserOptions: {
                // Finds each file's tsconfig the way the editor does.
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            },
            // Written out: a plugin's preset below sets 2018, and it would
            // win over the flat config's own "latest".
            ecmaVersion: "latest"
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
            "no-console": [
                "warn",
                {
                    allow: ["error", "warn"]
                }
            ],

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
            // TypeScript reports a missing module, a missing export and a
            // wrong default import already, and these are the plugin's
            // slowest rules.
            "import/no-unresolved": "off",
            "import/namespace": "off",
            "import/default": "off",
            "import/no-named-as-default-member": "off",
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

    {
        files: ["src/**/*.{ts,tsx}"],
        languageOptions: {
            globals: globals.browser
        }
    },

    {
        files: NODE_FILES,
        languageOptions: {
            globals: globals.node
        }
    },

    eslintConfigPrettier
]);
