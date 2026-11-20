import { useCallback, useEffect, useReducer, useRef } from "react";

import { useEventCallback } from "../use-event-callback";

interface IdleState {
    status: "idle";
    coordinates: undefined;
    error: null;
}

interface PendingState {
    status: "pending";
    /* The last fix, kept while a new one is asked for. */
    coordinates: GeolocationCoordinates | undefined;
    error: null;
}

interface FulfilledState {
    status: "fulfilled";
    coordinates: GeolocationCoordinates;
    error: null;
}

interface RejectedState {
    status: "rejected";
    coordinates: undefined;
    error: Error;
}

type State = IdleState | PendingState | FulfilledState | RejectedState;

type Action =
    | { type: "pending" }
    | { type: "fulfilled"; payload: GeolocationCoordinates }
    | { type: "rejected"; payload: Error };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "pending":
            return {
                status: "pending",
                coordinates: state.coordinates,
                error: null
            };
        case "fulfilled":
            return {
                status: "fulfilled",
                coordinates: action.payload,
                error: null
            };
        case "rejected":
            return {
                status: "rejected",
                coordinates: undefined,
                error: action.payload
            };
    }
};

const initialState: State = {
    status: "idle",
    coordinates: undefined,
    error: null
};

/* By the codes of `GeolocationPositionError`, written out: the constants are
   not there on the server, where this module is loaded too. */
const ERROR_MESSAGES: Partial<Record<number, string>> = {
    1: "Geolocation access denied. Please check permissions.",
    2: "Unable to determine location. Internal error occurred.",
    3: "Geolocation request timed out. Please try again."
};

const UNSUPPORTED = "Geolocation is not supported by your browser.";

interface UseGeolocationOptions extends PositionOptions {
    /** Keep following the position with `watchPosition`, not just once. */
    watch?: boolean | undefined;
    onSuccess?: ((coordinates: GeolocationCoordinates) => void) | undefined;
    onError?: ((error: GeolocationPositionError) => void) | undefined;
}

/**
 * The device's position, asked for on mount and again on `refresh`, and
 * followed while `watch` is on.
 *
 * The options are read by value, so an object literal at the call site does
 * not ask again on every render, and the callbacks are always the latest.
 * A fix that arrives after unmount is dropped: a position request cannot be
 * cancelled, only ignored.
 */
export const useGeolocation = ({
    watch = false,
    maximumAge = 5000,
    timeout = 10000,
    enableHighAccuracy = false,
    onSuccess,
    onError
}: UseGeolocationOptions = {}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const mountedRef = useRef(false);

    const handleSuccess = useEventCallback((position: GeolocationPosition) => {
        if (!mountedRef.current) return;
        dispatch({ type: "fulfilled", payload: position.coords });
        onSuccess?.(position.coords);
    });

    const handleError = useEventCallback((error: GeolocationPositionError) => {
        if (!mountedRef.current) return;
        const message =
            ERROR_MESSAGES[error.code] ?? "Unknown geolocation error.";
        dispatch({ type: "rejected", payload: new Error(message) });
        onError?.(error);
    });

    const refresh = useCallback(() => {
        if (!("geolocation" in navigator)) {
            dispatch({ type: "rejected", payload: new Error(UNSUPPORTED) });
            return;
        }

        dispatch({ type: "pending" });
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            maximumAge,
            timeout,
            enableHighAccuracy
        });
    }, [handleSuccess, handleError, maximumAge, timeout, enableHighAccuracy]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (!watch || !("geolocation" in navigator)) return;

        const watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            { maximumAge, timeout, enableHighAccuracy }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [
        watch,
        handleSuccess,
        handleError,
        maximumAge,
        timeout,
        enableHighAccuracy
    ]);

    return { ...state, refresh };
};
