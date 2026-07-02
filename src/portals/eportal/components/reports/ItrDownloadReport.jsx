import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

import {
  getItrDownloadReport,
  exportItrDownloadReport,
} from "../../services/itrDownloadReportService";
import {
    notifySuccess,
    notifyError,
    confirmAction
} from "../../../../services/alertService";
import { Link } from "react-router-dom";


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
            rowData.STATUS === "SUCCESS"
                ? "bg-success"
                : "bg-danger"
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
          }
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
        "All selected filters will be cleared."
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
            }
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

    if (result.success) {
        notifySuccess("Excel exported successfully");
    } else {
        notifyError(result.message || "Failed to export report");
    }
};

  const validateFilters = () => {
    if (
      filters.download_type === "single" &&
      !(filters.emp_code || "").trim()
    ) {
      notifyError("Employee Code is mandatory for Single Employee download type.");
      return false;
    }

   if (
		filters.from_date &&
		filters.to_date &&
		filters.from_date > filters.to_date
	) {
		notifyError(
			"From Date cannot be greater than To Date."
		);
		return false;
	}
    return true;
  };

  return (
    <div className="container-fluid">

       {/* HEADER */}                
        <div className="page-header">
            <div className="add-item d-flex">
                <div className="page-title">
                    <h4> ITR Download Report</h4>
                </div>
            </div>

            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/eportal/dashboard">Home</Link>
                    </li>
                    <li
                        className="breadcrumb-item active"
                        aria-current="page"
                    >
                         ITR Download Report
                    </li>
                </ol>
            </nav>
        </div>

     
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={handleExport}
        >
          <i className="fas fa-file-excel me-2"></i>
          Export Excel
        </button>
      </div>

      {/* Filters */}
<div className="card shadow-sm mb-3">
    <div className="card-body">
        <div className="row g-3">

            {/* Financial Year */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
                <label className="form-label">
                    Financial Year
                </label>

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
                <label className="form-label">
                    Download Type
                </label>

                <select
                    className="form-select"
                    name="download_type"
                    value={filters.download_type}
                    onChange={handleChange}
                >
                    <option value="">All</option>
                    <option value="single">
                        Single Employee
                    </option>
                    <option value="all">
                        All Employees
                    </option>
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
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
            )}

            {/* From Date */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
				<label className="form-label">
					From Date
				</label>

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
			<label className="form-label">
				To Date
			</label>

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
                <label className="form-label d-none d-lg-block">
                    &nbsp;
                </label>

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

                <div className="search-set">
                    <div className="search-input">

                        <span className="btn-searchset">
                            <i className="ti ti-search"></i>
                        </span>

                        <InputText
                            value={globalFilter}
                            onChange={(e) =>
                                setGlobalFilter(e.target.value)
                            }
                            placeholder="Search records..."
                            className="form-control"
                        />

                    </div>
                </div>

            </div>

        </div>

    </div>

    <div className="card-body">

        <DataTable
			value={rows}
			globalFilter={globalFilter}
			paginator={rows.length > 10}
			rows={10}
			rowsPerPageOptions={
				rows.length > 10
					? [10,25,50,100]
					: []
			}
			responsiveLayout="scroll"
			scrollable
			scrollHeight="60vh"
			paginatorDropdownAppendTo="self"
			loading={loading}
			emptyMessage="No Records Found"
			stripedRows
			showGridlines
			className="p-datatable-sm itr-report-table"
			
		>

            <Column
                field="DOWNLOAD_TIME"
                header="Date Time"
                sortable
            />

            <Column
                field="EMP_CODE"
                header="Employee"
                sortable
            />

            <Column
                field="TARGET_EMP_CODE"
                header="Target Employee"
                sortable
            />

            <Column
                field="DOWNLOAD_TYPE"
                header="Type"
                sortable
            />

            <Column
                field="FINANCIAL_YEAR"
                header="Financial Year"
                sortable
            />

            <Column
                field="FILE_NAME"
                header="File Name"
            />

            <Column
                field="FILE_SIZE_MB"
                header="Size (MB)"
                sortable
            />

            <Column
                header="Status"
                body={statusTemplate}
                sortable
                field="STATUS"
            />

            <Column
                field="BROWSER_NAME"
                header="Browser"
            />

            <Column
                field="IP_ADDRESS"
                header="IP Address"
            />

        </DataTable>

    </div>

</div>

    </div>
  );
};

export default ItrDownloadReport;
