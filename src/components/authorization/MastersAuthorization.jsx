import { useParams } from "react-router-dom";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";

import { useMastersAuthorizationHandler } from "./useMastersAuthorizationHandler";
import { getMastersAuthorizationColumns } from "./MastersAuthorizationColumns";
import MastersAuthorizationModal from "./MastersAuthorizationModal";

// Map TASK_ID -> Page Title & Endpoints for Masters
const MASTER_TASK_CONFIG = {
  53: {
    title: "Change Personal Info - Authorization",
    type: "PERSONAL",
    endpoint: "/api/hrms/masters/personal-info",
  },
  54: {
    title: "Change Family Info - Authorization",
    type: "FAMILY",
    endpoint: "/api/hrms/masters/family-info",
  },
  55: {
    title: "Change Bank Info - Authorization",
    type: "BANK",
    endpoint: "/api/hrms/masters/bank-info",
  },
  56: {
    title: "Organogram - Authorization",
    type: "ORGANOGRAM",
    endpoint: "/api/hrms/masters/organogram",
  },
};

const MastersAuthorization = () => {
  const { tid } = useParams();
  const config = MASTER_TASK_CONFIG[tid] || {
    title: "Master Changes Authorization",
    type: "GENERAL",
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
    refreshList,
  } = useMastersAuthorizationHandler(tid);

  const columns = getMastersAuthorizationColumns(formatDashDate, tid);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>{config.title}</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/hrms/dashboard" },
            { text: "Masters Authorization", link: "#" },
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
              emptyMessage="No Pending Master Requests Found"
              className="company-policies-grid"
              removableSort
              onRowClick={(e) => openModal(e.data)}
            />
          </div>
        </div>
      </div>

      <MastersAuthorizationModal
        type={config.type}
        show={showModal}
        record={selectedRecord}
        onClose={closeModal}
        onSuccess={refreshList}
      />
    </>
  );
};

export default MastersAuthorization;