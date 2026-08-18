import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import OutdoorDutyAuthorizationModal from "../../portals/eportal/modal/OutdoorDutyAuthorizationModal";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";
import { useOutdoorDutyAuthorizationHandler } from "./useOutdoorDutyAuthorizationHandler";
import { getOutdoorDutyAuthorizationColumns } from "./OutdoorDutyAuthorizationColumns";

const OutdoorDutyAuthorization = () => {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedOutduty,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
  } = useOutdoorDutyAuthorizationHandler();

  const columns = getOutdoorDutyAuthorizationColumns(openModal, formatDashDate);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Outdoor Duty Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Outdoor Duty Authorization" },
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
                placeholder="Search Outduties..."
                style={{ width: "120px" }}
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
            />
          </div>
        </div>
      </div>

      {showModal && (
        <OutdoorDutyAuthorizationModal
          outddorduty={selectedOutduty}
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default OutdoorDutyAuthorization;