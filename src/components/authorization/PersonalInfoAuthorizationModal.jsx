import { useState, useEffect, useRef } from "react";
import {
  getPersonalInfoAuthorizationDetails,
  processPersonalInfoAuthorization,
} from "../../portals/hrms/services/authorization/authorizationService";
import {
  notifySuccess,
  notifyError,
  confirmAction,
} from "../../services/alertService";

const PersonalInfoAuthorizationModal = ({
  show,
  record,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(null); // 'A' | 'R' | null
  const textareaRef = useRef(null);

  useEffect(() => {
    if (show && record) {
      loadRequestDetails();
      setRemarks("");
      setRemarkError("");
      setSubmittingAction(null);
    } else {
      setDetails(null);
      setRemarkError("");
      setSubmittingAction(null);
    }
  }, [show, record]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const res = await getPersonalInfoAuthorizationDetails({
        task_id: record?.ID,
        req_id: record?.TRAN_CODE || "",
      });

      if (res?.status) {
        setDetails(res.data);
      } else {
        notifyError(res?.message || "Failed to load address request details.");
      }
    } catch (err) {
      console.error("LOAD ADDRESS DETAILS ERROR:", err);
      notifyError(err?.message || "Unable to load request details from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemarksChange = (e) => {
    const val = e.target.value;
    setRemarks(val);
    if (val.trim() && remarkError) {
      setRemarkError("");
    }
  };

  const handleDecision = async (decision) => {
    const isApprove = decision === "A";

    // Inline validation on Rejection
    if (!isApprove && !remarks.trim()) {
      setRemarkError("Reason is required");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }

    setRemarkError("");

    const confirmRes = await confirmAction(
      isApprove ? "Approve Address Change?" : "Reject Address Change?",
      `Are you sure you want to ${isApprove ? "accept" : "reject"} this address change request?`
    );

    if (!confirmRes?.isConfirmed) return;

    try {
      setSubmittingAction(decision);
      const payload = {
        user_task_id: record?.ID,
        req_id: details?.REQ_ID || record?.TRAN_CODE,
        decision,
        remarks: remarks.trim(),
      };

      const res = await processPersonalInfoAuthorization(payload);

      if (res?.status) {
        notifySuccess(res?.message || "Address change processed successfully.");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        notifyError(res?.message || "Action failed to process.");
      }
    } catch (err) {
      console.error("SUBMIT ADDRESS DECISION ERROR:", err);
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          "Error processing request."
      );
    } finally {
      setSubmittingAction(null);
    }
  };

  if (!show) return null;

  /* Cell style that forces wrapping and prevents overflow scrolling */
  const cellStyle = {
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    verticalAlign: "top",
    lineHeight: "1.45",
  };

  const isSubmitting = Boolean(submittingAction);

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
              <h5 className="modal-title mb-1">Address Change Authorization</h5>
              <small className="text-muted">
                Employee Code: <strong>{details?.EMP_CODE || record?.EMP_CODE_FOR}</strong>
              </small>
            </div>
            <button
              type="button"
              className="close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Loading address request details...</div>
              </div>
            ) : details ? (
              <>
                {/* CURRENT ADDRESS COMPARISON */}
                <h6 className="fw-bold text-dark mb-2">Current Address</h6>
                <div className="border rounded mb-3 overflow-hidden">
                  <table
                    className="table table-bordered table-sm mb-0"
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "20%" }}>Field</th>
                        <th style={{ width: "40%" }}>Existing Data</th>
                        <th style={{ width: "40%" }}>Requested Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>Address</td>
                        <td style={cellStyle}>{details.ADDRESS || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: details.NEW_ADDRESS !== details.ADDRESS ? "600" : "normal",
                            color: details.NEW_ADDRESS !== details.ADDRESS ? "#0d6efd" : "inherit",
                          }}
                        >
                          {details.NEW_ADDRESS || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>City</td>
                        <td style={cellStyle}>{details.CITY || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: details.NEW_CITY !== details.CITY ? "600" : "normal",
                            color: details.NEW_CITY !== details.CITY ? "#0d6efd" : "inherit",
                          }}
                        >
                          {details.NEW_CITY || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>State</td>
                        <td style={cellStyle}>{details.STATE || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: details.NEW_STATE !== details.STATE ? "600" : "normal",
                            color: details.NEW_STATE !== details.STATE ? "#0d6efd" : "inherit",
                          }}
                        >
                          {details.NEW_STATE || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>Pincode</td>
                        <td style={cellStyle}>{details.PINCODE || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: details.NEW_PINCODE !== details.PINCODE ? "600" : "normal",
                            color: details.NEW_PINCODE !== details.PINCODE ? "#0d6efd" : "inherit",
                          }}
                        >
                          {details.NEW_PINCODE || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PERMANENT ADDRESS COMPARISON */}
                <h6 className="fw-bold text-dark mb-2">Permanent Address</h6>
                <div className="border rounded mb-3 overflow-hidden">
                  <table
                    className="table table-bordered table-sm mb-0"
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "20%" }}>Field</th>
                        <th style={{ width: "40%" }}>Existing Data</th>
                        <th style={{ width: "40%" }}>Requested Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>Address</td>
                        <td style={cellStyle}>{details.PERMNT_ADDRESS || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight:
                              details.NEW_PERMNT_ADDRESS !== details.PERMNT_ADDRESS
                                ? "600"
                                : "normal",
                            color:
                              details.NEW_PERMNT_ADDRESS !== details.PERMNT_ADDRESS
                                ? "#0d6efd"
                                : "inherit",
                          }}
                        >
                          {details.NEW_PERMNT_ADDRESS || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>City</td>
                        <td style={cellStyle}>{details.PERMNT_CITY || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight:
                              details.NEW_PERMNT_CITY !== details.PERMNT_CITY ? "600" : "normal",
                            color:
                              details.NEW_PERMNT_CITY !== details.PERMNT_CITY ? "#0d6efd" : "inherit",
                          }}
                        >
                          {details.NEW_PERMNT_CITY || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>State</td>
                        <td style={cellStyle}>{details.PERMNT_STATE || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight:
                              details.NEW_PERMNT_STATE !== details.PERMNT_STATE
                                ? "600"
                                : "normal",
                            color:
                              details.NEW_PERMNT_STATE !== details.PERMNT_STATE
                                ? "#0d6efd"
                                : "inherit",
                          }}
                        >
                          {details.NEW_PERMNT_STATE || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted" style={cellStyle}>Pincode</td>
                        <td style={cellStyle}>{details.PERMNT_PINCODE || "—"}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight:
                              details.NEW_PERMNT_PINCODE !== details.PERMNT_PINCODE
                                ? "600"
                                : "normal",
                            color:
                              details.NEW_PERMNT_PINCODE !== details.PERMNT_PINCODE
                                ? "#0d6efd"
                                : "inherit",
                          }}
                        >
                          {details.NEW_PERMNT_PINCODE || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ADDRESS PROOF ATTACHMENT */}
                {details.DOC_PATH1 && (
                  <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 px-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-file-text fs-4 text-primary"></i>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "13px" }}>
                          Submitted Address Proof: {details.DOC_NAME1 || "Address Proof Document"}
                        </div>
                        <small className="text-muted">Click to view or download proof file</small>
                      </div>
                    </div>
                    <a
                      href={`/${details.DOC_PATH1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="ti ti-eye me-1"></i> View Document
                    </a>
                  </div>
                )}

                {/* REMARKS / REASON SECTION */}
                <div className="mb-2">
                  <label className="form-label fw-semibold mb-1">
                    Reason <span className="text-muted fw-normal" style={{ fontSize: "12px" }}>(Required for Rejection)</span>
                  </label>

                  <div className="position-relative">
                    <textarea
                      ref={textareaRef}
                      rows="2"
                      className={`form-control ${remarkError ? "is-invalid" : ""}`}
                      style={{
                        paddingRight: remarkError ? "35px" : "12px",
                        resize: "none",
                        borderColor: remarkError ? "#dc3545" : undefined,
                      }}
                      placeholder="Enter remarks / reason..."
                      value={remarks}
                      onChange={handleRemarksChange}
                      maxLength={200}
                    ></textarea>

                    {/* Exclamation Error Icon inside Textarea */}
                    {remarkError && (
                      <div
                        className="position-absolute text-danger"
                        style={{
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          fontSize: "18px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <i className="ti ti-alert-circle"></i>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Error Text & Character Counter */}
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span
                      className="text-danger"
                      style={{
                        fontSize: "12px",
                        visibility: remarkError ? "visible" : "hidden",
                      }}
                    >
                      {remarkError}
                    </span>
                    <span className="text-muted" style={{ fontSize: "12px" }}>
                      {remarks.length}/200
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-danger text-center py-4">Failed to load request details.</div>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <div className="d-flex gap-2">
              {/* REJECT BUTTON */}
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDecision("R")}
                disabled={isSubmitting || loading || !details}
              >
                {submittingAction === "R" ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : (
                  "Reject"
                )}
              </button>

              {/* ACCEPT BUTTON */}
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleDecision("A")}
                disabled={isSubmitting || loading || !details}
              >
                {submittingAction === "A" ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : (
                  "Accept & Update"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoAuthorizationModal;