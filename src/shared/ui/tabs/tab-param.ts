/**
 * The parameter a tab strip writes itself into by default.
 *
 * Its own module rather than a const in `tabs.tsx`, so that file keeps
 * exporting components only, which `react-refresh/only-export-components`
 * requires.
 */
export const TAB_PARAM = "tab";
