import { useState, useEffect, useRef } from "react";
import {
  getFamilyAuthorizationDetails,
  processFamilyAuthorization,
} from "../../portals/hrms/services/authorization/authorizationService";
import {
  notifySuccess,
  notifyError,
  confirmAction,
} from "../../services/alertService";

const FamilyAuthorizationModal = ({ show, record, onClose, onSuccess }) => {
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

  /* =========================================================
     FETCH DETAILS USING SERVICE
  ========================================================= */
  const loadRequestDetails = async () => {
    try {
      setLoading(true);

      const res = await getFamilyAuthorizationDetails({
        task_id: record?.ID,
        req_id: record?.TRAN_CODE || "",
      });

      if (res?.status) {
        setDetails(res.data);
      } else {
        notifyError(res?.message || "Failed to load request details.");
      }
    } catch (err) {
      console.error("LOAD FAMILY DETAILS ERROR:", err);
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
      isApprove ? "Approve Request?" : "Reject Request?",
      `Are you sure you want to ${isApprove ? "accept" : "reject"} this family detail change?`,
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

      const res = await processFamilyAuthorization(payload);

      if (res?.status) {
        notifySuccess(res?.message || "Authorization processed successfully.");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
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
  const actionType = details?.REQ_ACTION || "E";
  const actionBadge =
    actionType === "A"
      ? { label: "Add Member", color: "bg-success" }
      : actionType === "D"
        ? { label: "Delete / Remove Member", color: "bg-danger" }
        : { label: "Edit Member", color: "bg-primary" };

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
              <h5 className="modal-title mb-1">
                Family Information Authorization
              </h5>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${actionBadge.color}`}>
                  {actionBadge.label}
                </span>
                <small className="text-muted">
                  Employee Code:{" "}
                  <strong>{details?.EMP_CODE || record?.EMP_CODE_FOR}</strong>
                </small>
              </div>
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
                        <td className="fw-semibold text-muted">Member Name</td>
                        <td>{details.FM_NAME || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_FM_NAME !== details.FM_NAME
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_FM_NAME ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Relation</td>
                        <td>{details.FM_RELATION || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_FM_RELATION !== details.FM_RELATION
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_FM_RELATION ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          Date of Birth
                        </td>
                        <td>{details.DOB || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_DOB !== details.DOB
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_DOB ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Dependency</td>
                        <td>{details.FM_DEP || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_FM_DEP !== details.FM_DEP
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_FM_DEP ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Occupation</td>
                        <td>{details.FM_OCCUPATION || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_FM_OCCUPATION !== details.FM_OCCUPATION
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_FM_OCCUPATION ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Contact No</td>
                        <td>{details.FM_CONTACT || "—"}</td>
                        <td
                          className={
                            actionType !== "D" &&
                            details.NEW_FM_CONTACT !== details.FM_CONTACT
                              ? "text-primary fw-bold"
                              : ""
                          }
                        >
                          {details.NEW_FM_CONTACT ||
                            (actionType === "D" ? "<Marked for Removal>" : "—")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ATTACHMENT */}
                {details.DOC_PATH1 && (
                  <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 px-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-paperclip fs-5 text-primary"></i>
                      <div className="fw-semibold" style={{ fontSize: "13px" }}>
                        Supporting Document: {details.DOC_NAME1 || "Attachment"}
                      </div>
                    </div>
                    <a
                      href={`/uploads/member_document/${details.DOC_PATH1}`}
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
                Failed to load request info.
              </div>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            {/* REJECT BUTTON ON LEFT */}
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

            {/* ACCEPT & CANCEL ON RIGHT */}
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-primary me-2"
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

              <button
                type="button"
                className="btn btn-secondary me-2"
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

export default FamilyAuthorizationModal;