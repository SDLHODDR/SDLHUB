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

import SDLCalendar from "../../../../components/calendar/SDLCalendar";

import { getPortalFromPath } from "../../../../config/portalConfig";

const ConferenceRoom = () => {
  /* =========================================================
     DATA
  ========================================================= */

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     PORTAL
  ========================================================= */

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

  /*
   * Date selected from LEFT CALENDAR
   *
   * This date will be passed to ConferenceBookingModal
   * when creating a new booking.
   */
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  /* =========================================================
     DATE HELPER
  ========================================================= */

  const formatDateForForm = useCallback((date) => {
    if (!date) return "";

    const selectedDate = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(selectedDate.getTime())) {
      return "";
    }

    const year = selectedDate.getFullYear();

    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");

    const day = String(selectedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =========================================================
     OPEN EXISTING BOOKING
  ========================================================= */

  const openModal = useCallback((row = null) => {
    if (row) {
      /*
       * Existing booking
       */
      setSelectedBooking(row);

      /*
       * Clear calendar-created date
       */
      setSelectedCalendarDate(null);
    }

    setShowModal(true);
  }, []);

  /* =========================================================
   OPEN ADD BOOKING FROM CALENDAR
========================================================= */

  const openAddBookingModal = useCallback((config = {}) => {
    /*
     * SDLCalendar sends the selected date
     * inside config.modalDate
     */
    const selectedDate = config?.modalDate || null;

    if (!selectedDate) {
      console.warn("Conference calendar: selected date not found", config);

      return;
    }

    console.log("Conference calendar selected date:", selectedDate);

    /*
     * Store selected date
     */
    setSelectedCalendarDate(selectedDate);

    /*
     * Empty booking = ADD mode
     */
    setSelectedBooking({});

    /*
     * Open booking modal
     */
    setShowModal(true);
  }, []);

  /* =========================================================
     CLOSE BOOKING MODAL
  ========================================================= */

  const closeModal = () => {
    setSelectedBooking(null);
    setSelectedCalendarDate(null);
    setShowModal(false);
  };

  /* =========================================================
     FETCH DATA
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

        setBookings(Array.isArray(fetchedBookings) ? fetchedBookings : []);

        setTotalRecords(Number(responseData?.totalRecords || 0));

        setCurrentPage(Number(responseData?.page || page));
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
  ========================================================= */

  const refreshTable = useCallback(() => {
    setCurrentPage(1);

    fetchData(1, rows);
  }, [fetchData, rows]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handlePageChange = (event) => {
    const newPage = Math.floor(event.first / event.rows) + 1;

    const newRows = event.rows;

    setRows(newRows);
    setCurrentPage(newPage);

    fetchData(newPage, newRows);
  };

  /* =========================================================
   SORT HELPERS
========================================================= */

  const parseDateValue = (value) => {
    if (!value) return 0;

    const text = String(value).trim();

    // YYYY-MM-DD / YYYY-MM-DD HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      const timestamp = new Date(text.replace(" ", "T")).getTime();

      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }
    }

    // DD-MMM-YYYY
    // Example: 29-Aug-2026
    const match = text.match(
      /^(\d{1,2})[-\/](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\/](\d{4})$/i,
    );

    if (match) {
      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };

      const day = Number(match[1]);
      const month = months[match[2].toLowerCase()];
      const year = Number(match[3]);

      return new Date(year, month, day).getTime();
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const numericDate = text.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);

    if (numericDate) {
      const day = Number(numericDate[1]);
      const month = Number(numericDate[2]) - 1;
      const year = Number(numericDate[3]);

      return new Date(year, month, day).getTime();
    }

    // Last fallback
    const timestamp = new Date(text).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const compareValues = (a, b, field) => {
    const valueA = a?.[field];
    const valueB = b?.[field];

    // Empty values should go last
    if (valueA === null || valueA === undefined || valueA === "") {
      return 1;
    }

    if (valueB === null || valueB === undefined || valueB === "") {
      return -1;
    }

    // Date fields
    if (field === "DT" || field === "CHG_ON") {
      return parseDateValue(valueA) - parseDateValue(valueB);
    }

    // Numeric fields
    if (typeof valueA === "number" || typeof valueB === "number") {
      return Number(valueA) - Number(valueB);
    }

    // Text fields
    return String(valueA)
      .trim()
      .toLowerCase()
      .localeCompare(String(valueB).trim().toLowerCase(), undefined, {
        numeric: true,
        sensitivity: "base",
      });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  /* =========================================================
   SORTING
========================================================= */

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);

  /* =========================================================
   SEARCH + SORT
========================================================= */

  const filteredData = useMemo(() => {
    let data = [...bookings];

    /* -------------------------
     SEARCH
  ------------------------- */

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      data = data.filter(
        (item) =>
          String(item?.ROOM_LABEL || "")
            .toLowerCase()
            .includes(query) ||
          String(item?.DT || "")
            .toLowerCase()
            .includes(query) ||
          String(item?.BOOK_BY_NAME || "")
            .toLowerCase()
            .includes(query) ||
          String(item?.REMARKS || "")
            .toLowerCase()
            .includes(query),
      );
    }

    /* -------------------------
     SORT
  ------------------------- */

    if (sortField) {
      data.sort((a, b) => {
        const result = compareValues(a, b, sortField);

        return result * sortOrder;
      });
    }

    return data;
  }, [bookings, searchQuery, sortField, sortOrder]);
  /* =========================================================
     DURATION FORMATTER
  ========================================================= */

  const calculateDuration = (start, end) => {
    if (!start || !end) {
      return "-";
    }

    const [sh, sm] = start.split(":").map(Number);

    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;

    const endMinutes = eh * 60 + em;

    let diff = endMinutes - startMinutes;

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
      <span>{calculateDuration(row.STARTTIME, row.ENDTIME)}</span>
    </OverlayTrigger>
  );

  /* =========================================================
     REASON COLUMN
  ========================================================= */

  const reasonBody = (row) => {
    const text = row.REMARKS || "-";

    return (
      <span title={text}>
        {text.length > 25 ? `${text.substring(0, 25)}...` : text}
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
      className="btn btn-sm btn-outline-primary"
      onClick={() => openModal(row)}
      title="View"
    >
      <i className="ti ti-eye"></i>
    </button>
  );

  /* =========================================================
   SORT HANDLER
========================================================= */

  const handleSort = (event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
  };

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
          MAIN CARD
      ===================================================== */}

      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* =================================================
                LEFT CALENDAR
            ================================================= */}

            <div className="col-xl-3 border-end conference-calendar-column">
              <div className="mb-3">
                <h6 className="mb-1">Select Booking Date</h6>

                <small className="text-muted">
                  Select a date to create a conference booking
                </small>
              </div>

              <SDLCalendar
                mode="inline"
                openModal={openAddBookingModal}
                minDate={new Date()}
              />
            </div>

            {/* =================================================
                RIGHT CONTENT
            ================================================= */}

            <div className="col-xl-9 d-flex flex-column">
              {/* =================================================
                  TITLE + ACTION BUTTONS
              ================================================= */}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1">Conference Room Bookings</h6>

                  <small className="text-muted">
                    View and manage conference room bookings
                  </small>
                </div>

                <div className="d-flex gap-2">
                  {/* TIMELINE */}

                  <button
                    type="button"
                    className="btn btn-info d-flex align-items-center gap-2"
                    onClick={() => setShowScheduler((prev) => !prev)}
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

              {/* =================================================
                  TIMELINE
              ================================================= */}

              {showScheduler && (
                <div className="mb-3">
                  <ConferenceScheduler bookings={bookings} />
                </div>
              )}

              {/* =================================================
                  SEARCH
              ================================================= */}

              <div className="row mb-3">
                <div className="col-lg-5 col-md-6 col-sm-7">
                  <div className="search-set">
                    <div className="search-input position-relative">
                      <span className="btn-searchset">
                        <i className="ti ti-search"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Room / Date / Employee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TABLE
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
                <DataTable
                  value={filteredData}
                  loading={loading}
                  paginator
                  lazy
                  first={(currentPage - 1) * rows}
                  rows={rows}
                  totalRecords={totalRecords}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  onPage={handlePageChange}
                  /* SORTING */
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
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
                  {/* SERIAL */}

                  <Column
                    header="#"
                    body={serialBody}
                    style={{
                      width: "70px",
                    }}
                  />

                  {/* ROOM */}

                  <Column field="ROOM_LABEL" header="Room" sortable />

                  {/* DATE */}

                  <Column field="DT" header="Date" sortable />

                  {/* DURATION */}

                  <Column header="Duration" body={durationBody} />

                  {/* BOOKED BY */}

                  <Column field="BOOK_BY_NAME" header="Booked By" sortable />

                  {/* REQUESTED ON */}

                  <Column field="CHG_ON" header="Requested On" sortable />

                  {/* REASON */}

                  <Column
                    field="REMARKS"
                    header="Reason"
                    body={reasonBody}
                    sortable
                  />

                  {/* STATUS */}

                  <Column header="Status" body={statusBody} />

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
      </div>

      {/* =====================================================
          ADD / VIEW BOOKING MODAL
      ===================================================== */}

      {showModal && (
        <ConferenceBookingModal
          booking={selectedBooking}
          mode={selectedBooking?.ID ? "view" : "add"}
          /*
           * Date selected from left calendar.
           */
          selectedDate={selectedCalendarDate}
          onClose={closeModal}
          refreshTable={refreshTable}
        />
      )}

      {/* =====================================================
          YEARLY BOOKINGS
      ===================================================== */}

      {showAllBookings && (
        <ConferenceYearlyBookings
          bookings={bookings}
          onClose={() => setShowAllBookings(false)}
        />
      )}
    </>
  );
};

export default ConferenceRoom;
