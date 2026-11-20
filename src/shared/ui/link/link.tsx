import {
    Link as RouterLink,
    type LinkProps as RouterLinkProps
} from "react-router";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import { parseOpenableUrl } from "./utils";

import styles from "./link.module.css";

import type { LinkRel } from "./types";

interface LinkProps extends Omit<RouterLinkProps, "aria-disabled"> {
    /** Keeps the link focusable and announced, but inert. */
    disabled?: boolean;
}

/**
 * A link inside the app, through React Router.
 *
 * `disabled` sets `aria-disabled` rather than hiding the link: a reader still
 * finds it and hears that it is unavailable. `aria-disabled` only says so, it
 * does not stop anything, so the click is cancelled here and the styles take
 * the pointer away.
 */
export const Link: React.FC<LinkProps> = ({
    disabled = false,
    onClick,
    className = "",
    ...props
}) => {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = event => {
        if (disabled) event.preventDefault();
    };

    return (
        <RouterLink
            {...props}
            aria-disabled={disabled || undefined}
            onClick={composeEventHandlers(onClick, handleClick)}
            className={`${styles.link} ${className}`.trim()}
        />
    );
};

Link.displayName = "Link";

const DEFAULT_REL: readonly LinkRel[] = ["noopener", "noreferrer"];

interface ExternalLinkProps extends Omit<
    React.ComponentProps<"a">,
    "href" | "rel" | "aria-disabled"
> {
    /** An absolute URL: http, https, mailto or tel. */
    href: string;
    /**
     * Each token checked against the link types HTML defines, joined with
     * spaces. `noopener` is implied by `target="_blank"` in current
     * browsers and stays for older ones; `noreferrer` keeps the Referer
     * from the other site, which is a privacy choice. Pass `[]` for none.
     */
    rel?: readonly LinkRel[];
    disabled?: boolean;
}

/**
 * A link that leaves the app, as a plain `<a>`. A web page opens in a new tab
 * unless `target` says otherwise; mail and phone links do not, since they open
 * an app and would leave an empty tab behind.
 *
 * A destination that is not an absolute URL with an allowed scheme renders
 * with no `href` and as disabled, so a `javascript:` URL cannot pass for an
 * ordinary link. A `disabled` link keeps its `href`, so it stays in the tab
 * order and is announced as unavailable.
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({
    href,
    rel = DEFAULT_REL,
    target,
    disabled = false,
    onClick,
    className = "",
    children,
    ...props
}) => {
    const url = parseOpenableUrl(href);
    const isInert = disabled || url === null;
    const isWebPage = url?.protocol === "http:" || url?.protocol === "https:";
    const relValue = [...new Set(rel)].join(" ") || undefined;

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = event => {
        if (!isInert) return;
        event.preventDefault();
        // A link the guard refused looks ordinary and does nothing; this is
        // the only trace of why.
        if (!disabled) {
            console.warn("[ExternalLink] Refusing to open this URL:", href);
        }
    };

    // `href` and `children` are named rather than spread, so the a11y rules
    // can see the anchor has a destination and content.
    return (
        <a
            {...props}
            href={url === null ? undefined : href}
            target={target ?? (isWebPage ? "_blank" : undefined)}
            rel={relValue}
            aria-disabled={isInert || undefined}
            onClick={composeEventHandlers(onClick, handleClick)}
            className={`${styles.link} ${className}`.trim()}
        >
            {children}
        </a>
    );
};

ExternalLink.displayName = "ExternalLink";
