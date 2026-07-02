import { useEffect, useRef } from "react";

const useOnceEffect = (effect) => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;

    const cleanup = effect();

    return cleanup;
  }, []);
};

export default useOnceEffect;