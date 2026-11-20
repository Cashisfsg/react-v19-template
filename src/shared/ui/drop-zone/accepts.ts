/**
 * Whether a file matches an `accept` list as `<input type="file">` reads it:
 * comma-separated extensions (`.png`), MIME types (`image/png`) and wildcards
 * (`image/*`). A drop is not filtered by the browser the way the picker is, so
 * the zone applies the same list itself. An empty list takes everything.
 */
export const accepts = (file: File, accept: string | undefined): boolean => {
    const tokens = (accept ?? "")
        .split(",")
        .map(token => token.trim().toLowerCase())
        .filter(Boolean);
    if (tokens.length === 0) return true;

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return tokens.some(token => {
        if (token.startsWith(".")) return name.endsWith(token);
        if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
        return type === token;
    });
};
