import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
import SDLCalendar from "../../../../shared/components/calendar/SDLCalendar";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLSearch from "../../../../shared/components/datatable/SDLSearch";
import SDLReactSelect from "../../../../shared/components/form/SDLReactSelect";
import ResetButton from "../../../../shared/components/buttons/ResetButton";
import Badge from "../../../../shared/components/Badge";
import EportalPageLoader from "../loader/EportalPageLoader";
import TimesheetTaskDetailsModal from "../../modal/TimesheetTaskDetailsModal";
import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import { handleError, apiError } from "../../../../shared/services/errorHandler";
import { toDMYDate, toISODate, isoToDate } from "../../../../shared/utils/formatUtils";
import {
  getTimesheetReport,
  exportTimesheetReport,
  openTimesheetDocument,
} from "../../services/timesheetService";
import { TS_DAY_STATUS_BADGE, TS_TASK_STATUS_BADGE } from "../../constants/timesheetConstants";
import "../../assets/css/wideContentPages.css";
import "../../assets/css/timesheet.css";

const todayISO = () => toISODate(new Date());
const ALL_EMPLOYEES = { value: "", label: "All Employees" };

/*
 * Reports > Daily Timesheet Report (reporting managers only; the backend checks).
 * Shows the manager's own tasks and the tasks their team submitted to them,
 * and exports the same rows to Excel. (Managers add their own tasks on the
 * Daily Timesheet page.)
 */
