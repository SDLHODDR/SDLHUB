  import { useState, useEffect } from "react";
  import { useDispatch } from "react-redux";
  import {
    getBankAuthorizationDetails,
    processBankAuthorization,
  } from "../../portals/hrms/services/authorization/authorizationService";
  import {
    notifySuccess,
    notifyError,
    confirmAction,
  } from "../../services/alertService";
  import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

  const BankAuthorizationModal = ({ show, record, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [inlineError, setInlineError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
      if (show && record) {
        loadRequestDetails();
        setRemarks("");
        setInlineError("");
        setActionLoading(null);
      } else {
        setDetails(null);
        setInlineError("");
      }
    }, [show, record]);

    const loadRequestDetails = async () => {
      try {
        setLoading(true);
        const res = await getBankAuthorizationDetails({
          task_id: record?.ID,
          req_id: record?.TRAN_CODE || "",
        });

        if (res?.status) {
          setDetails(res.data);
        } else {
          notifyError(res?.message || "Failed to load bank request details.");
        }
      } catch (err) {
        console.error("LOAD BANK DETAILS ERROR:", err);
        notifyError(err?.message || "Unable to load request details from server.");
      } finally {
        setLoading(false);
      }
    };

    const handleDecision = async (decision) => {
      const isApprove = decision === "A";

      if (!isApprove && !remarks.trim()) {
        setInlineError("Please enter remarks for rejection.");
        return;
      }

      setInlineError("");

      const confirmRes = await confirmAction(
        isApprove ? "Approve Bank Details?" : "Reject Bank Details?",
        `Are you sure you want to ${isApprove ? "accept" : "reject"} this bank details request?`
      );

      if (!confirmRes?.isConfirmed) return;

      try {
        setActionLoading(decision);
        const payload = {
          user_task_id: record?.ID,
          req_id: details?.REQ_ID || record?.TRAN_CODE,
          decision,
          remarks: remarks.trim(),
        };

        const res = await processBankAuthorization(payload);

        if (res?.status) {
          notifySuccess(res?.message || "Bank request processed successfully.");

          // Refresh task/authorization count in Redux store
          dispatch(getAuthroizationTaskCount());

          onClose();
          if (onSuccess) onSuccess();
        } else {
          notifyError(res?.message || "Action failed to process.");
        }
      } catch (err) {
        console.error("SUBMIT BANK DECISION ERROR:", err);
        notifyError(err?.response?.data?.message || err?.message || "Error processing request.");
      } finally {
        setActionLoading(null);
      }
    };

    if (!show) return null;

    const isBusy = actionLoading !== null;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-1">Bank Information Authorization</h5>
                <small className="text-muted">
                  Employee Code: <strong>{details?.EMP_CODE || record?.EMP_CODE_FOR}</strong>
                </small>
              </div>
              <button
                type="button"
                className="close"
                onClick={onClose}
                disabled={isBusy}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <div className="mt-2 text-muted">Loading bank request details...</div>
                </div>
              ) : details ? (
                <>
                  <div className="table-responsive border rounded mb-3">
                    <table className="table table-bordered table-sm mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "25%" }}>Field</th>
                          <th style={{ width: "37.5%" }}>Existing Data</th>
                          <th style={{ width: "37.5%" }}>Requested Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-semibold text-muted">Bank Name</td>
                          <td>{details.BANK_NAME || "—"}</td>
                          <td className={details.NEW_BANK_NAME !== details.BANK_NAME ? "text-primary fw-bold" : ""}>
                            {details.NEW_BANK_NAME || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted">Branch</td>
                          <td>{details.BANK_BRANCH || "—"}</td>
                          <td className={details.NEW_BANK_BRANCH !== details.BANK_BRANCH ? "text-primary fw-bold" : ""}>
                            {details.NEW_BANK_BRANCH || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted">IFSC Code</td>
                          <td>{details.BANK_IFSC || "—"}</td>
                          <td className={details.NEW_BANK_IFSC !== details.BANK_IFSC ? "text-primary fw-bold" : ""}>
                            {details.NEW_BANK_IFSC || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted">Account Number</td>
                          <td>{details.BANK_ACNO || "—"}</td>
                          <td className={details.NEW_BANK_ACNO !== details.BANK_ACNO ? "text-primary fw-bold" : ""}>
                            {details.NEW_BANK_ACNO || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted">Bank Nominee</td>
                          <td>{details.BANK_NOMINEE || "—"}</td>
                          <td className={details.NEW_BANK_NOMINEE !== details.BANK_NOMINEE ? "text-primary fw-bold" : ""}>
                            {details.NEW_BANK_NOMINEE || "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">
                      Authorization Remarks <span className="text-muted">(Required for Rejection)</span>
                    </label>
                    <textarea
                      rows="2"
                      className={`form-control ${inlineError ? "is-invalid" : ""}`}
                      placeholder="Enter approval/rejection remarks..."
                      value={remarks}
                      onChange={(e) => {
                        setRemarks(e.target.value);
                        if (inlineError) setInlineError("");
                      }}
                      maxLength={200}
                      disabled={isBusy}
                    ></textarea>
                    {inlineError && (
                      <div className="invalid-feedback d-block">
                        {inlineError}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-danger text-center py-4">Failed to load request details.</div>
              )}
            </div>

            <div className="modal-footer d-flex justify-content-between">
              {/* Left side: Reject button */}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDecision("R")}
                disabled={isBusy || loading || !details}
              >
                {actionLoading === "R" ? "Processing..." : "Reject"}
              </button>

              {/* Right side: Accept and Cancel buttons side by side */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleDecision("A")}
                  disabled={isBusy || loading || !details}
                >
                  {actionLoading === "A" ? "Processing..." : "Accept & Update"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isBusy}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default BankAuthorizationModal;