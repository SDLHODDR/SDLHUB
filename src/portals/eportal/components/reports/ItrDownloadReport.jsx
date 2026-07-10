import { useEffect, useState, useMemo } from "react";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import {
  getItrDownloadReport,
  exportItrDownloadReport,
} from "../../services/itrDownloadReportService";
import {
  notifySuccess,
  notifyError,
  confirmAction,
} from "../../../../services/alertService";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

const ItrDownloadReport = () => {
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const [filters, setFilters] = useState({
    financial_year: "",
    emp_code: "",
    download_type: "",
    from_date: "",
    to_date: "",
  });

  const [summary, setSummary] = useState({
    total_downloads: 0,
    unique_users: 0,
    success_count: 0,
    failed_count: 0,
  });

  const [rows, setRows] = useState([]);

  const statusTemplate = (rowData) => (
    <span
      className={`badge ${
        rowData.STATUS === "SUCCESS" ? "bg-success" : "bg-danger"
      }`}
    >
      {rowData.STATUS}
    </span>
  );

  const loadReport = async () => {
    try {
      setLoading(true);

      const res = await getItrDownloadReport(filters);

      if (res.success) {
        setRows(res.data || []);

        setSummary(
          res.summary || {
            total_downloads: 0,
            unique_users: 0,
            success_count: 0,
            failed_count: 0,
          },
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "download_type" && value === "all") {
        updated.emp_code = "";
      }

      return updated;
    });
  };

  const handleSearch = () => {
    if (!validateFilters()) {
      return;
    }
    loadReport();
  };

  const handleReset = async () => {
    const confirmed = await confirmAction(
      "Reset Filters?",
      "All selected filters will be cleared.",
    );

    if (!confirmed) return;

    const resetFilters = {
      financial_year: "",
      emp_code: "",
      download_type: "",
      from_date: "",
      to_date: "",
    };

    setFilters(resetFilters);
    setGlobalFilter("");

    try {
      setLoading(true);

      const res = await getItrDownloadReport(resetFilters);

      if (res.success) {
        setRows(res.data || []);
        setSummary(
          res.summary || {
            total_downloads: 0,
            unique_users: 0,
            success_count: 0,
            failed_count: 0,
          },
        );
      }
    } finally {
      setLoading(false);
    }

    notifySuccess("Filters reset successfully");
  };

  const handleExport = async () => {
    if (!validateFilters()) return;

    const result = await exportItrDownloadReport(filters);

    if (!result.success) {
      notifyError(result.message || "Failed to export report");
    }
  };

  const validateFilters = () => {
    if (
      filters.download_type === "single" &&
      !(filters.emp_code || "").trim()
    ) {
      notifyError(
        "Employee Code is mandatory for Single Employee download type.",
      );
      return false;
    }

    if (
      filters.from_date &&
      filters.to_date &&
      filters.from_date > filters.to_date
    ) {
      notifyError("From Date cannot be greater than To Date.");
      return false;
    }
    return true;
  };

  const columns = [
    {
      field: "DOWNLOAD_TIME",
      header: "Date Time",
      sortable: true,
      style: { minWidth: "170px" },
    },
    {
      field: "EMP_CODE",
      header: "Employee",
      sortable: true,
      style: { minWidth: "120px" },
    },
    {
      field: "TARGET_EMP_CODE",
      header: "Target Employee",
      sortable: true,
      style: { minWidth: "140px" },
    },
    {
      field: "DOWNLOAD_TYPE",
      header: "Type",
      sortable: true,
      style: { minWidth: "130px" },
    },
    {
      field: "FINANCIAL_YEAR",
      header: "Financial Year",
      sortable: true,
      style: { minWidth: "140px" },
    },
    {
      field: "FILE_NAME",
      header: "File Name",
      style: { minWidth: "220px" },
    },
    {
      field: "FILE_SIZE_MB",
      header: "Size (MB)",
      sortable: true,
      style: { minWidth: "100px", textAlign: "center" },
    },
    {
      field: "STATUS",
      header: "Status",
      body: statusTemplate,
      sortable: true,
      style: { minWidth: "110px", textAlign: "center" },
    },
    {
      field: "BROWSER_NAME",
      header: "Browser",
      style: { minWidth: "150px" },
    },
    {
      field: "IP_ADDRESS",
      header: "IP Address",
      style: { minWidth: "140px" },
    },
  ];

  const filteredRows = useMemo(() => {
    const keyword = globalFilter.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter(
      (row) =>
        String(row.DOWNLOAD_TIME ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.EMP_CODE ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.TARGET_EMP_CODE ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.DOWNLOAD_TYPE ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.FINANCIAL_YEAR ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.FILE_NAME ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.FILE_SIZE_MB ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.STATUS ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.BROWSER_NAME ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.IP_ADDRESS ?? "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [rows, globalFilter]);

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4> ITR Download Report</h4>
          </div>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "ITR Download Report" },
          ]}
        />
      </div>

      {/* Export Section */}
      <div className="card shadow-sm mb-3">
        <div className="card-body py-3 px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h6 className="mb-1 fw-semibold">Download ITR Download Report</h6>
              <small className="text-muted">
                Export the complete download history to Excel.
              </small>
            </div>
            <button className="btn btn-success px-4" onClick={handleExport}>
              <i className="fas fa-file-excel me-2"></i>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            {/* Financial Year */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <label className="form-label">Financial Year</label>

              <select
                className="form-select"
                name="financial_year"
                value={filters.financial_year}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="25-26">2025-26</option>
                <option value="24-25">2024-25</option>
                <option value="23-24">2023-24</option>
              </select>
            </div>

            {/* Download Type */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <label className="form-label">Download Type</label>

              <select
                className="form-select"
                name="download_type"
                value={filters.download_type}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="single">Single Employee</option>
                <option value="all">All Employees</option>
              </select>
            </div>

            {/* Employee Code */}
            {filters.download_type !== "all" && (
              <div className="col-12 col-sm-6 col-md-4 col-lg-2">
                <label className="form-label">
                  Employee Code
                  {filters.download_type === "single" && (
                    <span className="text-danger"> *</span>
                  )}
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="emp_code"
                  value={filters.emp_code}
                  onChange={handleChange}
                  placeholder="Employee Code"
                />
              </div>
            )}

            {/* From Date */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <label className="form-label">From Date</label>

              <input
                type="date"
                className="form-control"
                name="from_date"
                value={filters.from_date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* To Date */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <label className="form-label">To Date</label>

              <input
                type="date"
                className="form-control"
                name="to_date"
                value={filters.to_date}
                onChange={handleChange}
              />
            </div>

            {/* Buttons */}
            <div className="col-12 col-md-4 col-lg-2">
              <label className="form-label d-none d-lg-block">&nbsp;</label>

              <div className="d-flex gap-2 filter-btn-group">
                <button
                  className="btn btn-primary flex-fill"
                  onClick={handleSearch}
                >
                  Search
                </button>

                <button
                  className="btn btn-secondary flex-fill"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-3">
        <div className="col-12 col-sm-6 col-xl-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3>{summary.total_downloads}</h3>
              <small>Total Downloads</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3>{summary.unique_users}</h3>
              <small>Unique Users</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3>{summary.success_count}</h3>
              <small>Success Downloads</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3>{summary.failed_count}</h3>
              <small>Failed Downloads</small>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-0">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <SDLSearch
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search records..."
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          <SDLDataTable
            data={filteredRows}
            columns={columns}
            loading={loading}
            emptyMessage="No Records Found"
            className="itr-report-table"
            tableStyle={{ minWidth: "1500px" }}
            scrollHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
};

export default ItrDownloadReport;
