import { useCallback, useRef } from "react";

export function useRefLazy<T>(factory: () => T) {
  const ref = useRef<T | null>(null);

  return useCallback(() => {
    if (ref.current !== null) {
      return ref.current;
    }

    const value = factory();
    ref.current = value;
    return value;
    // We do not care if the factory function changes, the point
    // was that the value was only created on the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
