import { useEffect, useMemo, useState } from "react";
import OrganogramTab from "../../portals/hrms/portalutils/OrganogramTab";
import LocationsTab from "../../portals/hrms/portalutils/LocationsTab";
import AppraisalLevelsTab from "../../portals/hrms/portalutils/AppraisalLevelsTab";
import SDLTabsComponent from "../../portals/hrms/components/tabs/SDLTabsComponent";
import { processOrganogramAuthorization } from "../../portals/hrms/services/authorization/authorizationService";
import {
  notifyError,
  notifySuccess,
  confirmAction,
} from "../../services/alertService";

const READ_ONLY_STATUS = "T";

const OrganogramAuthorizationModal = ({
  show,
  record,
  onClose,
  onSuccess,
}) => {
  const [selectedTab, setSelectedTab] = useState("organogram");
  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(null);
  const organogramId = record?.TRAN_CODE || null;

  const tabs = useMemo(
    () => [
      { key: "organogram", label: "Organogram" },
      { key: "locations", label: "Location" },
      { key: "appraisalLevels", label: "Appraisal" },
    ],
    [],
  );

  useEffect(() => {
    if (show) {
      setSelectedTab("organogram");
      setRemarks("");
      setRemarkError("");
      setSubmittingAction(null);
    }
  }, [show, record]);

  const handleDecision = async (decision) => {
    const isApprove = decision === "A";
    if (!isApprove && !remarks.trim()) {
      setRemarkError("Reason is required");
      return;
    }

    const confirmation = await confirmAction(
      isApprove ? "Approve Organogram?" : "Reject Organogram?",
      `Are you sure you want to ${isApprove ? "approve" : "reject"} this organogram request?`,
    );
    if (!confirmation?.isConfirmed) return;

    try {
      setSubmittingAction(decision);
      const payload = {
        ID: record?.ID,
        TASK_ID: record?.TASK_ID,
        STATUS: record?.STATUS,
        TRAN_CODE: record?.TRAN_CODE,
        decision,
        remarks: remarks.trim(),
      };
      const response = await processOrganogramAuthorization(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Organogram authorization processed successfully.");
        onClose();
        onSuccess?.();
      } else {
        notifyError(response?.message || "Unable to process organogram authorization.");
      }
    } catch (error) {
      console.error("SUBMIT ORGANOGRAM DECISION ERROR:", error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Error processing organogram authorization.",
      );
    } finally {
      setSubmittingAction(null);
    }
  };

  if (!show || !record) return null;

  const isSubmitting = Boolean(submittingAction);
  const tabContent = {
    organogram: (
      <OrganogramTab
        organogramId={organogramId}
        organogramStatus={READ_ONLY_STATUS}
      />
    ),
    locations: (
      <LocationsTab
        organogramId={organogramId}
        organogramStatus={READ_ONLY_STATUS}
        showAll
      />
    ),
    appraisalLevels: (
      <AppraisalLevelsTab
        organogramId={organogramId}
        organogramStatus={READ_ONLY_STATUS}
        showAll
      />
    ),
  }[selectedTab];

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1">Organogram Authorization</h5>
              <small className="text-muted">
                Organogram ID: <strong>{record.TRAN_CODE}</strong>
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
            <SDLTabsComponent
              tabs={tabs}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              tabContent={tabContent}
            />

            {selectedTab === "organogram" && (
              <div className="mt-4 pt-3 border-top">
                <label className="form-label fw-semibold">
                  Authorization Remarks <span className="text-muted">(Required for Rejection)</span>
                </label>
                <textarea
                  rows="3"
                  className={`form-control ${remarkError ? "is-invalid" : ""}`}
                  value={remarks}
                  maxLength={200}
                  placeholder="Enter approval/rejection remarks..."
                  onChange={(event) => {
                    setRemarks(event.target.value);
                    if (event.target.value.trim()) setRemarkError("");
                  }}
                />
                <div className="d-flex justify-content-between">
                  <div className="invalid-feedback d-block">{remarkError}</div>
                  <small className="text-muted ms-auto">{remarks.length}/200</small>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            {selectedTab === "organogram" && (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDecision("R")}
                  disabled={isSubmitting}
                >
                  {submittingAction === "R" ? "Processing..." : "Reject"}
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleDecision("A")}
                  disabled={isSubmitting}
                >
                  {submittingAction === "A" ? "Processing..." : "Approve"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganogramAuthorizationModal;
