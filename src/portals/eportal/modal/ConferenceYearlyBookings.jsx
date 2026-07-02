import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import {
  getConferenceYearlyBookings,
  exportToExcelCBRData,
} from "../services/conferenceService";

const ConferenceYearlyBookings = ({ onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const res = await getConferenceYearlyBookings();

        if (res.status) {
          setBookings(res.data || []);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Yearly conference fetch error:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= SEARCH FILTER ================= */

  const filteredBookings = bookings.filter((b) => {
    const keyword = search.toLowerCase();

    return (
      (b.ROOM_LABEL || "").toLowerCase().includes(keyword) ||
      (b.BOOK_BY_NAME || "").toLowerCase().includes(keyword) ||
      (b.DIVSN_DESC || "").toLowerCase().includes(keyword) ||
      (b.REMARKS || "").toLowerCase().includes(keyword) ||
      (b.FACILITIES || "").toLowerCase().includes(keyword) ||
      (b.DT || "").toLowerCase().includes(keyword)
    );
  });

  /* ================= EXPORT ================= */

 const handleExport = async () => {
  const ids =
    search.trim() === ""
      ? [] // export all
      : filteredBookings.map((row) => row.ID); // export filtered rows only

  await exportToExcelCBRData(ids);
};

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {/* HEADER */}

            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                All Conference Bookings (Yearly)
              </h5>

              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={onClose}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            {/* TOOLBAR */}

            <div className="p-3 border-bottom">
              <div className="row align-items-center">
                <div className="col-md-5">
                  <div className="search-set">
                    <div className="search-input search-input-default">
                      <span className="btn-searchset">
                        <i className="ti ti-search"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search bookings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-7 text-end">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleExport}
                  >
                    <i className="ti ti-file-export me-2"></i>
                    Export Excel
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div className="modal-body">
              <DataTable
                value={filteredBookings}
                paginator
                first={first}
                rows={rows}
                rowsPerPageOptions={[10, 25, 50, 100]}
                onPage={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                loading={loading}
                stripedRows
                showGridlines
                size="small"
                removableSort
                responsiveLayout="scroll"
                dataKey="ID"
                emptyMessage="No conference bookings found"
              >
                <Column field="ROOM_LABEL" header="Room" sortable />

                <Column field="DT" header="Date" sortable />

                <Column field="STARTTIME" header="Start Time" sortable />

                <Column field="ENDTIME" header="End Time" sortable />

                <Column field="BOOK_BY_NAME" header="Booked By" sortable />

                <Column field="NOOF_ATTD" header="Attendees" sortable />

                <Column field="FACILITIES" header="Facilities" />

                <Column field="DIVSN_DESC" header="Division" sortable />

                <Column
                  field="REMARKS"
                  header="Remarks"
                  body={(row) => (
                    <span title={row.REMARKS}>
                      {row.REMARKS?.length > 40
                        ? `${row.REMARKS.substring(0, 40)}...`
                        : row.REMARKS}
                    </span>
                  )}
                />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ConferenceYearlyBookings;
