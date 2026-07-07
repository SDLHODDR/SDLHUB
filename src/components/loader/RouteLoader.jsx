import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => {
      setLoading(true);
    }, 0);

    const stop = setTimeout(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    }, 300);

    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div id="global-loader">
      <div className="whirly-loader"></div>
    </div>
  );
};

export default RouteLoader;
