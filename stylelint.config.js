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

        // Layout in logical terms only: the browser turns `inline-start` and
        // `block-end` around for right-to-left and vertical text by itself,
        // where a physical side would need a direction check that can break.
        // Built-in rules rather than a logical-CSS plugin, whose Stylelint 18
        // releases are all days old.
        "property-disallowed-list": [
            [
                "/^(top|right|bottom|left)$/",
                "/^(margin|padding|scroll-margin|scroll-padding|border)-(top|right|bottom|left)(-|$)/",
                "/^border-(top|bottom)-(left|right)-radius$/",
                "/^(min-|max-)?(width|height)$/",
                "/^overscroll-behavior-(x|y)$/"
            ],
            {
                message: property =>
                    `Use the logical form of "${property}" (inline/block, start/end)`
            }
        ],
        "declaration-property-value-disallowed-list": [
            {
                "/^(text-align|float|clear)$/": ["left", "right"],
                resize: ["horizontal", "vertical"]
            },
            {
                message: (property, value) =>
                    `Use a logical value instead of "${property}: ${value}" (start/end, inline/block)`
            }
        ],
        // \`[dir]\` reads the attribute on that element alone; \`:dir()\` follows
        // the direction it inherits, which is what a component sits in.
        "selector-attribute-name-disallowed-list": [
            ["dir"],
            { message: () => "Use :dir() instead of a [dir] selector" }
        ],

        "order/order": ["custom-properties", "declarations"],
        "order/properties-order": propertyGroups.map(group => ({
            ...group,

            emptyLineBefore: "always",
            noEmptyLineBetween: true
        }))
    }
};
