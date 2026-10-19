import { useMemo, useState, useCallback, useEffect } from "react";
import OrganogramTab from "./OrganogramTab";
import LocationsTab from "./LocationsTab";
import AppraisalLevelsTab from "./AppraisalLevelsTab";

// showAll is the shared top-toggle state for tabs with list/form views.
const useSDLTabComponentHandler = (organogramId, organogramStatus, onOrganogramSaved, showAll, onCancelEdit, initialTab = "organogram") => {
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

  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [visitedTabs, setVisitedTabs] = useState(() =>
    initialTab === "appraisalLevels" && organogramId
      ? ["organogram", "appraisalLevels"]
      : ["organogram"]
  );

  const handleTabChange = useCallback((tabKey) => {
    setSelectedTab(tabKey);
    setVisitedTabs((previous) =>
      previous.includes(tabKey) ? previous : [...previous, tabKey]
    );
  }, []);

  useEffect(() => {
    if (!organogramId && selectedTab !== "organogram") {
      setSelectedTab("organogram");
    }
  }, [organogramId, selectedTab]);

  const tabContent = useMemo(() => (
    <>
      {visitedTabs.map((tabKey) => (
        <div key={tabKey} hidden={selectedTab !== tabKey}>
          {tabKey === "organogram" && (
            <OrganogramTab
              organogramId={organogramId}
              organogramStatus={organogramStatus}
              onOrganogramSaved={onOrganogramSaved}
            />
          )}
          {tabKey === "locations" && organogramId && (
            <LocationsTab
              organogramId={organogramId}
              organogramStatus={organogramStatus}
              onOrganogramSaved={onOrganogramSaved}
              showAll={showAll}
              onCancelEdit={onCancelEdit}
            />
          )}
          {tabKey === "appraisalLevels" && organogramId && (
            <AppraisalLevelsTab
              organogramId={organogramId}
              organogramStatus={organogramStatus}
              showAll={showAll}
              onCancelEdit={onCancelEdit}
            />
          )}
        </div>
      ))}
    </>
  ), [visitedTabs, selectedTab, organogramId, organogramStatus, onOrganogramSaved, showAll, onCancelEdit]);

  return { tabs, selectedTab, handleTabChange, tabContent };
};

export default useSDLTabComponentHandler;