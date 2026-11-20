import { useSyncExternalStore } from "react";

// Nothing to subscribe to: the value only ever changes once, at hydration,
// and React re-renders for that itself.
const subscribe = () => () => undefined;

const getSnapshot = () => true;

const getServerSnapshot = () => false;

/**
 * `false` on the server and while the client hydrates, `true` after.
 *
 * During hydration React reads the server snapshot, so the markup matches the
 * server's, then re-renders with the client one. A render that happens later
 * on the client, after a navigation, gets `true` straight away; `useEffect`
 * with `useState` would render once more with `false` there too.
 */
export const useIsHydrated = () =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
