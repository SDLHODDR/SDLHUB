import { useEffect, useMemo, useState } from "react";
import "../../assets/css/tenureChange.css";
import { getTenureCtcDetails, saveTenureCtcChange } from "../../services/tenureChangeService";
import { notifySuccess } from "../../../../services/alertService";

const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-IN");

const TenureChangeCtcModalContent = ({ config, show, record, onClose, onSuccess }) => {
  const employeeRecord = record?.employee ?? record ?? {};
  const [apiDetails, setApiDetails] = useState({});
  const employee = {
    code: employeeRecord.code ?? employeeRecord.empCode ?? employeeRecord.TRAN_CODE ?? employeeRecord.EMP_CODE_FOR ?? "-",
    name: apiDetails.employee?.name ?? apiDetails.employee?.EMP_NAME ?? employeeRecord.name ?? employeeRecord.empName ?? employeeRecord.EMP_NAME ?? "-",
    department: apiDetails.employee?.department ?? apiDetails.employee?.DEPARTMENT ?? employeeRecord.department ?? employeeRecord.DEPARTMENT ?? "-",
    employeeType: apiDetails.employee?.employeeType ?? apiDetails.employee?.EMPLOYEE_TYPE ?? employeeRecord.employeeType ?? employeeRecord.empType ?? "-",
    location: apiDetails.employee?.location ?? apiDetails.employee?.LOCATION ?? employeeRecord.location ?? employeeRecord.LOCATION ?? "-",
    designation: apiDetails.employee?.designation ?? apiDetails.employee?.DESIGNATION ?? employeeRecord.designation ?? employeeRecord.DESIGNATION ?? "-",
    currentCtc: apiDetails.assessment?.currentCtc ?? apiDetails.assessment?.CURR_CTC ?? employeeRecord.currentCtc ?? employeeRecord.current_ctc ?? employeeRecord.CURR_CTC ?? "",
  };
  const assessment = apiDetails.assessment ?? record?.assessment ?? record ?? {};
  const [pfInput, setPfInput] = useState("0");
  const [ctcHeads, setCtcHeads] = useState([]);
  const [monthlyAmounts, setMonthlyAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getTenureCtcDetails({
      taskId: record?.TASK_ID ?? config?.id,
      userTaskId: record?.ID,
      empCode: employee.code,
    })
      .then((response) => {
        if (!active) return;
        if (!response?.status) throw new Error(response?.message || "Unable to load CTC details.");
        const details = response.data?.data ?? response.data ?? {};
        setApiDetails(details);
        const rows = details.ctcHeads ?? details.ctc_heads ?? details.rows ?? [];
        setCtcHeads(rows.map((row, index) => ({
          ...row,
          code: row.code ?? row.AD_CODE ?? row.adCode ?? String(index),
          name: row.name ?? row.DESCR ?? row.SH_DESCR ?? row.description ?? row.AD_CODE ?? `CTC Head ${index + 1}`,
          structureMonthly: Number(row.structureMonthly ?? row.STRUCTURE_MONTHLY ?? row.monthly ?? row.AMOUNT_MNTH ?? 0),
          structureAnnual: Number(row.structureAnnual ?? row.STRUCTURE_ANNUAL ?? row.annual ?? row.AMOUNT_YEAR ?? (Number(row.monthly ?? 0) * 12)),
        })));
        setPfInput(String(details.pfInput ?? details.XPFBS ?? "0"));
        setMonthlyAmounts(Object.fromEntries(rows.map((row, index) => [
          row.code ?? row.AD_CODE ?? row.adCode ?? String(index),
          row.monthlyAmount ?? row.MONTHLY_AMOUNT ?? "",
        ])));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load CTC details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [config?.id, employee.code, record?.ID, record?.TASK_ID]);

  const totals = useMemo(() => ctcHeads.reduce((sum, head) => {
    const monthly = Number(monthlyAmounts[head.code] || 0);
    sum.monthly += monthly;
    sum.annual += monthly * 12;
    return sum;
  }, { monthly: 0, annual: 0 }), [monthlyAmounts]);

  if (!show || !record) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const submittedRows = ctcHeads.map((head) => {
        const enteredMonthly = monthlyAmounts[head.code];
        const monthly = enteredMonthly === "" || enteredMonthly == null
          ? head.structureMonthly
          : Number(enteredMonthly);
        return {
          ad_code: head.code,
          name: head.name,
          structure_monthly: head.structureMonthly,
          structure_annual: head.structureAnnual,
          monthly,
          annual: monthly * 12,
        };
      });
      const proposedCtc = submittedRows.reduce((total, row) => total + row.annual, 0);
      const response = await saveTenureCtcChange({
        task_id: record?.TASK_ID ?? config?.id,
        user_task_id: record?.ID,
        emp_code: employee.code,
        pf_input: Number(pfInput || 0),
        proposed_ctc: proposedCtc,
        ctc_heads: submittedRows,
      });
      if (!response?.status) throw new Error(response?.message || "Unable to save CTC changes.");
      notifySuccess(response.message || "CTC changes saved and sent for final authorization.");
      window.dispatchEvent(new Event("hrms-auth-tasks-changed"));
      onSuccess?.();
      onClose?.();
    } catch (requestError) {
      setError(requestError.message || "Unable to save CTC changes.");
    } finally {
      setSaving(false);
    }
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
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {loading && <div className="text-center py-4">Loading CTC details...</div>}
            {!loading && !error && ctcHeads.length === 0 && <div className="alert alert-info">No CTC structure is configured for this employee.</div>}
            <div className="tenure-change-page">
              <div className="row g-2 mb-3 tenure-employee-summary">
                <div className="col-lg-4">
                  <div><strong>Employee:</strong> {employee.name} ({employee.code})</div>
                  <div><strong>Department:</strong> {employee.department || "-"}</div>
                  <div><strong>Proposed CTC:</strong> ₹{formatAmount(assessment.proposedCtc ?? assessment.PROP_CTC)}</div>
                  <div><strong>Assessment Remarks:</strong> {assessment.remarks ?? assessment.REMARKS ?? "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Employee Type:</strong> {employee.employeeType || assessment.employeeType || assessment.ETYPE_ID || "-"}</div>
                  <div><strong>Employee Period:</strong> {assessment.period ?? assessment.ETYPE_PERIOD ?? "0"}</div>
                  <div><strong>Location:</strong> {employee.location || "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Designation:</strong> {employee.designation || "-"}</div>
                  <div><strong>Current CTC:</strong> ₹{formatAmount(employee.currentCtc)}</div>
                  <div><strong>Effective From:</strong> {assessment.effectiveFrom ?? assessment.EFF_FROM ?? "-"}</div>
                </div>
              </div>

              {!loading && ctcHeads.length > 0 && <div className="table-responsive tenure-ctc-table-wrap">
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
                      const monthly = Number(monthlyAmounts[head.code] || 0);
                      return (
                        <tr key={head.code}>
                          <td className="text-center">{index < 6 ? index + 1 : index + 2}</td>
                          <td>{head.name}</td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(head.structureMonthly)} disabled aria-label={`${head.name} structure monthly`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(head.structureAnnual)} disabled aria-label={`${head.name} structure annual`} /></td>
                          <td><input className="form-control form-control-sm text-end" type="number" min="0" value={monthlyAmounts[head.code] ?? ""} onChange={(event) => setMonthlyAmounts((current) => ({ ...current, [head.code]: event.target.value }))} aria-label={`${head.name} monthly amount`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(monthly * 12)} disabled aria-label={`${head.name} annual amount`} /></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="2" className="text-end fw-semibold">Sum in ₹:</td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(ctcHeads.reduce((sum, head) => sum + head.structureMonthly, 0))} disabled aria-label="Structure monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(ctcHeads.reduce((sum, head) => sum + head.structureAnnual, 0))} disabled aria-label="Structure annual total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.monthly)} disabled aria-label="Monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.annual)} disabled aria-label="Annual total" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading || saving || ctcHeads.length === 0}>{saving ? "Saving..." : "Save CTC"}</button>
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