const TimesheetReport = () => {
  const location = useLocation();
  const portalHome = `/${getPortalFromPath(location.pathname).key}/dashboard`;

  const [filters, setFilters] = useState(() => ({ from: todayISO(), to: todayISO(), empCode: "" }));
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(""); // not a reporting manager
  const [exporting, setExporting] = useState(false);
  const [detailsTask, setDetailsTask] = useState(null); // row shown in the details popup

  /* ---------------- load the report ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const res = await getTimesheetReport(filters, { signal: controller.signal });
        if (!res?.status) throw apiError(res, "Unable to load the timesheet report.");
        setRows(res.data?.rows || []);
        setEmployees(res.data?.employees || []);
        setAccessError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setRows([]);
        if (error?.response?.status === 403) {
          setAccessError(error.response.data?.message || "This report is only available to reporting managers.");
        } else {
          handleError(error, { context: "Load timesheet report", fallback: "Unable to load the timesheet report." });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [filters]);

  /* ---------------- filters ---------------- */
  const setFromDate = (date) => {
    const from = toISODate(date) || todayISO();
    setFilters((current) => ({ ...current, from, to: current.to < from ? from : current.to }));
  };

  const setToDate = (date) => {
    const to = toISODate(date) || todayISO();
    setFilters((current) => ({ ...current, to, from: current.from > to ? to : current.from }));
  };

  const resetFilters = () => {
    setFilters({ from: todayISO(), to: todayISO(), empCode: "" });
    setSearch("");
  };

  const filtersChanged =
    filters.from !== todayISO() || filters.to !== todayISO() || filters.empCode !== "" || search !== "";

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.empName, row.empCode, row.project, row.category, row.title, row.descriptionText, row.taskStatusText, row.dayStatusText]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [rows, search]);

  /* ---------------- export ---------------- */
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportTimesheetReport(filters);
    } catch (error) {
      handleError(error, { context: "Export timesheet report", fallback: "Unable to export the report." });
    } finally {
      setExporting(false);
    }
  };

  /* ---------------- table ---------------- */
  const columns = [
    {
      field: "date",
      header: "Date",
      sortable: true,
      body: (row) => toDMYDate(isoToDate(row.date)),
      style: { width: "115px", whiteSpace: "nowrap" },
    },
    {
      field: "empName",
      header: "Employee",
      sortable: true,
      body: (row) => (
        <div className="timesheet-text-cell fw-semibold">
          {row.empName}
          {row.isMine && <span className="badge bg-light text-dark ms-1">Me</span>}
        </div>
      ),
      style: { width: "170px" },
    },
    { field: "project", header: "Project", sortable: true, body: (row) => row.project || "-", style: { width: "95px" } },
    { field: "category", header: "Category", sortable: true, style: { width: "115px" } },
    {
      field: "title",
      header: "Task",
      body: (row) => <div className="timesheet-text-cell fw-semibold">{row.title}</div>,
      style: { width: "15%" },
    },
    {
      field: "description",
      header: "Description",
      body: (row) =>
        row.descriptionText ? (
          <OverlayTrigger placement="top" overlay={<Tooltip className="timesheet-desc-tooltip">{row.descriptionText}</Tooltip>}>
            <div className="timesheet-desc-cell" tabIndex={0}>{row.descriptionText}</div>
          </OverlayTrigger>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      header: "Document",
      body: (row) =>
        row.documentName ? (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-start timesheet-doc-link"
            onClick={(event) => {
              event.stopPropagation(); // open the document, not the row's details popup
              openTimesheetDocument(row.id).catch((error) =>
                handleError(error, { context: "Open timesheet document", fallback: "Unable to open the document." }),
              );
            }}
            title={`Open ${row.documentName}`}
          >
            <i className="ti ti-paperclip me-1" />
            {row.documentName}
          </button>
        ) : (
          <span className="text-muted">-</span>
        ),
      style: { width: "170px" },
    },
    {
      field: "taskStatus",
      header: "Task Status",
      sortable: true,
      body: (row) => <Badge text={row.taskStatusText} className={TS_TASK_STATUS_BADGE[row.taskStatus]} />,
      style: { width: "120px" },
    },
    {
      field: "dayStatus",
      header: "Day Status",
      sortable: true,
      body: (row) => <Badge text={row.dayStatusText} className={TS_DAY_STATUS_BADGE[row.dayStatus]} />,
      style: { width: "120px" },
    },
    {
      // When the day was submitted (only for submitted days).
      field: "submittedOn",
      header: "Date & Time",
      body: (row) => (row.dayStatus === "S" && row.submittedOn ? row.submittedOn : <span className="text-muted">-</span>),
      style: { width: "150px", whiteSpace: "nowrap" },
    },
  ];

  const busy = loading || exporting;

  return (
    <div className="timesheet-page">
      {busy && <EportalPageLoader />}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Daily Timesheet Report</h4>
          </div>
        </div>
        <BreadcrumbNav items={[{ text: "Home", link: portalHome }, { text: "Daily Timesheet Report" }]} />
      </div>

      {accessError ? (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-warning mb-0">{accessError}</div>
          </div>
        </div>
      ) : (
        <div className="card eportal-wide-card">
          <div className="card-body">
            {/* ---------- filters ---------- */}
            <div className="row g-2 align-items-end mb-3">
              <div className="col-12 col-sm-6 col-md-3 col-xl-2">
                <label className="form-label">From Date</label>
                <SDLCalendar name="fromDate" value={isoToDate(filters.from)} onChange={setFromDate} allowAllDates maxDate={new Date()} />
              </div>
              <div className="col-12 col-sm-6 col-md-3 col-xl-2">
                <label className="form-label">To Date</label>
                <SDLCalendar
                  name="toDate"
                  value={isoToDate(filters.to)}
                  onChange={setToDate}
                  allowAllDates
                  minDate={isoToDate(filters.from)}
                  maxDate={new Date()}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-3">
                <label className="form-label">Employee</label>
                <SDLReactSelect
                  value={filters.empCode}
                  options={[ALL_EMPLOYEES, ...employees]}
                  onChange={(value) => setFilters((current) => ({ ...current, empCode: value || "" }))}
                  isClearable={false}
                />
              </div>
              <div className="col-12 col-xl d-flex flex-wrap gap-2 justify-content-xl-end">
                <ResetButton onClick={resetFilters} disabled={!filtersChanged} />
                <button type="button" className="btn btn-success" onClick={handleExport} disabled={busy || !rows.length}>
                  <i className="ti ti-file-spreadsheet me-1" />
                  Export to Excel
                </button>
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <SDLSearch value={search} onChange={setSearch} placeholder="Search tasks..." className="mb-0" />
              <small className="text-muted">
                {visibleRows.length} task(s) · your own tasks and the tasks your team submitted to you · click a row for details
              </small>
            </div>

            <SDLDataTable
              data={visibleRows}
              columns={columns}
              className="eportal-fit-table"
              tableStyle={{ width: "100%", minWidth: "1100px", tableLayout: "fixed" }}
              emptyMessage={loading ? " " : "No tasks found for the selected filters."}
              removableSort
              onRowClick={(event) => event?.data && setDetailsTask(event.data)}
            />
          </div>
        </div>
      )}

      {detailsTask && <TimesheetTaskDetailsModal task={detailsTask} onClose={() => setDetailsTask(null)} />}
    </div>
  );
};

export default TimesheetReport;
