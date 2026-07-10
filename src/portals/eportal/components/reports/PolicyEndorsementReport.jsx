import { useEffect, useState, useMemo } from "react";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";

import {
  getPolicyEndorsementReport,
  getPolicyAcceptanceDetails,
  exportPolicyAcceptanceReport,
} from "../../services/policyEndorsementReportService";

import { notifyError, notifySuccess } from "../../../../services/alertService";

import "../../assets/css/policyEndorsementReport.css";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

const PolicyEndorsementReport = () => {
  const [loading, setLoading] = useState(true);

  const [policies, setPolicies] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);

  const [policySearch, setPolicySearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await getPolicyEndorsementReport();

        if (response?.status) {
          setPolicies(response.data || []);
        } else {
          notifyError(response?.message);
        }
      } catch {
        notifyError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = async (policyId) => {
    try {
      const response = await getPolicyAcceptanceDetails(policyId);

      if (response?.status) {
        setSummary(response.summary);

        setEmployees(response.data || []);

        setEmployeeSearch("");

        setShowModal(true);
      } else {
        notifyError(response?.message);
      }
    } catch (error) {
      console.error(error);
      notifyError("Failed to fetch details");
    }
  };

  const handleExport = async () => {
    try {
      if (!summary?.policy_id) {
        notifyError("Policy not found");
        return;
      }

      const blob = await exportPolicyAcceptanceReport(summary.policy_id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${summary.policy_name}_Acceptance_Report.xlsx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      notifySuccess("Excel exported successfully");
    } catch (error) {
      console.error(error);

      notifyError("Failed to export report");
    }
  };

  const filteredPolicies = useMemo(() => {
    if (!policySearch) return policies;

    return policies.filter((policy) =>
      (policy.policy_name || "")
        .toLowerCase()
        .includes(policySearch.toLowerCase()),
    );
  }, [policies, policySearch]);

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;

    const search = employeeSearch.toLowerCase();

    return employees.filter(
      (emp) =>
        (emp.emp_code || "").toString().toLowerCase().includes(search) ||
        (emp.emp_name || "").toLowerCase().includes(search) ||
        (emp.designation || "").toLowerCase().includes(search) ||
        (emp.division || "").toLowerCase().includes(search) ||
        (emp.department || "").toLowerCase().includes(search),
    );
  }, [employees, employeeSearch]);

  const mandatoryBody = (rowData) => (
    <span
      className={`badge ${
        rowData.is_mandatory === "Y" ? "bg-danger" : "bg-secondary"
      }`}
    >
      {rowData.is_mandatory === "Y" ? "Yes" : "No"}
    </span>
  );

  const acceptanceBody = (rowData) => (
    <div
      style={{
        minWidth: "180px",
      }}
    >
      <div className="progress">
        <div
          className="progress-bar bg-success"
          style={{
            width: `${rowData.acceptance_percentage}%`,
          }}
        >
          {rowData.acceptance_percentage}%
        </div>
      </div>
    </div>
  );

  const actionBody = (rowData) => (
    <button
      className="btn btn-sm btn-primary"
      onClick={() => handleViewDetails(rowData.policy_id)}
    >
      View
    </button>
  );

  const statusBody = (rowData) =>
    rowData.policy_status === "Accepted" ? (
      <span className="badge bg-success">Accepted</span>
    ) : (
      <span className="badge bg-warning text-dark">Pending</span>
    );

  const applicableToTemplate = (rowData) => {
    return (
      <div style={{ minWidth: "220px" }}>
        <div className="mb-2">
          <small className="fw-bold text-primary">Divisions</small>

          <div className="d-flex flex-wrap gap-1 mt-1">
            {rowData.applicable_divisions?.length > 0 ? (
              rowData.applicable_divisions.map((div) => (
                <span key={div} className="badge bg-primary">
                  {div}
                </span>
              ))
            ) : (
              <span className="text-muted">All</span>
            )}
          </div>
        </div>

        <div>
          <small className="fw-bold text-success">Departments</small>

          <div className="d-flex flex-wrap gap-1 mt-1">
            {rowData.applicable_departments?.length > 0 ? (
              rowData.applicable_departments.map((dept) => (
                <span key={dept} className="badge bg-success">
                  {dept}
                </span>
              ))
            ) : (
              <span className="text-muted">All</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const policyColumns = [
    {
      field: "policy_name",
      header: "Policy",
      sortable: true,
      style: { minWidth: "220px" },
    },
    {
      header: "Mandatory",
      body: mandatoryBody,
      style: { width: "120px", textAlign: "center" },
    },
    {
      header: "Applicable To",
      body: applicableToTemplate,
      style: { minWidth: "280px" },
    },
    {
      field: "target_employees",
      header: "Target Employees",
      sortable: true,
      style: { width: "140px", textAlign: "center" },
    },
    {
      field: "accepted_count",
      header: "Accepted",
      sortable: true,
      style: { width: "120px", textAlign: "center" },
    },
    {
      field: "pending_count",
      header: "Pending",
      sortable: true,
      style: { width: "120px", textAlign: "center" },
    },
    {
      header: "Acceptance %",
      body: acceptanceBody,
      style: {
        minWidth: "190px",
        width: "210px",
      },
    },
    {
      header: "Action",
      body: actionBody,
      style: {
        width: "120px",
        textAlign: "center",
      },
    },
  ];

  const employeeColumns = [
    {
      field: "emp_code",
      header: "Employee Code",
      sortable: true,
    },
    {
      field: "emp_name",
      header: "Employee Name",
      sortable: true,
    },
    {
      field: "designation",
      header: "Designation",
    },
    {
      field: "division",
      header: "Division",
    },
    {
      field: "department",
      header: "Department",
    },
    {
      header: "Status",
      body: statusBody,
      style: {
        width: "120px",
        textAlign: "center",
      },
    },
    {
      field: "accepted_on",
      header: "Accepted On",
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Policy Endorsement Report</h4>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Policy Endorsement Report" },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <SDLSearch
                value={policySearch}
                onChange={setPolicySearch}
                placeholder="Search Policy..."
              />
            </div>
          </div>

          <SDLDataTable
            data={filteredPolicies}
            columns={policyColumns}
            loading={loading}
            emptyMessage="No policies found"
            className="policy-endorsement-grid"
            tableStyle={{ minWidth: "1200px" }}
          />
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5>{summary?.policy_name}</h5>

                  <small>
                    Accepted : {summary?.accepted_count}
                    {" | "}
                    Pending : {summary?.pending_count}
                  </small>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleExport}
                  >
                    Export Excel
                  </button>

                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
              </div>

              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={employeeSearch}
                      onChange={setEmployeeSearch}
                      placeholder="Search Employee..."
                    />
                  </div>
                </div>
                <SDLDataTable
                  data={filteredEmployees}
                  columns={employeeColumns}
                  emptyMessage="No employee found"
                  className="policy-employee-grid"
                  tableStyle={{ minWidth: "900px" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PolicyEndorsementReport;
