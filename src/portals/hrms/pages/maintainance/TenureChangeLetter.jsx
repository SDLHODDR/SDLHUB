import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { tenureTypeOptions } from "./tenureChangeOptions";
import "../../assets/css/tenureChange.css";

const TenureChangeLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;
  const assessment = location.state?.assessment || {};
  const portal = getPortalFromPath(location.pathname);
  const [letterType, setLetterType] = useState(assessment.employeeType || "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  if (!employee) {
    return (
      <div className="tenure-change-page">
        <div className="alert alert-warning">Assessment details are missing. Start from the Tenure Change list.</div>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/hrms/maintainance/tenure-change")}>Back to Tenure Change</button>
      </div>
    );
  }

  const effectiveDate = assessment.effectiveFrom
    ? new Date(`${assessment.effectiveFrom}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "-";
  const currentCtc = employee.currentCtc
    ? Number(employee.currentCtc).toLocaleString("en-IN")
    : "-";
  const proposedCtc = assessment.proposedCtc
    ? Number(assessment.proposedCtc).toLocaleString("en-IN")
    : "-";

  const generateReferenceCode = () => {
    setReferenceCode(`DEMO-TC-${new Date().getFullYear()}-0001`);
  };

  return (
    <div className="tenure-change-page">
      <div className="page-header">
        <div className="page-title"><h4>Print Tenure Change Letter</h4></div>
        <BreadcrumbNav items={[
          { text: "Home", link: `/${portal.key}/dashboard` },
          { text: "Tenure Change", link: "/hrms/maintainance/tenure-change" },
          { text: "Print Letter" },
        ]} />
      </div>

      <div className="card tenure-change-card">
        <div className="card-header"><h5 className="mb-0">Print Tenure Change Letter</h5></div>
        <div className="card-body">
          <div className="row g-3 tenure-letter-summary">
            <div className="col-lg-4">
              <div><strong>Employee:</strong> {employee.code} - {employee.name}</div>
              <div><strong>Employee Type:</strong> {letterType || assessment.employeeType || employee.employeeType}</div>
              <div><strong>Employee Period:</strong> {assessment.period || "-"} months</div>
              <div><strong>Proposed CTC:</strong> ₹{proposedCtc}</div>
            </div>
            <div className="col-lg-4">
              <div><strong>Date of Joining:</strong> {employee.dateOfJoining}</div>
              <div><strong>Designation:</strong> {employee.designation}</div>
              <div><strong>Current CTC:</strong> ₹{currentCtc}</div>
              <div><strong>Department:</strong> {employee.department}</div>
            </div>
            <div className="col-lg-4">
              <div><strong>Tenure Due Date:</strong> {employee.tenureDueDate}</div>
              <div><strong>CTC Effective Date:</strong> {effectiveDate}</div>
              <div><strong>Location:</strong> {employee.location}</div>
              <div><strong>Remarks:</strong> {assessment.remarks || "-"}</div>
            </div>
          </div>

          <div className="row align-items-end g-3 mt-3">
            <div className="col-lg-3 col-md-5">
              <label className="form-label">Letter Template</label>
              <select className="form-select" value={letterType} onChange={(event) => { setLetterType(event.target.value); setReferenceCode(""); }}>
                <option value="">Select Letter Template</option>
                {tenureTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-warning tenure-preview-button" disabled={!letterType} onClick={() => { setReferenceCode(""); setPreviewOpen(true); }}>
                Preview Template
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Back to Assessment</button>
          </div>

          {referenceCode && (
            <div className="alert alert-success mt-4 mb-0" role="status">
              Demo reference code: <strong>{referenceCode}</strong>
              <span className="ms-2">(reference code generation will connect to the API when available)</span>
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <div className="tenure-letter-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false); }}>
          <section className="tenure-letter-modal" role="dialog" aria-modal="true" aria-labelledby="tenure-letter-preview-title">
            <header className="tenure-letter-modal-header">
              <h5 id="tenure-letter-preview-title" className="mb-0">Letter Preview</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setPreviewOpen(false)} />
            </header>
            <div className="tenure-letter-toolbar">
              <span className="fw-semibold">{letterType.toLowerCase().replaceAll(" ", "_")}_letter_preview</span>
              <span>1 / 1</span>
              <span>100%</span>
              <span className="ms-auto" aria-hidden="true">↓　▣　⋮</span>
            </div>
            <div className="tenure-letter-preview-canvas">
              <article className="tenure-letter-paper">
                <div className="d-flex justify-content-between mb-4"><span>Ref: <strong>{referenceCode || "________________"}</strong></span><span>Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                <p>To,<br /><strong>{employee.name}</strong><br />{employee.location}</p>
                <p>Dear {employee.name.split(" ")[0]},</p>
                <p>
                  Pursuant to the terms and conditions of your employment, the management is pleased to confirm your tenure change to <strong>{letterType}</strong> with effect from <strong>{effectiveDate}</strong>.
                </p>
                {assessment.period && <p>Your revised tenure period will be {assessment.period} months.</p>}
                {assessment.remarks && <p>{assessment.remarks}</p>}
                <p>All other terms and conditions of your employment shall remain unchanged.</p>
                <p className="mt-5">Thanking you,<br /><br />For the Management</p>
              </article>
            </div>
            <footer className="tenure-letter-modal-footer">
              {referenceCode && <span className="text-success me-auto">Demo reference: {referenceCode}</span>}
              <button type="button" className="btn btn-primary" onClick={generateReferenceCode}>
                {referenceCode ? "Generate Again" : "Generate Reference Code"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default TenureChangeLetter;
