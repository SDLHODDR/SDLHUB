import {useEffect, useMemo, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { getConferenceRooms } from "../../services/conferenceService";
import ConferenceBookingModal from "../../modal/ConferenceBookingModal";
import ConferenceYearlyBookings from "../../modal/ConferenceYearlyBookings";
import ConferenceScheduler from "./ConferenceScheduler";
import { OverlayTrigger } from "react-bootstrap";
import { renderConferenceTooltip } from "../../utils/tooltipHelper";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

const ConferenceRoom = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  
  const [rows, setRows] = useState(10);
  const [showScheduler, setShowScheduler] = useState(false);

  /* ================= Form modal constants ================= */
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);

  const openModal = (row = null) => {
    if (row) {
      setSelectedBooking(row);  // null = add new booking
    } else {
      setSelectedBooking({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setShowModal(false);
  };

  /* ================= FETCH DATA ================= */
  
const fetchData = async () => {
  setLoading(true);

  try {
    const res = await getConferenceRooms();

    if (res.status) {
      setBookings(res.data || []);
    } else {
      setBookings([]);
    }
  } catch (err) {
    console.error(err);
    setBookings([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

  /* ================= DATE FORMATTER ================= 

  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";

    // If already yyyy-mm-dd, return directly
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      return dateStr;
    }

    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };*/

  /* ================= DURATION FORMATTER ================= */

  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    let diff = endMinutes - startMinutes;

    // Handle overnight case (if ever needed)
    if (diff < 0) {
      diff += 24 * 60;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  };

  /* ================= SEARCH ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery) return bookings;

    return bookings.filter(
      (item) =>
        item.ROOM_LABEL?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.DT?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookings]);

  // useEffect(() => {
  //   setTotalRecords(filteredData.length);
  //   setCurrentPage(1);
  // }, [filteredData]);

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    switch (status) {
      case "A":
        return <span className="badge bg-success">Confirmed</span>;
      case "R":
        return <span className="badge bg-danger">Rejected</span>;
      case "D":
        return <span className="badge bg-danger">Booking Deleted</span>;
      case "N":
        return <span className="badge bg-warning text-dark">Planned</span>;
      case "X":
        return <span className="badge bg-secondary">Booking Cancelled</span>;
      case "T":
        return <span className="badge bg-info">Confirmation Pending</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const serialBody = (rowData, options) => options.rowIndex + 1;

const durationBody = (row) => (
  <OverlayTrigger
    placement="right"
    overlay={renderConferenceTooltip(row)}
    delay={{ show: 200, hide: 100 }}
    container={document.body}
  >
    <span>{calculateDuration(row.STARTTIME, row.ENDTIME)}</span>
  </OverlayTrigger>
);

const reasonBody = (row) => {
  const text = row.REMARKS || "-";

  return (
    <span title={text}>
      {text.length > 25 ? text.substring(0, 25) + "..." : text}
    </span>
  );
};

const statusBody = (row) => getStatusBadge(row.STATUS);

const actionBody = (row) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      openModal(row);
    }}
    className="btn btn-icon btn-sm btn-primary"
    title="View"
  >
    <i className="ti ti-eye"></i>
  </a>
);

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Conference Room</h4>
          </div>
        </div>

          <BreadcrumbNav
          items={[
              { text: "Home", link: "/eportal/dashboard" },
              { text: "Holiday Calendar" },
          ]}
          />

      </div>
      <div className="row">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => openModal(null)}
              >
                <i className="fas fa-plus"></i>
                Add Booking
              </button>

              <button
                className="btn btn-info d-flex align-items-center gap-2"
                onClick={() => setShowScheduler(!showScheduler)}
              >
                <i className="fas fa-calendar-alt"></i>
                Timeline View
              </button>

              <button
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

      {showScheduler && (
        <ConferenceScheduler bookings={bookings} />
      )}
      <div className="row">
        <div className="card">
          <div className="card-body">
            {/* SEARCH */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    </div>
</div>
            {/* TABLE */}
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
    paginator={filteredData.length > 10}
    rows={rows}
    rowsPerPageOptions={[10, 25, 50, 100]}
    onPage={(e) => setRows(e.rows)}
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
    <Column
        header="#"
        body={serialBody}
        style={{ width: "70px" }}
    />

    <Column
        field="ROOM_LABEL"
        header="Room"
        sortable
    />

    <Column
        field="DT"
        header="Date"
        sortable
    />

    <Column
        header="Duration"
        body={durationBody}
    />

    <Column
        field="BOOK_BY_NAME"
        header="Booked By"
        sortable
    />

    <Column
        field="CHG_ON"
        header="Requested On"
        sortable
    />

    <Column
        header="Reason"
        body={reasonBody}
    />

    <Column
        header="Status"
        body={statusBody}
    />

    <Column
        header="Action"
        body={actionBody}
        style={{ width: "90px" }}
    />
</DataTable>
            )}
          </div>
        </div>
      </div>
      {/* modal form */}
      {showModal && (
        <ConferenceBookingModal
          booking={selectedBooking}
          mode={selectedBooking?.ID ? "view" : "add"}
          onClose={closeModal}
          refreshTable={fetchData}
        />
        //mode={selectedBooking ? "view" : "add"}
      )}

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
