import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchEmpCTCHeads,
  saveTenureChangeCtcBreakup,
  submitTenureChangeCtc,
} from "../../services/tenureChangeService";
import "../../assets/css/tenureChange.css";

const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-IN");

const TenureChangeCtcModalContent = ({ config, show, record, onClose, onSuccess }) => {
  const employeeCode = record?.TRAN_CODE ?? record?.employee?.code ?? record?.EMP_CODE_FOR ?? "";
  const tenureChangeId = record?.TENURE_CHANGE_ID ?? record?.ID;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [pfInput, setPfInput] = useState("0");
  const [monthlyAmounts, setMonthlyAmounts] = useState({});
  const [variableAmounts, setVariableAmounts] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!show || !record || !employeeCode) return undefined;

    let active = true;
    const loadCtcHeads = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetchEmpCTCHeads({
          empCode: employeeCode,
          taskId: record.TASK_ID,
          tenureChangeId,
          xpfbs: hasLoaded.current ? pfInput : undefined,
        });
        const body = response?.data ?? response?.response?.data ?? response ?? {};
        const payload = body?.data ?? body;

        if (!(body?.status === true || body?.success === true || Array.isArray(payload?.rows))) {
          throw new Error(body?.message || "Employee CTC heads could not be loaded.");
        }
        if (!Array.isArray(payload.rows)) {
          throw new Error("The CTC-head response is invalid.");
        }

        if (!active) return;
        hasLoaded.current = true;
        setDetails(payload);
        if (payload.pfInput !== undefined && payload.pfInput !== null) {
          setPfInput(String(payload.pfInput));
        }
        setMonthlyAmounts((current) => Object.keys(current).length
          ? current
          : Object.fromEntries(payload.rows.map((row) => [row.adCode, row.monthly ?? ""])));
        setVariableAmounts((current) => Object.keys(current).length
          ? current
          : Object.fromEntries((payload.variableHeads ?? []).map((head) => [head.adCode, head.monthly ?? "0"])));
      } catch (error) {
        if (active) setLoadError(error?.message || "Employee CTC heads could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCtcHeads();
    return () => { active = false; };
  }, [show, record, employeeCode, tenureChangeId, pfInput]);

  const totals = useMemo(() => (details?.rows ?? []).reduce((sum, row) => {
    const monthly = Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0);
    sum.monthly += monthly;
    sum.annual += monthly * 12;
    return sum;
  }, { monthly: 0, annual: 0 }), [details, monthlyAmounts]);

  const buildPayload = () => {
    const rows = details?.rows ?? [];
    const variableHeads = details?.variableHeads ?? [];
    return {
      EMP_CODE: employeeCode,
      TASK_ID: details?.taskId ?? record?.TASK_ID ?? "",
      TENURE_CHG_ID: details?.tenureChangeId ?? tenureChangeId ?? "",
      CTC_EFF_FROM: details?.ctcEffectiveFrom ?? details?.employee?.ctcEffectiveFrom ?? details?.employee?.effectiveFrom ?? "",
      PROP_CTC: details?.employee?.proposedCtc ?? "",
      sum_annually: totals.annual,
      sum_annually_struct: details?.structureTotals?.proposedAnnual ?? 0,
      AMOUNT_MNTHLY: Object.fromEntries(rows.map((row) => [
        row.adCode,
        Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0),
      ])),
      AMOUNT_ANNUALLY: Object.fromEntries(rows.map((row) => [
        row.adCode,
        Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0) * 12,
      ])),
      AMOUNT_MNTHLY_VAR: Object.fromEntries(variableHeads.map((head) => [
        head.adCode,
        Number(head.adCode === "XPFBS" ? pfInput : variableAmounts[head.adCode] ?? head.monthly ?? 0),
      ])),
      jd_id: details?.jdId ?? details?.employee?.jdId ?? "",
    };
  };

  const buildSuccessResult = () => ({
    employee: details.employee,
    tenureChangeId: details.tenureChangeId,
    taskId: details.taskId,
    assessment: {
      employeeType: details.employee.employeeType,
      period: details.employee.period,
      proposedCtc: details.employee.proposedCtc,
      effectiveFrom: details.employee.effectiveFrom,
      remarks: details.employee.remarks,
      ctcStructure: {
        pfInput,
        variableHeads: (details.variableHeads ?? []).map((head) => ({
          ...head,
          monthly: Number(head.adCode === "XPFBS" ? pfInput : variableAmounts[head.adCode] ?? head.monthly ?? 0),
        })),
        rows: (details.rows ?? []).map((row) => ({
          ...row,
          monthly: Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0),
          annual: Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0) * 12,
        })),
        totals: { ...details.structureTotals, ...totals },
      },
    },
  });

  const updateCtcInput = (update) => {
    update();
    setSaveSucceeded(false);
    setActionMessage("");
  };

  const handleSave = async () => {
    console.log("details : ", details, " - saving: ", saving, " - submitting: ", submitting);
    if (!details || saving || submitting) return;

    const hasInvalidMonthlyAmount = (details.rows ?? []).some((row) => {
      const value = monthlyAmounts[row.adCode] ?? row.monthly ?? "";
      return value === "" || !Number.isFinite(Number(value)) || Number(value) < 0;
    });
    
    const proposedCtc = Number(details.employee?.proposedCtc);
    if (hasInvalidMonthlyAmount) {
      setActionMessage("Enter a valid monthly amount for every CTC head.");
      return;
    }
    if (!Number.isFinite(proposedCtc) || Math.abs(totals.annual - proposedCtc) > 100) {
      setActionMessage("Incorrect CTC. The annual total must be within ₹100 of the proposed CTC.");
      return;
    }

    setSaving(true);
    setSaveSucceeded(false);
    setActionMessage("");
    try {
      const response = await saveTenureChangeCtcBreakup(buildPayload());
      if (response?.status === true || response?.success === true) {
        setSaveSucceeded(true);
        setActionMessage(response?.message || "CTC breakup saved.");
      } else {
        setActionMessage(response?.message || "CTC breakup could not be saved.");
      }
    } catch (error) {
      setActionMessage(error?.message || "CTC breakup could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!saveSucceeded || submitting || saving) return;

    setSubmitting(true);
    setActionMessage("");
    try {
      const response = await submitTenureChangeCtc(buildPayload());
      if (response?.status === true || response?.success === true) {
        setActionMessage(response?.message || "CTC submitted for authorization.");
        onSuccess?.(buildSuccessResult());
        onClose?.();
      } else {
        setActionMessage(response?.message || "CTC could not be submitted.");
      }
    } catch (error) {
      setActionMessage(error?.message || "CTC could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !record) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="tenure-ctc-title">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" id="tenure-ctc-title">{config?.title || "CTC Structure"}</h5>
              <small className="text-muted">
                Employee Code: <strong>{employeeCode || "-"}</strong>
                <span className="mx-2">|</span>
                Task ID: <strong>{record.ID || "-"}</strong>
                <span className="mx-2">|</span>
                Workflow Task: <strong>{record.TASK_ID || "-"}</strong>
              </small>
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="Close"><span aria-hidden="true">&times;</span></button>
          </div>

          <div className="modal-body">
            {loading && !details ? (
              <div className="text-center py-5"><span className="spinner-border" role="status" aria-label="Loading" /><div className="mt-2">Loading CTC heads...</div></div>
            ) : loadError && !details ? (
              <div className="alert alert-warning mb-0" role="alert">{loadError}</div>
            ) : details ? <div className="tenure-change-page">
              <div className="row g-2 mb-3 tenure-employee-summary">
                <div className="col-lg-4">
                  <div><strong>Employee:</strong> {details.employee.name} ({details.employee.code})</div>
                  <div><strong>Department:</strong> {details.employee.department || "-"}</div>
                  <div><strong>Proposed CTC:</strong> ₹{formatAmount(details.employee.proposedCtc)}</div>
                  <div><strong>Assessment Remarks:</strong> {details.employee.remarks || "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Employee Type:</strong> {details.employee.employeeType || "-"}</div>
                  <div><strong>Employee Period:</strong> {details.employee.period || "0"}</div>
                  <div><strong>Location:</strong> {details.employee.location || "-"}</div>
                </div>
                <div className="col-lg-4">
                  <div><strong>Designation:</strong> {details.employee.designation || "-"}</div>
                  <div><strong>Current CTC:</strong> ₹{formatAmount(details.employee.currentCtc)}</div>
                  <div><strong>Effective From:</strong> {details.employee.effectiveFrom || "-"}</div>
                </div>
              </div>

              <div className="table-responsive tenure-ctc-table-wrap">
                <table className="table table-sm tenure-ctc-table mb-2">
                  <thead><tr><th>No</th><th>CTC Head</th><th className="text-center">Input (1/0)</th></tr></thead>
                  <tbody>
                    {(details.variableHeads ?? []).map((head, index) => (
                      <tr key={head.adCode}>
                        <td className="text-center">{index + 1}</td>
                        <td>{head.description} {head.adCode === "CPF" ? "(1: 12% of 15000 0: 12% of Basic)" : ""}</td>
                        <td><input className="form-control form-control-sm text-end" type="number" min="0" max={head.adCode === "XPFBS" ? "1" : undefined} value={head.adCode === "XPFBS" ? pfInput : variableAmounts[head.adCode] ?? head.monthly ?? "0"} readOnly={!head.editable} onChange={(event) => updateCtcInput(() => head.adCode === "XPFBS" ? setPfInput(event.target.value) : setVariableAmounts((current) => ({ ...current, [head.adCode]: event.target.value })))} aria-label={`${head.description} amount`} /></td>
                      </tr>
                    ))}
                    {details.variableHeads?.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No variable CTC heads configured.</td></tr>}
                  </tbody>
                </table>

                <table className="table table-sm tenure-ctc-table mb-2">
                  <thead><tr>
                    <th>No</th><th>CTC Head</th><th className="text-end">Current Structure Annually (₹)</th><th className="text-end">Proposed Structure Monthly (₹)</th><th className="text-end">Proposed Structure Annually (₹)</th><th className="text-end">Monthly (₹)</th><th className="text-end">Annual (₹)</th>
                  </tr></thead>
                  <tbody>
                    {(details.rows ?? []).map((row, index) => {
                      const monthly = Number(monthlyAmounts[row.adCode] ?? row.monthly ?? 0);
                      return (
                        <tr key={row.adCode}>
                          <td className="text-center">{index + 1}</td>
                          <td>{row.description}</td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(row.currentAnnual)} disabled aria-label={`${row.description} current annual`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(row.structureMonthly)} disabled aria-label={`${row.description} proposed monthly structure`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(row.structureAnnual)} disabled aria-label={`${row.description} proposed annual structure`} /></td>
                          <td><input className="form-control form-control-sm text-end" type="number" min="0" value={monthlyAmounts[row.adCode] ?? row.monthly ?? ""} readOnly={!row.editable} onChange={(event) => updateCtcInput(() => setMonthlyAmounts((current) => ({ ...current, [row.adCode]: event.target.value })))} aria-label={`${row.description} monthly amount`} /></td>
                          <td><input className="form-control form-control-sm text-end" value={formatAmount(monthly * 12)} disabled aria-label={`${row.description} annual amount`} /></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="2" className="text-end fw-semibold">Sum in ₹:</td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(details.structureTotals?.currentAnnual)} disabled aria-label="Current structure annual total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(details.structureTotals?.proposedMonthly)} disabled aria-label="Proposed structure monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(details.structureTotals?.proposedAnnual)} disabled aria-label="Proposed structure annual total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.monthly)} disabled aria-label="Monthly total" /></td>
                      <td><input className="form-control form-control-sm text-end" value={formatAmount(totals.annual)} disabled aria-label="Annual total" /></td>
                    </tr>
                  </tbody>
                </table>
                {loading && <div className="small text-muted" role="status">Recalculating structure...</div>}
                {loadError && <div className="alert alert-warning mt-2 mb-0" role="alert">{loadError}</div>}
              </div>
            </div>
              : <div className="alert alert-warning mb-0" role="alert">Employee code is not available for this CTC request.</div>}
          </div>

          <div className="modal-footer">
            {actionMessage && <span className="small text-muted me-auto" role="status">{actionMessage}</span>}
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!details || loading || saving || submitting}>
              {saving ? "Saving..." : "Save CTC"}
            </button>
            <button type="button" className="btn btn-warning" onClick={handleSubmit} disabled={!saveSucceeded || saving || submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
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
