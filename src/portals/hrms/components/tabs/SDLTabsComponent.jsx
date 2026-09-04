const SDLTabsComponent = ({
  tabs = [],
  selectedTab,
  onTabChange,
  tabContent,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <span className="spinner-border" role="status" />
      </div>
    );
  }

  if (!tabs.length) {
    return <div className="text-muted">No tabs available.</div>;
  }

  const navClass = `nav nav-pills tab-style-5 d-sm-flex d-block ${
    tabs.length > 1 ? "nav-justified" : ""
  }`;

  return (
    <>
      {/* <ul className="nav nav-tabs mb-3 border-bottom-0" role="tablist"> */}
      <ul className={navClass} id="pills-tab" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.key} role="presentation">
            <button
              type="button"
              className={`nav-link ${selectedTab === tab.key ? "active" : ""}`}
              role="tab"
              aria-selected={selectedTab === tab.key}
              onClick={() => onTabChange?.(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content" id="pills-tabContent">
        <div className="tab-pane show active text-dark" tabindex="0" role="tabpanel">
          {tabContent}
        </div>
      </div>
    </>
  );
};

export default SDLTabsComponent;