import { useParams } from "react-router-dom";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";

import { useTenureAuthorizationHandler } from "./useTenureAuthorizationHandler";
import { getTenureAuthorizationColumns } from "./TenureAuthorizationColumns";
import TenureAuthorizationModal from "./TenureAuthorizationModal";

// Map TASK_ID -> Page Title & Endpoints for Masters
const TENURE_TASK_CONFIG = {
  25: {
    title: "Employee Tenure Change",
    modal: "TenureChangeAssessment",
    id: 25,
    type: "EMPTENURECHG"    
  },
};

const TenureChangeAuthorization = () => {
  const { tid } = useParams();
  const config = TENURE_TASK_CONFIG[tid] || {
    title: "Employee Tenure Change",
  };

  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedRecord,
    showModal,
    openModal,
    closeModal,
    refreshList
  } = useTenureAuthorizationHandler(tid);

  const columns = getTenureAuthorizationColumns(formatDashDate, tid);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>{config.title}</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/hrms/dashboard" },
            { text: "Tenure Authorization", link: "#" },
            { text: config.title },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <SDLSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Requests..."
                style={{ width: "270px" }}
              />
            </div>
          </div>

          <div className="company-policies-table">
            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage="No Pending Tenure Requests Found"
              className="company-policies-grid"
              removableSort
              onRowClick={(e) => {
                const row = e?.data ?? e;
                //console.log("Row clicked:", row); // Check your console!
                openModal(row);
              }}
            />
          </div>
        </div>
      </div>

      <TenureAuthorizationModal
        config={config}
        show={showModal}
        record={selectedRecord}
        onClose={closeModal}
        onSuccess={refreshList}
      />
    </>
  );
};

export default TenureChangeAuthorization;
