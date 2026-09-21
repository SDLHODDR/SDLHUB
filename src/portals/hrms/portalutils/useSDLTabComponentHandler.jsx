import { useMemo, useState, useCallback, useEffect } from "react";
import OrganogramTab from "./OrganogramTab";
import LocationsTab from "./LocationsTab";
import AppraisalLevelsTab from "./AppraisalLevelsTab";
import ReportingTab from "./ReportingTab";
import AllowancesTab from "./AllowancesTab";

// showAll is the shared top-toggle state for tabs with list/form views.
const useSDLTabComponentHandler = (organogramId, onOrganogramSaved, showAll) => {
  const tabs = useMemo(() => {
    const base = [{ key: "organogram", label: "Organogram" }];
    if (organogramId) {
      base.push(
        { key: "locations", label: "Locations" },
        { key: "appraisalLevels", label: "Appraisal Levels" },
        { key: "reporting", label: "Reporting" },
        { key: "allowances", label: "Allowances" }
      );
    }
    return base;
  }, [organogramId]);

  const [selectedTab, setSelectedTab] = useState("organogram");
  const [tabContext, setTabContext] = useState(null);

  const handleTabChange = useCallback((tabKey, context = null) => {
    setSelectedTab(tabKey);
    setTabContext(context);
  }, []);

  useEffect(() => {
    if (!organogramId && selectedTab !== "organogram") {
      setSelectedTab("organogram");
      setTabContext(null);
    }
  }, [organogramId, selectedTab]);

  const tabContent = useMemo(() => {
    switch (selectedTab) {
      case "organogram":
        return(
          <OrganogramTab
            organogramId={organogramId}
            onOrganogramSaved={onOrganogramSaved}
          />
        );
     case "locations":
        return (
          <LocationsTab
            organogramId={organogramId}
            onNavigateToTab={handleTabChange}
            onOrganogramSaved={onOrganogramSaved}
            showAll={showAll}
          />
        );
      case "appraisalLevels":
        return <AppraisalLevelsTab organogramId={organogramId} showAll={showAll} />;
      case "reporting":
        return <ReportingTab organogramId={organogramId} locId={tabContext?.LOC_ID} />;
      case "allowances":
        return (
          <AllowancesTab
            organogramId={organogramId}
            locId={tabContext?.LOC_ID}
            allowId={tabContext?.ALLOW_ID}
          />
        );
      default:
        return null;
    }
  }, [selectedTab, organogramId, tabContext, handleTabChange, onOrganogramSaved, showAll]);

  return { tabs, selectedTab, handleTabChange, tabContent };
};

export default useSDLTabComponentHandler;