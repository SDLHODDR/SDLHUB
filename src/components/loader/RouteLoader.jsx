import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    }, 300); // smooth transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div id="global-loader">
      <div className="whirly-loader"></div>
    </div>
  );
};

export default RouteLoader;
