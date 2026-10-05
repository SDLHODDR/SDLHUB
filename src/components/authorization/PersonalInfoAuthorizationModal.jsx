import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getPersonalInfoAuthorizationDetails,
  processPersonalInfoAuthorization,
} from "../../portals/hrms/services/authorization/authorizationService";
import {
  notifySuccess,
  notifyError,
  confirmAction,
} from "../../services/alertService";

// Correct import from HRMS slice for top header badge count
import { getHRMSAuthroizationTaskCount } from "../../store/hrms/hrmsAuthorizationCountSlice";

/* =========================================================
   HELPER: Generate HTTP URL that passes file path to PHP
========================================================= */
const getDocumentUrl = (docPath) => {
  if (!docPath) return "#";

  if (docPath.startsWith("http://") || docPath.startsWith("https://")) {
    return docPath;
  }

  // Strip leading slash if any
  const cleanPath = docPath.startsWith("/") ? docPath.slice(1) : docPath;

  // Uses your PHP endpoint to safely fetch from /mnt/documents
  const viewerUrl =
    import.meta.env.VITE_DOCUMENT_VIEWER_URL ||
    `${import.meta.env.VITE_BASE_URL}/common/view_document.php`;

  return `${viewerUrl}?file=${encodeURIComponent(cleanPath)}`;
};

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

  const dispatch = useDispatch();

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

  /* =========================================================
     FETCH DETAILS USING SERVICE
  ========================================================= */
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
        notifyError(res?.message || "Failed to load request details.");
      }
    } catch (err) {
      console.error("LOAD PERSONAL DETAILS ERROR:", err);
      notifyError(
        err?.message || "Unable to load request details from server.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INPUT CHANGE HANDLER
  ========================================================= */
  const handleRemarksChange = (e) => {
    const val = e.target.value;
    setRemarks(val);
    if (val.trim() && remarkError) {
      setRemarkError("");
    }
  };

  /* =========================================================
     DECISION HANDLER (ACCEPT / REJECT)
  ========================================================= */
  const handleDecision = async (decision) => {
    const isApprove = decision === "A";

    // Inline validation for Rejection
    if (!isApprove && !remarks.trim()) {
      setRemarkError("Please enter remarks for rejection.");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }

    setRemarkError("");

    const confirmRes = await confirmAction(
      isApprove ? "Approve Personal Details?" : "Reject Personal Details?",
      `Are you sure you want to ${isApprove ? "accept" : "reject"} this personal/address change request?`,
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
        notifySuccess(res?.message || "Authorization processed successfully.");

        // 1. Refresh HRMS header task count in Redux store
        dispatch(getHRMSAuthroizationTaskCount());

        // 2. Refresh parent list view
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        notifyError(res?.message || "Action failed to process.");
      }
    } catch (err) {
      console.error("SUBMIT DECISION ERROR:", err);
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          "Error processing request.",
      );
    } finally {
      setSubmittingAction(null);
    }
  };

  if (!show) return null;

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
          {/* HEADER */}
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1">
                Personal & Address Information Authorization
              </h5>
              <small className="text-muted">
                Employee Code:{" "}
                <strong>{details?.EMP_CODE || record?.EMP_CODE_FOR}</strong>
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

          {/* BODY */}
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <div className="mt-2 text-muted">
                  Loading request details...
                </div>
              </div>
            ) : details ? (
              <>
                {/* COMPARISON TABLE */}
                {/* COMPARISON TABLE */}
                <div
                  className="border rounded mb-3"
                  style={{ overflowX: "hidden" }}
                >
                  <table
                    className="table table-bordered table-sm mb-0 align-middle"
                    style={{ tableLayout: "fixed", width: "100%", margin: 0 }}
                  >
                    <colgroup>
                      <col style={{ width: "26%" }} />
                      <col style={{ width: "37%" }} />
                      <col style={{ width: "37%" }} />
                    </colgroup>
                    <thead className="table-light">
                      <tr>
                        <th>Field</th>
                        <th>Existing Data</th>
                        <th>Requested Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* CURRENT ADDRESS */}
                      <tr>
                        <td className="fw-semibold text-muted">
                          Current Address
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {details.CURRENT_ADDRESS || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                          className={
                            details.NEW_CURRENT_ADDRESS !==
                            details.CURRENT_ADDRESS
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_CURRENT_ADDRESS || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Current City</td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {details.CURRENT_CITY || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                          className={
                            details.NEW_CURRENT_CITY !== details.CURRENT_CITY
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_CURRENT_CITY || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Current State
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {details.CURRENT_STATE || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                          className={
                            details.NEW_CURRENT_STATE !== details.CURRENT_STATE
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_CURRENT_STATE || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Current Pincode
                        </td>
                        <td>{details.CURRENT_PINCODE || "—"}</td>
                        <td
                          className={
                            details.NEW_CURRENT_PINCODE !==
                            details.CURRENT_PINCODE
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_CURRENT_PINCODE || "—"}
                        </td>
                      </tr>

                      {/* PERMANENT ADDRESS */}
                      <tr>
                        <td className="fw-semibold text-muted">
                          Permanent Address
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {details.PERMNT_ADDRESS || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                          className={
                            details.NEW_PERMNT_ADDRESS !==
                            details.PERMNT_ADDRESS
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_PERMNT_ADDRESS || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Permanent City
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {details.PERMNT_CITY || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                          className={
                            details.NEW_PERMNT_CITY !== details.PERMNT_CITY
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_PERMNT_CITY || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Permanent State
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {details.PERMNT_STATE || "—"}
                        </td>
                        <td
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                          className={
                            details.NEW_PERMNT_STATE !== details.PERMNT_STATE
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_PERMNT_STATE || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Permanent Pincode
                        </td>
                        <td>{details.PERMNT_PINCODE || "—"}</td>
                        <td
                          className={
                            details.NEW_PERMNT_PINCODE !==
                            details.PERMNT_PINCODE
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_PERMNT_PINCODE || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ATTACHMENT / PROOF /}
                {details.DOC_PATH1 && (
                  <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 px-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-paperclip fs-5 text-primary"></i>
                      <div className="fw-semibold" style={{ fontSize: "13px" }}>
                        Address Proof: {details.DOC_NAME1 || "Document"}
                      </div>
                    </div>
                    <a
                      href={`/mnt/${details.DOC_PATH1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="ti ti-eye me-1"></i> View Document
                    </a>
                  </div>
                )} */}

                {/* ATTACHMENT / PROOF */}
                {details.DOC_PATH1 && (
                  <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 px-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-paperclip fs-5 text-primary"></i>
                      <div className="fw-semibold" style={{ fontSize: "13px" }}>
                        Address Proof: {details.DOC_NAME1 || "Document"}
                      </div>
                    </div>
                    <a
                      href={getDocumentUrl(details.DOC_PATH1)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="ti ti-eye me-1"></i> View Document
                    </a>
                  </div>
                )}

                {/* REMARKS INPUT WITH INLINE VALIDATION */}
                <div className="mb-2">
                  <label className="form-label fw-semibold mb-1">
                    Authorization Remarks{" "}
                    <span
                      className="text-muted fw-normal"
                      style={{ fontSize: "12px" }}
                    >
                      (Required for Rejection)
                    </span>
                  </label>

                  <div className="position-relative">
                    <textarea
                      ref={textareaRef}
                      rows="2"
                      className={`form-control ${
                        remarkError ? "is-invalid" : ""
                      }`}
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
              <div className="text-danger text-center py-4">
                Failed to load request details.
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer d-flex">
            <div className="d-flex gap-2">
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
                  "Accept"
                )}
              </button>

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

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
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

export default PersonalInfoAuthorizationModal;
