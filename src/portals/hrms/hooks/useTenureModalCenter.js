
import { useLayoutEffect, useState } from "react";

const useTenureModalCenter = (enabled = true) => {
  const [centerX, setCenterX] = useState(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    const updateCenter = () => {
      setCenterX(window.innerWidth / 2);
    };

    updateCenter();
    window.addEventListener("resize", updateCenter);

    return () => {
      window.removeEventListener("resize", updateCenter);
    };
  }, [enabled]);

  return centerX == null
    ? undefined
    : { "--tenure-modal-center-x": `${centerX}px` };
};

export default useTenureModalCenter;
