type SuccessState<T> = readonly [T, null];

type ErrorState<E = Error> = readonly [null, E];

type State<T, E = Error> = SuccessState<T> | ErrorState<E>;

export async function tryCatch<T, E = Error>(
    promise: Promise<T>
): Promise<State<T, E>> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        if (error instanceof Error) {
            return [null, error as E];
        }

        return [null, new Error("Unexpected error occurred") as E];
    }
}
