import { useState, useEffect } from "react";
import SDLDataTable from "../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../components/datatable/SDLSearch";

import {
  getConferenceYearlyBookings,
  exportToExcelCBRData,
} from "../services/conferenceService";

const ConferenceYearlyBookings = ({ onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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


const columns = [
  {
    field: "ROOM_LABEL",
    header: "Room",
    sortable: true,
    style: { minWidth: "180px" },
  },
  {
    field: "DT",
    header: "Date",
    sortable: true,
    style: { width: "130px" },
  },
  {
    field: "STARTTIME",
    header: "Start Time",
    sortable: true,
    style: { width: "120px" },
  },
  {
    field: "ENDTIME",
    header: "End Time",
    sortable: true,
    style: { width: "120px" },
  },
  {
    field: "BOOK_BY_NAME",
    header: "Booked By",
    sortable: true,
    style: { minWidth: "180px" },
  },
  {
    field: "NOOF_ATTD",
    header: "Attendees",
    sortable: true,
    style: {
      width: "110px",
      textAlign: "center",
    },
  },
  {
    field: "FACILITIES",
    header: "Facilities",
    style: { minWidth: "200px" },
  },
  {
    field: "DIVSN_DESC",
    header: "Division",
    sortable: true,
    style: { minWidth: "180px" },
  },
  {
    field: "REMARKS",
    header: "Remarks",
    body: (row) => (
      <span title={row.REMARKS}>
        {row.REMARKS?.length > 40
          ? `${row.REMARKS.substring(0, 40)}...`
          : row.REMARKS}
      </span>
    ),
    style: { minWidth: "250px" },
  },
];

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
                <SDLSearch
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..."
                />
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
              <SDLDataTable
              data={filteredBookings}
              columns={columns}
              loading={loading}
              rows={10}
              rowsPerPageOptions={[10, 25, 50, 100]}
              removableSort
              dataKey="ID"
              emptyMessage="No conference bookings found"
              tableStyle={{ minWidth: "1500px" }}
            />
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ConferenceYearlyBookings;
