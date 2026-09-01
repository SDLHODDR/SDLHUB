import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTicketBookingDataResponse } from "../../../../store/eportal/ePortalTicketBookingSlice";
import { createTicketBookingHandlers } from "../../utils/ticketBookingHandlers";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import TicketBookingModal from "../../modal/TicketBookingModal";
import { ticketBookingColumns } from "../../utils/columnHandlers/ticketBookingColumns";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";
import { notifyWarning } from "../../../../services/alertService";
import { getPortalFromPath } from "../../../../config/portalConfig";
import "../../assets/css/companyPolicies.css";

const TicketBooking = () => {
  const dispatch = useDispatch();
  const [modalLoading, setModalLoading] = useState(false);
  const ticketBookingData = useSelector((state) => state.eportalTBRData.data);
  const loading = useSelector((state) => state.eportalTBRData.loading);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  useEffect(() => {
    dispatch(getTicketBookingDataResponse());
  }, [dispatch, refreshKey]);

  const listData = useMemo(() => {
    try {
      return (ticketBookingData || []).map((item, index) => ({
        id: item.id || index,
        person_name: item.person_name || "-",
        trvl_mode: item.trvl_mode || "-", // uncommented — needed for search filter below
        trvl_date: item.trvl_date || "-",
        trvl_from_location: item.trvl_from_location || "-",
        trvl_to_loc: item.trvl_to_loc || "-",
        trvl_ft_name: item.trvl_ft_name || "-",
        trvl_ft_no: item.trvl_ft_no || "-",
        statusText: item.approval || "-",
        remarks: item.remarks || "-",
        statusColor: item.statusColor || "-",
        status: item.status || "-",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [ticketBookingData]);

  /* ================= FILTERS (status + search, independent of each other) ================= */
  const filteredData = useMemo(() => {
    let data = [...listData];

    // STATUS FILTER — runs regardless of whether a search query exists
    if (statusFilter && statusFilter !== "ALL") {
      data = data.filter(
        (item) =>
          String(item?.status ?? "").trim().toUpperCase() ===
          String(statusFilter).trim().toUpperCase(),
      );
    }

    // SEARCH FILTER
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data;
    }

    return data.filter(
      (item) =>
        item.person_name?.toLowerCase().includes(query) ||
        item.trvl_mode?.toLowerCase().includes(query) ||
        item.remarks?.toLowerCase().includes(query),
    );
  }, [searchQuery, statusFilter, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setModalLoading(true);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = modalDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        setModalLoading(false);
        notifyWarning(
          "It is not permitted to raise a Ticket Booking request for past dates",
          "Not Permitted",
        );
        return;
      }
    }

    setModalState({
      isOpen: true,
      mode: config.mode || "create",
      modalDate: config.modalDate || null,
      id: config.id || null,
      isPostRemark: config.isPostRemark || null,
    });

    setModalLoading(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "TicketBooking",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header: "Ticket Booking",
    form_text: "Manage Your ticket booking",
    showHeader: true,
    showLayout: true,
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setModalLoading(false);
  };

  const handleSuccess = () => {
    dispatch(getTicketBookingDataResponse());
    setRefreshKey((prev) => prev + 1);
    dispatch(getAuthroizationTaskCount());
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  /* ============================================================
     STATUS OPTIONS — one entry per real status code seen in the API data
     (A, N, R, T, X). Removed the duplicate "Pending from Admin" (N) —
     if that's meant to be a distinct status, it needs its own code
     from the backend first.
  ============================================================ */
  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: "All Status" },
      { value: "A", label: "Approved" },
      { value: "N", label: "Not Sent for Auth" },
      { value: "R", label: "Rejected" },
      { value: "T", label: "In Process" },
      { value: "X", label: "Cancelled" },
    ],
    [],
  );

  const handlers = createTicketBookingHandlers({ handleSuccess });
  const columns = ticketBookingColumns(handlers);

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Ticket Booking</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Ticket Booking" },
          ]}
        />
      </div>

      {(loading || modalLoading) && (
        <div className="p-4 text-center">
          <div className="spinner-border text-warning"></div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-xl-3 border-end">
              <SDLCalendar mode="inline" openModal={openModal} />
            </div>

            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Ticket Booking Preview</h6>
              <div className="position-relative flex-grow-1">
                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Ticket Booking..."
                      style={{ width: "270px" }}
                    />
                  </div>

                  {/* STATUS — dark styled dropdown */}
                  {/* <div className="col-lg-3 col-md-4 col-12">
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div className="col-lg-3 col-md-4 col-12">
                    <select
                      className="form-select sdl-dark-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-2 col-12">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={statusFilter === "ALL" && !searchQuery}
                      onClick={clearFilters}
                    >
                      <i className="ti ti-refresh me-1"></i>
                      Reset
                    </button>
                  </div>
                </div>

                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  emptyMessage={
                    searchQuery || statusFilter !== "ALL"
                      ? "No ticket booking requests match the selected filter"
                      : "No ticket booking requests found"
                  }
                  removableSort
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalState.isOpen && (
        <TicketBookingModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default TicketBooking;