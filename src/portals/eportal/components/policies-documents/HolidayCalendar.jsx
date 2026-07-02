import { useEffect, useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getHolidays, getHolidayRules } from "../../services/holidayService";
import { Link } from "react-router-dom";
import "./../../assets/css/holiday-calendar.css";

const HolidayCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [rows, setRows] = useState(10);

  const [holidayRules, setHolidayRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  const fetchHolidayData = async () => {
    setLoading(true);

    try {
      const res = await getHolidays(year);

      if (res.status) {
        setHolidays(res.data || []);
      } else {
        setHolidays([]);
      }
    } catch (err) {
      console.error("Holiday fetch error:", err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidayData();
    fetchHolidayRules();
  }, [year]);

  const fetchHolidayRules = async () => {
    setRulesLoading(true);

    try {
      const res = await getHolidayRules(year);

      if (res.status) {
        setHolidayRules(res.data || []);
      } else {
        setHolidayRules([]);
      }
    } catch (err) {
      console.error("Holiday rules fetch error:", err);
      setHolidayRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  /* ================= SEARCH ================= */

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return holidays;

    return holidays.filter((item) => item.title?.toLowerCase().includes(query));
  }, [searchQuery, holidays]);

  const serialBody = (rowData, options) => options.rowIndex + 1;

  const holidayBody = (row) => (
    <>
      {row.title}
      {row.type === "O" && (
        <span className="text-muted"> (Optional Leave)</span>
      )}
    </>
  );

  const dateBody = (row) =>
    new Date(row.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Holiday Calendar</h4>
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/eportal/dashboard">Home</Link>
            </li>

            <li className="breadcrumb-item active" aria-current="page">
              Holiday Calendar
            </li>
          </ol>
        </nav>
      </div>

      {/* YEAR NAVIGATION */}

      <div className="card mb-4">
        <div className="card-body text-center">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button
              className="btn btn-sm dream-btn"
              onClick={() => setYear((prev) => prev - 1)}
            >
              <i className="fas fa-arrow-left"></i> {year - 1}
            </button>

            <h4 className="mb-0 fw-bold">{year}</h4>

            <button
              className="btn btn-sm dream-btn"
              onClick={() => setYear((prev) => prev + 1)}
            >
              {year + 1} <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="row">
            {Array.from({ length: 12 }, (_, monthIndex) => (
              <div
                key={monthIndex}
                className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4"
              >
                <MonthCalendar
                  year={year}
                  month={monthIndex}
                  holidays={holidays}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE + NOTES */}

      <div className="row">
        {/* TABLE */}

        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="search-set">
                    <div className="search-input position-relative">
                      <span className="btn-searchset">
                        <i className="ti ti-search"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Holiday..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-4 text-center">
                  <div className="spinner-border text-warning"></div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No holidays found
                </div>
              ) : (
                <div className="holiday-calendar-table">
                  <DataTable
                    value={filteredData}
                    loading={loading}
                    paginator={filteredData.length > 10}
                    rows={rows}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    onPage={(e) => setRows(e.rows)}
                    stripedRows
                    showGridlines
                    scrollable
                    responsiveLayout="scroll"
                    paginatorDropdownAppendTo="self"
                    removableSort
                    emptyMessage="No holidays found"
                    className="p-datatable-sm holiday-calendar-grid"
                  >
                    <Column
                      header="#"
                      body={serialBody}
                      style={{ width: "70px" }}
                    />

                    <Column
                      field="title"
                      header="Holiday"
                      body={holidayBody}
                      sortable
                    />

                    <Column field="day" header="Day" sortable />

                    <Column
                      field="date"
                      header="Date"
                      body={dateBody}
                      sortable
                    />
                  </DataTable>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NOTES */}

        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold text-warning">
                <i className="fas fa-info-circle me-2"></i>
                NOTE:
              </h6>

              {rulesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-warning"></div>
                </div>
              ) : holidayRules.length === 0 ? (
                <div className="text-muted">No rules available</div>
              ) : (
                holidayRules.map((rule, index) => {
                  const cleanHtml = rule.descr.replace(/<\/?html>/gi, "");

                  return (
                    <div
                      key={index}
                      className="holiday-rules-content"
                      dangerouslySetInnerHTML={{
                        __html: cleanHtml,
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MONTH COMPONENT ================= */

const MonthCalendar = ({ year, month, holidays }) => {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  const startDay = firstDay.getDay();
  const today = new Date();

  const holidayMap = useMemo(() => {
    const map = {};

    holidays.forEach((h) => {
      map[h.date] = h.title;
    });

    return map;
  }, [holidays]);

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  for (let day = 1; day <= lastDate; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`;

    const holidayName = holidayMap[formattedDate];

    const currentDate = new Date(year, month, day);

    const isHoliday = !!holidayName;

    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    days.push(
      <div
        key={day}
        className={`calendar-day
          ${isHoliday ? "holiday-day" : ""}
          ${isWeekend ? "weekoff-day" : ""}
          ${isToday ? "today-day" : ""}`}
        title={holidayName || ""}
      >
        {day}
      </div>,
    );
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">{monthName}</div>

      <div className="calendar-weekdays">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
          <div key={`${d}-${index}`}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">{days}</div>
    </div>
  );
};

export default HolidayCalendar;
