import { useMemo, useState, useCallback, useEffect } from "react";
import OrganogramTab from "./OrganogramTab";
import LocationsTab from "./LocationsTab";
import AppraisalLevelsTab from "./AppraisalLevelsTab";

// showAll is the shared top-toggle state for tabs with list/form views.
const useSDLTabComponentHandler = (organogramId, organogramStatus, onOrganogramSaved, showAll, onCancelEdit) => {
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

  const [selectedTab, setSelectedTab] = useState("organogram");

  const handleTabChange = useCallback((tabKey) => {
    setSelectedTab(tabKey);
  }, []);

  useEffect(() => {
    if (!organogramId && selectedTab !== "organogram") {
      setSelectedTab("organogram");
    }
  }, [organogramId, selectedTab]);

  const tabContent = useMemo(() => {
    switch (selectedTab) {
      case "organogram":
        return(
          <OrganogramTab
            organogramId={organogramId}
            organogramStatus={organogramStatus}
            onOrganogramSaved={onOrganogramSaved}
          />
        );
     case "locations":
        return (
          <LocationsTab
            organogramId={organogramId}
            organogramStatus={organogramStatus}
            onOrganogramSaved={onOrganogramSaved}
            showAll={showAll}
            onCancelEdit={onCancelEdit}
          />
        );
      case "appraisalLevels":
        return (
          <AppraisalLevelsTab
            organogramId={organogramId}
            organogramStatus={organogramStatus}
            showAll={showAll}
            onCancelEdit={onCancelEdit}
          />
        );
      default:
        return null;
    }
  }, [selectedTab, organogramId, organogramStatus, onOrganogramSaved, showAll, onCancelEdit]);

  return { tabs, selectedTab, handleTabChange, tabContent };
};

export default useSDLTabComponentHandler;