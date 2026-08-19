import { useMemo, useState, useCallback, useEffect } from "react";
import OrganogramTab from "./OrganogramTab";
import LocationsTab from "./LocationsTab";
import AppraisalLevelsTab from "./AppraisalLevelsTab";

/**
 * Handler hook for SDLTabsComponent usage in Organogram.
 * Owns: tab definitions (dynamic based on selection), active tab state,
 * and tab -> content mapping.
 */
const useSDLTabComponentHandler = (organogramId) => {
  /* ==========================================================
      TAB DEFINITIONS (dynamic — Locations & Appraisal Levels
      only appear once an organogram is selected)
  ========================================================== */
  const tabs = useMemo(() => {
    const base = [{ key: "organogram", label: "Organogram" }];

    if (organogramId) {
      base.push(
        { key: "locations", label: "Locations" },
        { key: "appraisalLevels", label: "Appraisal Levels" }
      );
    }

    return base;
  }, [organogramId]);

  /* ==========================================================
      ACTIVE TAB STATE
  ========================================================== */
  const [selectedTab, setSelectedTab] = useState("organogram");

  const handleTabChange = useCallback((tabKey) => setSelectedTab(tabKey), []);

  // If organogramId is cleared (dropdown reset), fall back to the
  // "Organogram" tab since Locations/Appraisal Levels no longer exist.
  useEffect(() => {
    if (!organogramId && selectedTab !== "organogram") {
      setSelectedTab("organogram");
    }
  }, [organogramId, selectedTab]);

  /* ==========================================================
      TAB CONTENT
  ========================================================== */
  const tabContent = useMemo(() => {
    switch (selectedTab) {
      case "organogram":
        return <OrganogramTab organogramId={organogramId} />;
      case "locations":
        return <LocationsTab organogramId={organogramId} />;
      case "appraisalLevels":
        return <AppraisalLevelsTab organogramId={organogramId} />;
      default:
        return null;
    }
  }, [selectedTab, organogramId]);

  return {
    tabs,
    selectedTab,
    handleTabChange,
    tabContent,
  };
};

export default useSDLTabComponentHandler;