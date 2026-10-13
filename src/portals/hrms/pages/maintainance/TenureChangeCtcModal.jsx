import { useMemo, useState } from "react";
import "../../assets/css/tenureChange.css";

const ctcHeads = [
  { name: "Basic (50 % of CTC)", monthly: 10700 },
  { name: "House Rent Allowance (50 % of Basic)", monthly: 5350 },
  { name: "Attire Allowance (Fixed)", monthly: 750 },
  { name: "Field Hardship Allowance (Fixed)", monthly: 1250 },
  { name: "Medical Allowance (5 % of Basic)", monthly: 550 },
  { name: "Professional Fees (Fixed)", monthly: 0 },
  { name: "CTC PF (Fixed)", monthly: 1284 },
  { name: "CTC Gratuity (5 % of Basic)", monthly: 535 },
  { name: "CTC Bonus (8.33 % of Basic)", monthly: 892 },
];

const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-IN");

const TenureChangeCtcModalContent = ({ config, show, record, onClose, onSuccess }) => {
  const employeeRecord = record?.employee ?? record ?? {};
  const employee = {
    code: employeeRecord.code ?? employeeRecord.empCode ?? employeeRecord.TRAN_CODE ?? employeeRecord.EMP_CODE_FOR ?? "-",
    name: employeeRecord.name ?? employeeRecord.empName ?? employeeRecord.EMP_NAME ?? "-",
    department: employeeRecord.department ?? employeeRecord.DEPARTMENT ?? "-",
    employeeType: employeeRecord.employeeType ?? employeeRecord.empType ?? "-",
    location: employeeRecord.location ?? employeeRecord.LOCATION ?? "-",
    designation: employeeRecord.designation ?? employeeRecord.DESIGNATION ?? "-",
    currentCtc: employeeRecord.currentCtc ?? employeeRecord.current_ctc ?? employeeRecord.CURR_CTC ?? "",
  };
  const assessment = record?.assessment ?? record ?? {};
  const [pfInput, setPfInput] = useState("0");
  const [monthlyAmounts, setMonthlyAmounts] = useState({});

  const totals = useMemo(() => ctcHeads.reduce((sum, head, index) => {
    const monthly = Number(monthlyAmounts[index] || 0);
    sum.monthly += monthly;
    sum.annual += monthly * 12;
    return sum;
  }, { monthly: 0, annual: 0 }), [monthlyAmounts]);

  if (!show || !record) return null;

  const handleSave = () => {
    onSuccess?.({
      employee,
      assessment: {
        ...assessment,
        ctcStructure: {
          pfInput,
          rows: ctcHeads.map((head, index) => ({
            name: head.name,
            structureMonthly: head.monthly,
            structureAnnual: head.monthly * 12,
            monthly: Number(monthlyAmounts[index] || 0),
            annual: Number(monthlyAmounts[index] || 0) * 12,
          })),
          totals,
        },
      },
    });
    onClose?.();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="tenure-ctc-title">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" id="tenure-ctc-title">{config?.title || "CTC Structure"}</h5>
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
              <div className="row g-2 mb-3 tenure-employee-summary">
                <div className="col-lg-4">
                  <div><strong>Employee:</strong> {employee.name} ({employee.code})</div>
                  <div><strong>Department:</strong> {employee.department || "-"}</div>
                  <div><strong>Proposed CTC:</strong> ₹{formatAmount(assessment.proposedCtc ?? assessment.PROP_CTC)}</div>
                  <div><strong>Assessment Remarks:</strong> {assessment.remarks ?? assessment.REMARKS ?? "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Employee Type:</strong> {assessment.employeeType ?? assessment.ETYPE_ID ?? employee.employeeType ?? "-"}</div>
                  <div><strong>Employee Period:</strong> {assessment.period ?? assessment.ETYPE_PERIOD ?? "0"}</div>
                  <div><strong>Location:</strong> {employee.location || "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Designation:</strong> {employee.designation || "-"}</div>
                  <div><strong>Current CTC:</strong> ₹{formatAmount(employee.currentCtc)}</div>
                  <div><strong>Effective From:</strong> {assessment.effectiveFrom ?? assessment.EFF_FROM ?? "-"}</div>
                </div>
              </div>

              <div className="table-responsive tenure-ctc-table-wrap">
                <table className="table table-sm tenure-ctc-table mb-2">
                  <thead><tr><th>No</th><th>CTC Head</th><th className="text-center">Input (1/0)</th></tr></thead>
                  <tbody><tr>
                    <td className="text-center">1</td>
                    <td>Basic Criteria for PF (1: 12% of 15000 0: 12% of Basic)</td>
                    <td><input className="form-control form-control-sm text-end" type="number" min="0" value={pfInput} onChange={(event) => setPfInput(event.target.value)} aria-label="PF calculation input" /></td>
                  </tr></tbody>
                </table>

                <table className="table table-sm tenure-ctc-table mb-2">
                  <thead><tr>
                    <th>No</th><th>CTC Head</th><th className="text-end">As per Structure Monthly (₹)</th><th className="text-end">As per Structure Annually (₹)</th><th className="text-end">Monthly (₹)</th><th className="text-end">Annual (₹)</th>
                  </tr></thead>
                  <tbody>
                    {ctcHeads.map((head, index) => {
                      const monthly = Number(monthlyAmounts[index] || 0);
                      return (
                        <tr key={head.name}>
                          <td className="text-center">{index < 6 ? index + 1 : index + 2}</td>
                          <td>{head.name}</td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(head.monthly)} disabled aria-label={`${head.name} structure monthly`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(head.monthly * 12)} disabled aria-label={`${head.name} structure annual`} /></td>
                          <td><input className="form-control form-control-sm text-end" type="number" min="0" value={monthlyAmounts[index] ?? ""} onChange={(event) => setMonthlyAmounts((current) => ({ ...current, [index]: event.target.value }))} aria-label={`${head.name} monthly amount`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(monthly * 12)} disabled aria-label={`${head.name} annual amount`} /></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="2" className="text-end fw-semibold">Sum in ₹:</td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(ctcHeads.reduce((sum, head) => sum + head.monthly, 0))} disabled aria-label="Structure monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(ctcHeads.reduce((sum, head) => sum + head.monthly * 12, 0))} disabled aria-label="Structure annual total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.monthly)} disabled aria-label="Monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.annual)} disabled aria-label="Annual total" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save CTC</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TenureChangeCtcModal = (props) => {
  if (!props.show || !props.record) return null;
  const key = `${props.record.ID ?? ""}-${props.record.TASK_ID ?? ""}-${props.record.TRAN_CODE ?? props.record.EMP_CODE_FOR ?? ""}`;
  return <TenureChangeCtcModalContent key={key} {...props} />;
};

export default TenureChangeCtcModal;
