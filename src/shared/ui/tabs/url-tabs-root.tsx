import { useCallback, useEffect, useRef } from "react";

import { useLocation, useSearchParams } from "react-router";

import { TAB_PARAM } from "./tab-param";
import { Root } from "./tabs";

interface UrlRootProps<TValue extends string> {
    children: React.ReactNode;
    /**
     * Every tab, in the order they appear. The first is where the screen opens
     * when the address names none of them.
     */
    values: readonly TValue[];
    /** Which parameter carries the tab. */
    param?: string;
}

/**
 * A `Tabs.Root` that remembers which tab the reader was on, in the address.
 *
 * The reason is leaving and coming back: a row that opens a screen of its own
 * has to return to the tab it was opened from, and a tab held in component
 * state is gone the moment the list unmounts. Written into the query, it
 * survives the trip, and the caller passes it on to the screen it opens.
 *
 * A component of its own so the subscription is one: reading the address in the
 * page would re-render the whole screen on every navigation, where here only
 * this and `Root` re-render — the children arrive as already-built elements,
 * and React skips a subtree whose element is unchanged.
 *
 * The address is read **once, as a default**: which tab is current after that is
 * the tabs' own business, and the address is a record of where the reader was
 * rather than the thing that decides it. Anything it does not name — a first
 * visit, a hand-edited parameter — is the first tab.
 */
export const UrlRoot = <TValue extends string>({
    children,
    values,
    param = TAB_PARAM
}: UrlRootProps<TValue>) => {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const entryState: unknown = location.state;
    const opening =
        values.find(value => value === params.get(param)) ?? values[0];

    /* Held in a ref because react-router's setter is not stable: it is built as
       `useCallback(…, [navigate, searchParams])` with `searchParams` memoised on
       `[location.search]`, so any change to any parameter — every keystroke in a
       search field — yields a new setter. Depending on it directly would rebuild
       `Root`'s context on each of those and re-render every trigger and panel
       with it. */
    const setParamsRef = useRef(setParams);
    const entryStateRef = useRef(entryState);
    useEffect(() => {
        setParamsRef.current = setParams;
        entryStateRef.current = entryState;
    });

    /* `replace` rather than push: a tab is not a place to come back to, and an
       entry per tab would make leaving the screen a matter of pressing back once
       per tab the reader tried. The entry's state stays: replacing it is still the
       same visit, and a screen may be holding what its opener handed over. */
    const remember = useCallback(
        (value: string) => {
            setParamsRef.current(
                current => {
                    const next = new URLSearchParams(current);
                    next.set(param, value);
                    return next;
                },
                { replace: true, state: entryStateRef.current }
            );
        },
        [param]
    );

    return (
        <Root
            defaultValue={opening}
            onValueChange={remember}
        >
            {children}
        </Root>
    );
};

UrlRoot.displayName = "Tabs.UrlRoot";
