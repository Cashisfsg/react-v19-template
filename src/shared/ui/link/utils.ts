/** Schemes an external link may point at. Anything else, `javascript:` and
    `data:` among them, leaves the link inert. */
const OPENABLE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/** The destination, if it is an absolute URL with a scheme we may open. */
export const parseOpenableUrl = (raw: string): URL | null => {
    try {
        const url = new URL(raw);
        return OPENABLE_PROTOCOLS.has(url.protocol) ? url : null;
    } catch {
        return null;
    }
};
