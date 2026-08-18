import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import TicketBookingAuthorizationModal from "../../portals/eportal/modal/TicketBookingAuthorizationModal";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";
import { useTicketBookingAuthorizationHandler } from "./useTicketBookingAuthorizationHandler";
import { getTicketBookingAuthorizationColumns } from "./TicketBookingAuthorizationColumns";

const TicketBookingAuthorization = () => {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedTicketBooking,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
  } = useTicketBookingAuthorizationHandler();

  const columns = getTicketBookingAuthorizationColumns(openModal, formatDashDate);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Ticket Booking Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Ticket Booking Authorization" },
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
                placeholder="Search Ticket bookings..."
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
        <TicketBookingAuthorizationModal
          ticketbooking={selectedTicketBooking}
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default TicketBookingAuthorization;