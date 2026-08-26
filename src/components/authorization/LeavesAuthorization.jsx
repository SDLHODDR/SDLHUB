import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import LeavesAuthorizationModal from "../../portals/eportal/modal/LeavesAuthorizationModal";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";
import { useLeavesAuthorizationHandler } from "./useLeavesAuthorizationHandler";
import { getLeavesAuthorizationColumns } from "./LeavesAuthorizationColumns";

const LeavesAuthorization = () => {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedLeaves,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
  } = useLeavesAuthorizationHandler();

  const columns = getLeavesAuthorizationColumns(openModal, formatDashDate);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Leaves Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Leaves Authorization" },
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
                placeholder="Search Leaves..."
                style={{ width: "270px" }}
              />
            </div>
          </div>

          <div className="company-policies-table">
            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage="No Tasks found"
              className="company-policies-grid"
              removableSort
              onRowClick={(e) => openModal(e.data)}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <LeavesAuthorizationModal
          leaves={selectedLeaves}
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default LeavesAuthorization;