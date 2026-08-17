// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
import { authLRData, rejectLRData } from "../services/leavesService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import SDLFormField from "../../../components/SDLFormField"
import SDLAuthorizationActionButtons from "../../../components/SDLAuthorizationActionButtons";

const LeavesAuthorizationModal = ({
  leaves,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const getByteLength = (str) => new TextEncoder().encode(str || "").length;
  const [formData, setFormData] = useState(() => ({
      ID: leaves.TRAN_CODE,
      TASK_ID: leaves.ID,
      TRAN_CODE: leaves.TRAN_CODE,
      CREATED_BY: leaves.CREATED_BY,
      CREATED_ON: leaves.CREATED_ON,
      REQUEST_FOR: leaves.REQUEST_FOR,
      TabId: leaves.TASK_ID,
      EMP_CODE: leaves.DETAILS.EMP_CODE,
      LVE_DATE_FR: leaves.DETAILS.LVE_DATE_FR,
      LVE_DATE_TO: leaves.DETAILS.LVE_DATE_TO,
      LVE_START_ON: leaves.DETAILS.LVE_START_ON,
      LVE_END_ON: leaves.DETAILS.LVE_END_ON,
      LVE_CODE: leaves.DETAILS.LVE_CODE,
      TOTAL_DAYS: leaves.DETAILS.TOTAL_DAYS,
      REASON: leaves.DETAILS.REASON,
      STATUS: leaves.DETAILS.STATUS
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["REMARKS", "POST_REMARKS", "AUTH_REMARKS"].includes(name)) {
      const encoder = new TextEncoder();
      let bytes = encoder.encode(newValue);

      if (bytes.length > 200) {
        newValue = newValue.slice(0, 200); // simple cut
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleReject = async () => {
    try {
      const latestData = formData;

      //console.log("---------Reject request -------", latestData);
      const response = await rejectLRData({
        ...latestData,
        authForm: true,
        flag: "R",
      });

      if (!response?.status) {
        notifyError("Error Occurred!");
        return; // keep modal open so user can retry
      }

      onClose?.();
      notifySuccess("Request rejected successfully");
      onSuccess?.(); // only refetch on actual success
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthorize = async () => {
    try {
      const latestData = formData;
      //console.log("---------Authorize request -------", latestData);
      const response = await authLRData({
        ...latestData,
        authForm: true,
        flag: "A",
      });

      if (!response?.status) {
        notifyError("Error Occurred!");
        return;
      }
      onClose?.();
      notifySuccess("Request authorized successfully");
      onSuccess?.(); // only refetch on actual success
    } catch (err) {
      console.error(err);
      notifyError("Something went wrong");
    }
  };

  const LeaveStartEndArr = {
    B: "Beginning Of The Day",
    M: "Middle Of The Day",
    E: "End Of The Day",
  };

  //console.log("---------****** FormData *********-------------", formData);

  return (
    <>
      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        aria-hidden={!isOpen}
        role="dialog"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h4 className="modal-title">
                  <div>
                    Leave Request for &nbsp;
                    <span className="fw-semibold">
                      {formData.REQUEST_FOR ?? ""}
                    </span>
                    <span
                      className="text-muted ms-2"
                      style={{ fontSize: "14px" }}
                    >
                      ({formData.LVE_DATE_FR || ""} - {formData.LVE_DATE_TO || ""})
                    </span>
                  </div>
                </h4>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close p-0"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              {/* Body */}
              <div className="modal-body">
                
                <div className="row">
                  <SDLFormField label="leave type" value={formData.LVE_CODE} />
                  <SDLFormField label="total days" value={formData.TOTAL_DAYS} />
                </div>
                <div className="row">
                  <SDLFormField label="leave starts on" value={formData.LVE_START_ON} />
                  <SDLFormField label="leave ends on" value={formData.LVE_END_ON} />
                </div>
                <div className="row">
                  <SDLFormField label="reason" value={formData.REASON} />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Auth Remarks:</label>
                      <textarea
                        className="form-control"
                        name="AUTH_REMARKS"
                        value={formData.AUTH_REMARKS || ""}
                        onChange={handleChange}
                      />
                      <div className="char-counter">
                        {getByteLength(formData.AUTH_REMARKS || "")} / 200
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="modal-footer">
                <SDLAuthorizationActionButtons
                  onAuthorize={handleAuthorize}
                  onReject={handleReject}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Outdoor Duty */}
    </>
  );
};

export default LeavesAuthorizationModal;
