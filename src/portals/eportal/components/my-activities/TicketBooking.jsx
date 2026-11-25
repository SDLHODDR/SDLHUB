import { useEffect, useState, useMemo } from "react";
import { ActivityPageLayout, ActivitySectionHead, ActivityFilterBar } from "./common/ActivityLayout";
import { useDispatch, useSelector } from "react-redux";
import { getTicketBookingDataResponse } from "../../store/ePortalTicketBookingSlice";
import { createTicketBookingHandlers } from "../../utils/ticketBookingHandlers";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLCalendar from "../../../../shared/components/calendar/SDLCalendar";
import TicketBookingModal from "../../modal/TicketBookingModal";
import { ticketBookingColumns } from "../../utils/columnHandlers/ticketBookingColumns";
import { getAuthroizationTaskCount } from "../../store/ePortalAuthorizationCountSlice";
import { notifyWarning } from "../../../../shared/services/alertService";
import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import "../../../../shared/assets/css/companyPolicies.css";
import "../../assets/css/ticketBooking.css";
import SDLPageLoader from "../../../../shared/components/SDLPageLoader"
import { handleError } from "../../../../shared/services/errorHandler";

const TicketBooking = () => {
  const dispatch = useDispatch();
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
      handleError(error, { context: "Build ticket booking rows", notify: false });
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
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = modalDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
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

      <ActivityPageLayout
        calendarTitle="Select Travel Date"
        calendarSubtitle="Select a date to create a ticket booking"
        calendar={<SDLCalendar mode="inline" openModal={openModal} />}
        overlay={
          loading && (
            <div className="ticket-booking-loading-overlay">
              <SDLPageLoader />
            </div>
          )
        }
      >
              <ActivitySectionHead
                title="Ticket Booking Requests"
                subtitle="View and track your ticket booking requests"
              />

              <div className="position-relative flex-grow-1">
                <ActivityFilterBar
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search Ticket Booking..."
                  statusValue={statusFilter}
                  onStatusChange={setStatusFilter}
                  statusOptions={statusOptions}
                  onReset={clearFilters}
                  resetDisabled={statusFilter === "ALL" && !searchQuery}
                />

                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  className="ticket-booking-preview-table"
                  tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
                  scrollable={false}
                  loading={false}
                  emptyMessage={
                    loading
                      ? " "
                      : searchQuery || statusFilter !== "ALL"
                      ? "No ticket booking requests match the selected filter"
                      : "No ticket booking requests found"
                  }
                  removableSort
                />
              </div>
      </ActivityPageLayout>

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
