import { useEffect, useMemo, useState, useCallback } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { getConferenceRooms } from "../../services/conferenceService";
import ConferenceBookingModal from "../../modal/ConferenceBookingModal";
import ConferenceYearlyBookings from "../../modal/ConferenceYearlyBookings";
import ConferenceScheduler from "./ConferenceScheduler";

import { OverlayTrigger } from "react-bootstrap";
import { renderConferenceTooltip } from "../../utils/tooltipHelper";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import Badge from "../Badge";
import { getPortalFromPath } from "../../../../config/portalConfig";

const ConferenceRoom = () => {
  /* =========================================================
     DATA
  ========================================================= */

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

	// Get current portal dynamically
	const portal = getPortalFromPath(location.pathname);
	const portalHome = `/${portal.key}/dashboard`;

  /* =========================================================
     SEARCH
  ========================================================= */

  const [searchQuery, setSearchQuery] = useState("");

  /* =========================================================
     SERVER-SIDE PAGINATION
  ========================================================= */

  const [rows, setRows] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  /* =========================================================
     MODALS / VIEWS
  ========================================================= */

  const [showScheduler, setShowScheduler] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAllBookings, setShowAllBookings] = useState(false);

  /* =========================================================
     OPEN BOOKING MODAL
  ========================================================= */

  const openModal = (row = null) => {
    if (row) {
      setSelectedBooking(row);
    } else {
      setSelectedBooking({});
    }

    setShowModal(true);
  };

  /* =========================================================
     CLOSE BOOKING MODAL
  ========================================================= */

  const closeModal = () => {
    setSelectedBooking(null);
    setShowModal(false);
  };

  /* =========================================================
     FETCH DATA
     SERVER-SIDE PAGINATION
  ========================================================= */

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);

    try {
      const res = await getConferenceRooms({
        page,
        limit,
      });

      if (res?.status) {
        const responseData = res?.data || {};

        const fetchedBookings = responseData?.data || [];

        setBookings(
          Array.isArray(fetchedBookings)
            ? fetchedBookings
            : []
        );

        setTotalRecords(
          Number(responseData?.totalRecords || 0)
        );

        setCurrentPage(
          Number(responseData?.page || page)
        );
      } else {
        setBookings([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Conference rooms load failed:", err);

      setBookings([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchData(1, 10);
  }, [fetchData]);

  /* =========================================================
     REFRESH TABLE

     Call this after adding/updating/deleting booking.
  ========================================================= */

  const refreshTable = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, rows);
  }, [fetchData, rows]);

  /* =========================================================
     PAGINATION HANDLER
  ========================================================= */

  const handlePageChange = (event) => {
    const newPage = Math.floor(event.first / event.rows) + 1;

    const newRows = event.rows;

    setRows(newRows);
    setCurrentPage(newPage);

    fetchData(newPage, newRows);
  };

  /* =========================================================
     SEARCH

     NOTE:
     This currently searches only the records loaded
     on the current server page.

     For complete search across all 75 records,
     search should later be moved to PHP/API.
  ========================================================= */

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookings;
    }

    const query = searchQuery.toLowerCase().trim();

    return bookings.filter(
      (item) =>
        item.ROOM_LABEL?.toLowerCase().includes(query) ||
        item.DT?.toLowerCase().includes(query)
    );
  }, [searchQuery, bookings]);

  /* =========================================================
     DURATION FORMATTER
  ========================================================= */

  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    let diff = endMinutes - startMinutes;

    // Handle overnight booking
    if (diff < 0) {
      diff += 24 * 60;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  };

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  const getStatusBadge = (status) => {
    switch (status) {
      case "A":
        return <Badge text="Confirmed" className="bg-success" />;
      case "R":
        return <Badge text="Rejected" className="bg-danger" />;
      case "D":
        return <Badge text="Booking Deleted" className="bg-danger" />;
      case "N":
        return <Badge text="Planned" className="bg-warning" />;
      case "X":
        return <Badge text="Booking Cancelled" className="bg-secondary" />;
      case "T":
        return <Badge text="Confirmation Pending" className="bg-blue" />;
      default:
        return <Badge text={status} className="bg-light text-dark" />;
    }
  };

  /* =========================================================
     SERIAL NUMBER

     Important:
     options.rowIndex starts from 0 for each page.

     So we add the page offset here.
  ========================================================= */

  const serialBody = (rowData, options) => {
    return (currentPage - 1) * rows + options.rowIndex + 1;
  };

  /* =========================================================
     DURATION COLUMN
  ========================================================= */

  const durationBody = (row) => (
    <OverlayTrigger
      placement="right"
      overlay={renderConferenceTooltip(row)}
      delay={{
        show: 200,
        hide: 100,
      }}
      container={document.body}
    >
      <span>
        {calculateDuration(
          row.STARTTIME,
          row.ENDTIME
        )}
      </span>
    </OverlayTrigger>
  );

  /* =========================================================
     REASON COLUMN
  ========================================================= */

  const reasonBody = (row) => {
    const text = row.REMARKS || "-";

    return (
      <span title={text}>
        {text.length > 25
          ? `${text.substring(0, 25)}...`
          : text}
      </span>
    );
  };

  /* =========================================================
     STATUS COLUMN
  ========================================================= */

  const statusBody = (row) => {
    return getStatusBadge(row.STATUS);
  };

  /* =========================================================
     ACTION COLUMN
  ========================================================= */

  const actionBody = (row) => (
    <button
      type="button"
      className="btn btn-icon btn-sm btn-primary"
      onClick={() => openModal(row)}
      title="View"
    >
      <i className="ti ti-eye"></i>
    </button>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Conference Room</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Conference Room",
            },
          ]}
        />
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="row">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-end gap-2">

              {/* ADD BOOKING */}

              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => openModal(null)}
              >
                <i className="fas fa-plus"></i>
                Add Booking
              </button>

              {/* TIMELINE VIEW */}

              <button
                type="button"
                className="btn btn-info d-flex align-items-center gap-2"
                onClick={() =>
                  setShowScheduler((prev) => !prev)
                }
              >
                <i className="fas fa-calendar-alt"></i>
                Timeline View
              </button>

              {/* VIEW ALL */}

              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setShowAllBookings(true)}
              >
                <i className="fas fa-table"></i>
                View All
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TIMELINE
      ===================================================== */}

      {showScheduler && (
        <ConferenceScheduler
          bookings={bookings}
        />
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="row">
        <div className="card">
          <div className="card-body">

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="row mb-3">
              <div className="col-lg-4 col-md-6">

                <div className="search-set">
                  <div className="search-input position-relative">

                    <span className="btn-searchset">
                      <i className="ti ti-search"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Room / Date..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />

                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="p-4 text-center">
                <div className="spinner-border text-warning"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-4 text-center text-muted">
                No bookings found
              </div>
            ) : (

              /* =================================================
                 PRIME REACT DATATABLE
              ================================================= */

              <DataTable
                value={filteredData}
                loading={loading}

                /* SERVER-SIDE PAGINATION */
                paginator
                lazy
                first={(currentPage - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}

                rowsPerPageOptions={[
                  10,
                  25,
                  50,
                  100,
                ]}

                onPage={handlePageChange}

                /* TABLE OPTIONS */
                stripedRows
                showGridlines
                removableSort

                responsiveLayout="scroll"
                scrollable

                paginatorDropdownAppendTo="self"

                emptyMessage="No bookings found"

                className="p-datatable-sm"

                dataKey="ID"
              >

                {/* SERIAL NUMBER */}

                <Column
                  header="#"
                  body={serialBody}
                  style={{
                    width: "70px",
                  }}
                />

                {/* ROOM */}

                <Column
                  field="ROOM_LABEL"
                  header="Room"
                  sortable
                />

                {/* DATE */}

                <Column
                  field="DT"
                  header="Date"
                  sortable
                />

                {/* DURATION */}

                <Column
                  header="Duration"
                  body={durationBody}
                />

                {/* BOOKED BY */}

                <Column
                  field="BOOK_BY_NAME"
                  header="Booked By"
                  sortable
                />

                {/* REQUESTED ON */}

                <Column
                  field="CHG_ON"
                  header="Requested On"
                  sortable
                />

                {/* REASON */}

                <Column
                  header="Reason"
                  body={reasonBody}
                />

                {/* STATUS */}

                <Column
                  header="Status"
                  body={statusBody}
                />

                {/* ACTION */}

                <Column
                  header="Action"
                  body={actionBody}
                  style={{
                    width: "90px",
                  }}

                />

              </DataTable>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {showModal && (
        <ConferenceBookingModal
          booking={selectedBooking}
          mode={
            selectedBooking?.ID
              ? "view"
              : "add"
          }
          onClose={closeModal}
          refreshTable={refreshTable}
        />
      )}

      {/* =====================================================
          YEARLY BOOKINGS MODAL
      ===================================================== */}

      {showAllBookings && (
        <ConferenceYearlyBookings
          bookings={bookings}
          onClose={() =>
            setShowAllBookings(false)
          }
        />
      )}
    </>
  );
};

export default ConferenceRoom;
