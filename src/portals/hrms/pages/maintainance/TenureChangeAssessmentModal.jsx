import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTenureChangeList } from "../../services/tenureChangeService";
import {
  tenureRatingOptions,
  tenureRatingQuestions,
  tenureTypeOptions,
} from "./tenureChangeOptions";
import "../../assets/css/tenureChange.css";

const getEmployeeCode = (employee) =>
  employee?.empCode ?? employee?.EMP_CODE ?? employee?.TRAN_CODE ?? employee?.code;

const normalizeEmployee = (employee, requestedCode) => ({
  ...employee,
  code: getEmployeeCode(employee) ?? requestedCode,
  name: employee.empName ?? employee.EMP_NAME ?? employee.name ?? "-",
  designation: employee.designation ?? employee.DESIGNATION ?? employee.DESIG ?? "-",
  location: employee.location ?? employee.LOCATION ?? employee.LOC_DESC ?? "-",
  department: employee.department ?? employee.DEPARTMENT ?? employee.DEPT_DESC ?? employee.DNAME ?? "-",
  employeeType: employee.employeeType ?? employee.empType ?? employee.EMP_TYPE ?? "-",
  dateOfJoining: employee.dateOfJoining ?? employee.doj ?? employee.DOJ ?? "-",
  tenureDueDate: employee.tenureDueDate ?? employee.tenureDue ?? employee.TDATE ?? "-",
  currentCtc: employee.currentCtc ?? employee.CURRENT_CTC ?? employee.CURR_CTC ?? "",
});

