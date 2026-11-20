import { useCallback, useEffect, useReducer, useRef } from "react";

interface IdleState {
    status: "idle";
    coordinates: undefined;
    error: null;
}

interface PendingState {
    status: "pending";
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
            return { ...state, status: "pending", error: null };
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
        default:
            return state;
    }
};

const geolocationErrorMessages = {
    1: "Geolocation access denied. Please check permissions.",
    2: "Unable to determine location. Internal error occurred.",
    3: "Geolocation request timed out. Please try again."
};

const initialState: State = {
    status: "idle",
    coordinates: undefined,
    error: null
};

export function useGeoLocation(
    onSuccess?: (coords: GeolocationCoordinates) => void,
    onError?: (error: GeolocationPositionError) => void,
    options: PositionOptions & { autoUpdate?: boolean } = {
        maximumAge: 5000,
        timeout: 10000,
        enableHighAccuracy: false,
        autoUpdate: false
    }
) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const mountedRef = useRef(true);

    const handleSuccess: PositionCallback = position => {
        if (!mountedRef.current) return;
        dispatch({ type: "fulfilled", payload: position.coords });
        onSuccess?.(position.coords);
    };

    const handleError: PositionErrorCallback = error => {
        if (!mountedRef.current) return;
        const message =
            geolocationErrorMessages[error.code] ??
            "Unknown geolocation error.";
        dispatch({ type: "rejected", payload: new Error(message) });
        onError?.(error);
    };

    const getLocation = useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            dispatch({
                type: "rejected",
                payload: new Error(
                    "Geolocation is not supported by your browser."
                )
            });
            return;
        }

        dispatch({ type: "pending" });

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            options
        );
    }, [onSuccess, onError]);

    useEffect(() => {
        mountedRef.current = true;
        const { geolocation } = navigator;

        if (!geolocation) {
            dispatch({
                type: "rejected",
                payload: new Error(
                    "Geolocation is not supported by your browser."
                )
            });
            return;
        }

        // 📍 Получаем начальные координаты
        getLocation();

        // 🔄 Если включено автообновление (watchPosition)
        let watchId: number | null = null;
        if (options.autoUpdate) {
            watchId = geolocation.watchPosition(
                handleSuccess,
                handleError,
                options
            );
        }

        return () => {
            mountedRef.current = false;
            if (watchId !== null) geolocation.clearWatch(watchId);
        };
    }, [getLocation, onSuccess, onError]);

    return { ...state, refresh: getLocation };
}
