import { ExternalLink, Link } from "./link";

import styles from "./link.example.module.css";

/**
 * Inside and outside links, and the checks a unit test cannot make:
 *
 * - Home navigates inside the app without a reload.
 * - The disabled links are still reached by Tab and announced as
 *   unavailable; a click, Enter or a middle click does nothing.
 * - The MDN link opens in a new tab. In the new tab `window.opener` is null
 *   and `document.referrer` is empty.
 * - The forum link carries `rel="nofollow ugc"` and opens in this tab.
 * - The `javascript:` link has no href, looks disabled, and clicking it only
 *   logs a warning.
 * - Mail and phone links open their apps.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const LinkExample: React.FC = () => (
    <section className={styles.example}>
        <h3 className={styles.title}>Link example</h3>

        <h4 className={styles.label}>inside the app</h4>
        <ul className={styles.list}>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link
                    to="/"
                    disabled
                >
                    Home, disabled
                </Link>
            </li>
        </ul>

        <h4 className={styles.label}>leaving it</h4>
        <ul className={styles.list}>
            <li>
                <ExternalLink href="https://developer.mozilla.org/">
                    MDN, new tab
                </ExternalLink>
            </li>
            <li>
                <ExternalLink
                    href="https://example.com/forum"
                    target="_self"
                    rel={["nofollow", "ugc"]}
                >
                    A user-posted forum link
                </ExternalLink>
            </li>
            <li>
                <ExternalLink href="mailto:hello@example.com">
                    Mail
                </ExternalLink>{" "}
                and <ExternalLink href="tel:+10000000000">phone</ExternalLink>
            </li>
            <li>
                <ExternalLink
                    href="https://developer.mozilla.org/"
                    disabled
                >
                    MDN, disabled
                </ExternalLink>
            </li>
            <li>
                {}
                <ExternalLink href="javascript:alert(1)">
                    A javascript: URL, refused
                </ExternalLink>
            </li>
        </ul>
    </section>
);
