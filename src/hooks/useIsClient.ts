import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during the hydration render, true afterwards. Replaces the
 * "set mounted in an effect" pattern, which renders every client mount twice.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
