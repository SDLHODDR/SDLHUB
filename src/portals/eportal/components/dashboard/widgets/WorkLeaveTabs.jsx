import { useState } from "react";
import WorkSummary from "./WorkSummary";
import LeaveSummary from "./LeaveSummary";

const WorkLeaveTabs = ({ workData, leaveData }) => {
  const [activeTab, setActiveTab] = useState("work");

  return (
    <div className="card shadow-sm border-0 h-100">

      {/* HEADER TABS */}
      <div className="card-header p-0">
        <div className="d-flex">
          <button
            className={`tab-btn ${activeTab === "work" ? "active" : ""}`}
            onClick={() => setActiveTab("work")}
          >
            Work
          </button>

          <button
            className={`tab-btn ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => setActiveTab("leave")}
          >
            Leave
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="card-body p-2">
        {activeTab === "work" ? (
          <WorkSummary data={workData} /> 
        ) : (
          <LeaveSummary data={leaveData} />
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: #f8f9fa;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: #fff;
          border-bottom: 2px solid #0d6efd;
          font-weight: 600;
          color: #0d6efd;
        }

        .tab-btn:hover {
          background: #eef3ff;
        }
      `}</style>
    </div>
  );
};

export default WorkLeaveTabs;
