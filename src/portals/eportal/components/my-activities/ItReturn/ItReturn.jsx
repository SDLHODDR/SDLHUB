import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Form12BTab from "./tabs/Form12BTab";
import IncomeSourcesTab from "./tabs/IncomeSourcesTab";
import DeductionsTab from "./tabs/DeductionsTab";
import ExemptionsTab from "./tabs/ExemptionsTab";
import PreviewPrintTab from "./tabs/PreviewPrintTab";

import { getItReturnConfig } from "../../../services/itReturnService";

const ItReturn = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const [refreshPreview, setRefreshPreview] = useState(0);
  const [canEdit, setCanEdit] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const triggerPreviewRefresh = () => {
    setRefreshPreview((prev) => prev + 1);
  };

  /* =========================================
     LOAD CONFIG (RUN ONCE)
  ========================================= */
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await getItReturnConfig();
      if (res?.status) {
        setCanEdit(Boolean(res.can_edit));
      }
    } catch (error) {
      console.error("Config load error:", error);
    } finally {
      setLoadingConfig(false);
    }
  }; 

  /* =========================================
     TAB CONFIG (IMPORTANT FIX)
     - DO NOT store JSX here
     - Store component reference only
  ========================================= */
  const tabs = [
    {
      id: "tab1",
      label: "Form 12 B",
      Component: Form12BTab,
    },
    {
      id: "tab2",
      label: "Income - Sources & Regime",
      Component: IncomeSourcesTab,
    },
    {
      id: "tab3",
      label: "Deductions",
      Component: DeductionsTab,
    },
    {
      id: "tab4",
      label: "Exemptions - Section & HRA Exemptions",
      Component: ExemptionsTab,
    },
    {
      id: "tab5",
      label: "Preview and Print",
      Component: PreviewPrintTab,
    },
  ];

  /* =========================================
     LOADING STATE
  ========================================= */
  if (loadingConfig) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>IT Return</h4>
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/eportal/dashboard">Home</Link>
            </li>
            <li className="breadcrumb-item active">
              IT Return
            </li>
          </ol>
        </nav>
      </div>

      {/* CARD */}
      <div className="card">
        <div className="card-body">

          {/* TABS HEADER */}
          <ul className="nav nav-tabs border-bottom mb-4">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === tab.id
                        ? "2px solid #f59e0b"
                        : "2px solid transparent",
                    padding: "12px 18px",
                    fontWeight:
                      activeTab === tab.id ? 600 : 500,
                    color:
                      activeTab === tab.id ? "#000" : "#6c757d",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* TAB CONTENT */}
          <div className="tab-content">
            {tabs.map(({ id, Component }) =>
              activeTab === id ? (
                <div
                  key={id}
                  className="tab-pane fade show active"
                >
                  <Component                   
                    editable={canEdit}
                    onDataSaved={triggerPreviewRefresh}
                    refreshPreview={refreshPreview}
                  />
                </div>
              ) : null
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ItReturn;