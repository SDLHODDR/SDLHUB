import { useState } from "react";
import { tenureTypeOptions } from "./tenureChangeOptions";
import "../../assets/css/tenureChange.css";

const TenureChangeLetterModalContent = ({ config, show, record, onClose, onSuccess }) => {
  const employeeRecord = record?.employee ?? record ?? {};
  const employee = {
    code: employeeRecord.code ?? employeeRecord.empCode ?? employeeRecord.TRAN_CODE ?? employeeRecord.EMP_CODE_FOR ?? "-",
    name: employeeRecord.name ?? employeeRecord.empName ?? employeeRecord.EMP_NAME ?? "-",
    dateOfJoining: employeeRecord.dateOfJoining ?? employeeRecord.doj ?? employeeRecord.DOJ ?? "-",
    designation: employeeRecord.designation ?? employeeRecord.DESIGNATION ?? "-",
    department: employeeRecord.department ?? employeeRecord.DEPARTMENT ?? "-",
    location: employeeRecord.location ?? employeeRecord.LOCATION ?? "-",
    tenureDueDate: employeeRecord.tenureDueDate ?? employeeRecord.tenureDue ?? employeeRecord.TENURE_DUE_DATE ?? "-",
    currentCtc: employeeRecord.currentCtc ?? employeeRecord.current_ctc ?? employeeRecord.CURR_CTC ?? "",
    employeeType: employeeRecord.employeeType ?? employeeRecord.empType ?? employeeRecord.EMP_TYPE ?? "",
  };
  const assessment = record?.assessment ?? record ?? {};
  const [letterType, setLetterType] = useState(assessment.employeeType ?? employee.employeeType ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  if (!show || !record) return null;

  const effectiveFrom = assessment.effectiveFrom ?? assessment.EFF_FROM;
  const effectiveDate = effectiveFrom
    ? new Date(`${effectiveFrom}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "-";
  const currentCtc = employee.currentCtc ? Number(employee.currentCtc).toLocaleString("en-IN") : "-";
  const proposedCtcValue = assessment.proposedCtc ?? assessment.PROP_CTC;
  const proposedCtc = proposedCtcValue ? Number(proposedCtcValue).toLocaleString("en-IN") : "-";

  const generateReferenceCode = () => {
    setReferenceCode(`DEMO-TC-${new Date().getFullYear()}-0001`);
  };

  const handleDone = () => {
    onSuccess?.({ employee, assessment, letterType, referenceCode });
    onClose?.();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="tenure-letter-title">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" id="tenure-letter-title">{config?.title || "Print Tenure Change Letter"}</h5>
              <small className="text-muted">
                Employee Code: <strong>{employee.code || "-"}</strong>
                <span className="mx-2">|</span>
                Task ID: <strong>{record.ID || "-"}</strong>
                <span className="mx-2">|</span>
                Workflow Task: <strong>{record.TASK_ID || "-"}</strong>
              </small>
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="Close"><span aria-hidden="true">&times;</span></button>
          </div>

          <div className="modal-body">
            <div className="tenure-change-page">
              <div className="row g-3 tenure-letter-summary">
                <div className="col-lg-4">
                  <div><strong>Employee:</strong> {employee.code} - {employee.name}</div>
                  <div><strong>Employee Type:</strong> {letterType || assessment.employeeType || employee.employeeType || "-"}</div>
                  <div><strong>Employee Period:</strong> {assessment.period ?? assessment.ETYPE_PERIOD ?? "-"} months</div>
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
                  <div><strong>Remarks:</strong> {assessment.remarks ?? assessment.REMARKS ?? "-"}</div>
                </div>
              </div>

              <div className="row align-items-end g-3 mt-3">
                <div className="col-lg-3 col-md-5">
                  <label className="form-label" htmlFor="tenure-letter-template">Letter Template</label>
                  <select id="tenure-letter-template" className="form-select" value={letterType} onChange={(event) => { setLetterType(event.target.value); setReferenceCode(""); }}>
                    <option value="">Select Letter Template</option>
                    {tenureTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="col-auto">
                  <button type="button" className="btn btn-warning tenure-preview-button" disabled={!letterType} onClick={() => { setReferenceCode(""); setPreviewOpen(true); }}>Preview Template</button>
                </div>
              </div>

              {referenceCode && <div className="alert alert-success mt-4 mb-0" role="status">Demo reference code: <strong>{referenceCode}</strong></div>}
            </div>
          </div>

          <div className="modal-footer">
            {referenceCode && <span className="text-success me-auto">Demo reference: {referenceCode}</span>}
            <button type="button" className="btn btn-primary" onClick={handleDone}>Done</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
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
              <span>1 / 1</span><span>100%</span><span className="ms-auto" aria-hidden="true">↓ ▣ ⋮</span>
            </div>
            <div className="tenure-letter-preview-canvas">
              <article className="tenure-letter-paper">
                <div className="d-flex justify-content-between mb-4"><span>Ref: <strong>{referenceCode || "________________"}</strong></span><span>Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                <p>To,<br /><strong>{employee.name}</strong><br />{employee.location}</p>
                <p>Dear {employee.name.split(" ")[0]},</p>
                <p>Pursuant to the terms and conditions of your employment, the management is pleased to confirm your tenure change to <strong>{letterType}</strong> with effect from <strong>{effectiveDate}</strong>.</p>
                {(assessment.period ?? assessment.ETYPE_PERIOD) && <p>Your revised tenure period will be {assessment.period ?? assessment.ETYPE_PERIOD} months.</p>}
                {(assessment.remarks ?? assessment.REMARKS) && <p>{assessment.remarks ?? assessment.REMARKS}</p>}
                <p>All other terms and conditions of your employment shall remain unchanged.</p>
                <p className="mt-5">Thanking you,<br /><br />For the Management</p>
              </article>
            </div>
            <footer className="tenure-letter-modal-footer">
              {referenceCode && <span className="text-success me-auto">Demo reference: {referenceCode}</span>}
              <button type="button" className="btn btn-primary" onClick={generateReferenceCode}>{referenceCode ? "Generate Again" : "Generate Reference Code"}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

const TenureChangeLetterModal = (props) => {
  if (!props.show || !props.record) return null;
  const key = `${props.record.ID ?? ""}-${props.record.TASK_ID ?? ""}-${props.record.TRAN_CODE ?? props.record.EMP_CODE_FOR ?? ""}`;
  return <TenureChangeLetterModalContent key={key} {...props} />;
};

export default TenureChangeLetterModal;
