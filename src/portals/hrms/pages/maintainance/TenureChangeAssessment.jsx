import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import {
  tenureRatingOptions,
  tenureRatingQuestions,
  tenureTypeOptions,
} from "./tenureChangeOptions";
import "../../assets/css/tenureChange.css";

const TenureChangeAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;
  const portal = getPortalFromPath(location.pathname);
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

  const updateAssessment = (field, value) => {
    setAssessment((current) => ({ ...current, [field]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    navigate("/hrms/maintainance/tenure-change/letter", {
      state: { employee, assessment },
    });
  };

  if (!employee) {
    return (
      <div className="tenure-change-page">
        <div className="alert alert-warning">Select an employee from the Tenure Change list first.</div>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/hrms/maintainance/tenure-change")}>Back to Tenure Change</button>
      </div>
    );
  }

  return (
    <div className="tenure-change-page">
      <div className="page-header">
        <div className="page-title"><h4>Employee Tenure Change</h4></div>
        <BreadcrumbNav items={[
          { text: "Home", link: `/${portal.key}/dashboard` },
          { text: "Tenure Change", link: "/hrms/maintainance/tenure-change" },
          { text: "Assessment" },
        ]} />
      </div>

      <form className="card tenure-change-card" onSubmit={handleSave}>
        <div className="card-header"><h5 className="mb-0">Employee Tenure Change</h5></div>
        <div className="card-body">
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

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/hrms/maintainance/tenure-change")}>Cancel</button>
          </div>
          <p className="small text-muted text-end mt-3 mb-0">This prototype stores assessment data only for the current navigation session.</p>
        </div>
      </form>
    </div>
  );
};

export default TenureChangeAssessment;
