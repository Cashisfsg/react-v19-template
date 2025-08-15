import propertyGroups from "stylelint-config-recess-order/groups";

/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
    plugins: ["stylelint-order"],

    rules: {
        "declaration-empty-line-before": null,
        "order/order": ["custom-properties", "declarations"],
        "order/properties-order": propertyGroups.map(group => ({
            ...group,

            emptyLineBefore: "always",
            noEmptyLineBetween: true
        }))
    }
};
