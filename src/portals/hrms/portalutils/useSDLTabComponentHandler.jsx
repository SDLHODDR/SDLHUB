import { useMemo, useState, useCallback } from "react";
import OrganogramTab from "./OrganogramTab";

/**
 * Handler hook for SDLTabsComponent usage in Organogram.
 * Owns: tab definitions, active tab state, and tab -> content mapping.
 */
const useSDLTabComponentHandler = (organogramId) => {
  /* ==========================================================
      TAB DEFINITIONS
  ========================================================== */
  // const tabs = useMemo(
  //   () => [{ key: "organogram", label: "Organogram" }],
  //   []
  // );

  const tabs = useMemo(() => [{ key: "organogram", label: "Organogram" }], []);  

  /* ==========================================================
      ACTIVE TAB STATE
  ========================================================== */
  const [selectedTab, setSelectedTab] = useState("organogram");

  // const handleTabChange = useCallback((tabKey) => {
  //   setSelectedTab(tabKey);
  // }, []);
  const handleTabChange = useCallback((tabKey) => setSelectedTab(tabKey), []);

  /* ==========================================================
      TAB CONTENT
  ========================================================== */
  const tabContent = useMemo(() => {
    switch (selectedTab) {
      case "organogram":
        return <OrganogramTab organogramId={organogramId} />;
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