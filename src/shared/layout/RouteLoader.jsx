import "../assets/css/sdlPageLoader.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/*
 * Brief loader shown on each page change. It is rendered inside MainLayout's content area,
 * so it covers only the page content; the header, menu and footer stay in place.
 */
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
    <div className="sdl-page-loader sdl-route-loader" role="status" aria-live="polite">
      <div className="sdl-page-loader-size">
        <div className="whirly-loader">Loading</div>
      </div>
    </div>
  );
};

export default RouteLoader;
