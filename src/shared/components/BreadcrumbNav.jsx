import { useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPortalFromPath } from "../config/portalConfig";
import { findMenuEntry, getMenuTrailVersion, subscribeMenuTrail } from "./breadcrumbMenuStore";
import "../assets/css/breadcrumbNav.css";

const sameText = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

/*
 * Every page shows Home / Main menu / Sub menu. Home always goes to the portal dashboard.
 * Main and sub menu names come from the portal menu when the page is on it; pages that
 * are not on the menu (task screens, sub pages) keep the items they pass in.
 */
const BreadcrumbNav = ({ items = [] }) => {
    const location = useLocation();
    useSyncExternalStore(subscribeMenuTrail, getMenuTrailVersion);

    const portal = getPortalFromPath(location.pathname);
    const home = { text: "Home", link: `/${portal.key}/dashboard` };
    const passed = items.filter((item) => item && item.text);
    const rest = passed.length && sameText(passed[0].text, "Home") ? passed.slice(1) : passed;

    let trail;
    const entry = findMenuEntry(portal.key, location.pathname);
    if (entry && entry.path !== home.link) {
        trail = [home];
        if (entry.main) trail.push({ text: entry.main });
        trail.push({ text: entry.sub, link: entry.exact ? undefined : entry.path });
        // A page below a menu item (e.g. Tenure Change / Assessment) keeps its own title.
        const last = rest[rest.length - 1];
        if (!entry.exact && last && !sameText(last.text, entry.sub)) trail.push({ text: last.text });
    } else {
        trail = [home, ...rest];
    }

    return (
        <nav aria-label="breadcrumb" className="sdl-breadcrumb">
            <ol className="breadcrumb">
                {trail.map((item, index) => {
                    const isLast = index === trail.length - 1;
                    const linkable = !isLast && item.link && item.link !== "#";
                    return (
                        <li
                            key={index}
                            className={`breadcrumb-item ${isLast ? "active" : ""}`}
                            aria-current={isLast ? "page" : undefined}
                        >
                            {linkable ? <Link to={item.link}>{item.text}</Link> : <span>{item.text}</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNav;