const TenureChangeAssessmentModal = ({ config, show, record, onClose }) => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(Boolean(record?.TRAN_CODE));
  const [loadError, setLoadError] = useState("");
  const [assessment, setAssessment] = useState({
    ratings: {},
    improvement: "",
    appraiserComments: "",
    employeeType: "",
    period: "",
    proposedCtc: "",
    effectiveFrom: "2026-10-01",
    nextAppraisalYear: "",
    remarks: "",
  });

  useEffect(() => {
    if (!show || !record?.TRAN_CODE) return;

    let mounted = true;
    const loadEmployee = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getTenureChangeList(record.TRAN_CODE);
        const responseData = response?.data;
        const employees = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.employees)
            ? responseData.employees
            : responseData
              ? [responseData]
              : [];
        const matchedEmployee = employees.find(
          (item) => String(getEmployeeCode(item) ?? "") === String(record.TRAN_CODE),
        ) || (employees.length === 1 ? employees[0] : null);

        if (!mounted) return;
        if (response?.status && matchedEmployee) {
          setEmployee(normalizeEmployee(matchedEmployee, record.TRAN_CODE));
        } else {
          setEmployee(null);
          setLoadError(response?.message || "Employee details could not be loaded.");
        }
      } catch (error) {
        if (!mounted) return;
        setEmployee(null);
        setLoadError(error?.message || "Employee details could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEmployee();
    return () => {
      mounted = false;
    };
  }, [record?.TRAN_CODE, show]);

  const updateAssessment = (field, value) => {
    setAssessment((current) => ({ ...current, [field]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!employee) return;

    navigate("/hrms/maintainance/tenure-change/letter", {
      state: { employee, assessment, taskId: record.ID },
    });
  };

  if (!show || !record) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenure-assessment-title"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <form className="modal-content shadow-lg border-0" onSubmit={handleSave}>
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" id="tenure-assessment-title">
                {config?.title || "Employee Tenure Change"}
              </h5>
              <small className="text-muted">
                Employee Code: <strong>{record.TRAN_CODE || "-"}</strong>
                <span className="mx-2">|</span>
                Task ID: <strong>{record.ID || "-"}</strong>
                <span className="mx-2">|</span>
                Workflow Task: <strong>{record.TASK_ID || "-"}</strong>
              </small>
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <span className="spinner-border" role="status" aria-label="Loading" />
                <div className="mt-2">Loading employee details...</div>
              </div>
            ) : loadError ? (
              <div className="alert alert-warning mb-0" role="alert">{loadError}</div>
            ) : employee ? (
              <div className="tenure-change-page">
                <div className="row g-3 mb-3 tenure-employee-summary">
                  <div className="col-lg-4">
                    <div><strong>Employee:</strong> {employee.code} - {employee.name}</div>
                    <div><strong>Current Employee Type:</strong> {employee.employeeType}</div>
                  </div>
                  <div className="col-lg-4">
                    <div><strong>Date of Joining:</strong> {employee.dateOfJoining}</div>
                    <div><strong>Designation:</strong> {employee.designation}</div>
                  </div>
                  <div className="col-lg-4">
                    <div><strong>Tenure Due Date:</strong> {employee.tenureDueDate}</div>
                    <div><strong>Department:</strong> {employee.department}</div>
                  </div>
                </div>

                <div className="tenure-rating-section-title">GENERAL</div>
                <div className="table-responsive tenure-rating-table-wrap">
                  <table className="table table-bordered tenure-rating-table mb-0">
                    <tbody>
                      {tenureRatingQuestions.map((question, index) => (
                        <tr key={question}>
                          {index === 0 && (
                            <th className="tenure-rating-group" rowSpan={tenureRatingQuestions.length + 2}>
                              PERSONAL
                            </th>
                          )}
                          <th className="tenure-rating-question">{index + 1}) {question}</th>
                          <td>
                            <div className="tenure-rating-options">
                              {tenureRatingOptions.map((option) => (
                                <label key={option} className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`rating-${index}`}
                                    value={option}
                                    checked={assessment.ratings[index] === option}
                                    onChange={() => setAssessment((current) => ({
                                      ...current,
                                      ratings: { ...current.ratings, [index]: option },
                                    }))}
                                  />
                                  <span className="form-check-label">{option}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <th className="tenure-rating-question">13) Area of Improvement</th>
                        <td><textarea className="form-control" rows="2" value={assessment.improvement} onChange={(event) => updateAssessment("improvement", event.target.value)} /></td>
                      </tr>
                      <tr>
                        <th className="tenure-rating-question">14) Appraiser's Comments</th>
                        <td><textarea className="form-control" rows="2" value={assessment.appraiserComments} onChange={(event) => updateAssessment("appraiserComments", event.target.value)} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Employee Type <span className="text-danger">*</span></label>
                    <select className="form-select tenure-change-select" value={assessment.employeeType} onChange={(event) => updateAssessment("employeeType", event.target.value)}>
                      <option value="">Select Employee Type</option>
                      {tenureTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Period (In Months)</label>
                    <input className="form-control" type="number" min="0" value={assessment.period} onChange={(event) => updateAssessment("period", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Current CTC</label>
                    <input className="form-control" value={employee.currentCtc || "-"} disabled />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Proposed CTC</label>
                    <input className="form-control" type="number" min="0" placeholder="Enter proposed CTC" value={assessment.proposedCtc} onChange={(event) => updateAssessment("proposedCtc", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Effective From <span className="text-danger">*</span></label>
                    <input className="form-control" type="date" value={assessment.effectiveFrom} onChange={(event) => updateAssessment("effectiveFrom", event.target.value)} />
                  </div>
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label">Next Appraisal Year <span className="text-danger">*</span></label>
                    <select className="form-select tenure-change-select" value={assessment.nextAppraisalYear} onChange={(event) => updateAssessment("nextAppraisalYear", event.target.value)}>
                      <option value="">Select Year</option>
                      {[2027, 2028, 2029, 2030, 2031].map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Assessment Remarks</label>
                    <textarea className="form-control" rows="2" value={assessment.remarks} onChange={(event) => updateAssessment("remarks", event.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning mb-0" role="alert">
                Employee details are not available for this request.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={loading || !employee}>
              Save
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenureChangeAssessmentModal;
