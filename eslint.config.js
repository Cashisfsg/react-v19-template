import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
    globalIgnores(["node_modules", ".react-router", "dist", "build"]),
    {
        files: ["*.{ts,tsx}", "**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,

            // ...tseslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            // ...tseslint.configs.strictTypeChecked,
            // ...tseslint.configs.stylisticTypeChecked,

            reactHooks.configs["recommended-latest"],
            reactRefresh.configs.vite,
            eslintPluginJsxA11y.flatConfigs.recommended,
            eslintConfigPrettier
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
            // parserOptions: eslintReact.configs.recommended.parserOptions
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
            // "@typescript-eslint/no-empty-interface": "off",
            "react/prop-types": "off",
            "@typescript-eslint/no-empty-object-type": "off",

            "prettier/prettier": [
                "warn",
                {
                    endOfLine: "auto"
                }
            ],

            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    args: "none",
                    varsIgnorePattern: "^_"
                    // argsIgnorePattern: "^_"
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
