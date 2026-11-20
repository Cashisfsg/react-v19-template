import propertyGroups from "stylelint-config-recess-order/groups";

/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
    plugins: ["stylelint-order"],

    // Vendored verbatim from normalize.css 8.0.1. Its prefixes and the doubled
    // `monospace, monospace` are upstream's deliberate fixes, and --fix
    // rewrites them into declarations that no longer do the job.
    ignoreFiles: ["src/app/styles/normalize.css"],

    rules: {
        // order/properties-order below decides the blank lines; with both on
        // they contradict each other on every property that opens a group.
        "declaration-empty-line-before": null,

        // Kebab-case, optionally with a BEM __element and --modifier.
        "selector-class-pattern": [
            "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$",
            {
                message: selector =>
                    `Expected class selector "${selector}" to be kebab-case, optionally with a BEM __element and --modifier`
            }
        ],

        // CSS Modules syntax, which stylelint does not know.
        "selector-pseudo-class-no-unknown": [
            true,
            { ignorePseudoClasses: ["global", "local"] }
        ],

        // A note followed by a more specific note about the same declaration
        // stays one block.
        "comment-empty-line-before": [
            "always",
            {
                except: ["first-nested"],
                ignore: ["after-comment", "stylelint-commands"]
            }
        ],

        "order/order": ["custom-properties", "declarations"],
        "order/properties-order": propertyGroups.map(group => ({
            ...group,

            emptyLineBefore: "always",
            noEmptyLineBetween: true
        }))
    }
};
