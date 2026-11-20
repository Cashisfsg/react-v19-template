/**
 * The link types HTML allows on `<a>`, plus `ugc` and `sponsored`, which the
 * spec does not list but search engines read.
 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
 */
export type LinkRel =
    | "alternate"
    | "author"
    | "bookmark"
    | "external"
    | "help"
    | "license"
    | "next"
    | "nofollow"
    | "noopener"
    | "noreferrer"
    | "opener"
    | "prev"
    | "privacy-policy"
    | "search"
    | "tag"
    | "terms-of-service"
    | "ugc"
    | "sponsored";
