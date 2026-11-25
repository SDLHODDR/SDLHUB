import { useState } from "react";
import WorkSummary from "./WorkSummary";
import LeaveSummary from "./LeaveSummary";
import SDLTabsComponent from "../../../../hrms/components/tabs/SDLTabsComponent";

// Same tab style as the rest of ePortal / HRMS (My Documents, IT Declaration, Profile).
const TABS = [
  { key: "work", label: "Work" },
  { key: "leave", label: "Leave" },
];

const WorkLeaveTabs = ({ workData, leaveData }) => {
  const [activeTab, setActiveTab] = useState("work");

  return (
    <div className="card shadow-sm border-0 h-100 mb-0">
      <div className="card-body p-2 work-leave-tabs">
        <SDLTabsComponent tabs={TABS} selectedTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "work" ? (
            <WorkSummary data={workData} />
          ) : (
            <LeaveSummary data={leaveData} />
          )}
        </SDLTabsComponent>
      </div>
    </div>
  );
};

export default WorkLeaveTabs;
