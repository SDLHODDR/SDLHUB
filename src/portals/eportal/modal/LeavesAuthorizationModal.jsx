// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
import Swal from "sweetalert2";
import { authLRData, rejectLRData } from "../services/leavesService";

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

      console.log("---------Reject request -------", latestData);
      const response = await rejectLRData({
        ...latestData,
        authForm: true,
        flag: "R",
      });

      if (!response?.status) {
        Swal.fire({ icon: "error", title: "Error Occurred!" }); // note: "danger" isn't a valid SweetAlert2 icon
        return; // keep modal open so user can retry
      }

      onClose?.();
      Swal.fire({ icon: "success", title: "Request rejected successfully" });
      onSuccess?.(); // only refetch on actual success
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthorize = async () => {
    try {
      const latestData = formData;
      console.log("---------Authorize request -------", latestData);
      const response = await authLRData({
        ...latestData,
        authForm: true,
        flag: "A",
      });

      if (!response?.status) {
        Swal.fire({ icon: "error", title: "Error Occurred!" });
        return;
      }
      onClose?.();

      Swal.fire({
        icon: "success",
        title: "Request authorized successfully",
      });
      onSuccess?.(); // only refetch on actual success
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Something went wrong" });
    }
  };

  const LeaveStartEndArr = {
    B: "Beginning Of The Day",
    M: "Middle Of The Day",
    E: "End Of The Day",
  };

  console.log("---------****** FormData *********-------------", formData);

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
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">CREATED BY :</label>
                      <span className="ms-2">
                        { formData.CREATED_BY || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">CREATED ON :</label>
                      <span className="ms-2">
                        { formData.CREATED_ON || "" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Leave Type :</label>
                      <span className="ms-2">
                        { formData.LVE_CODE || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Leave From Date :</label>
                      <span className="ms-2">
                        { formData.LVE_DATE_FR || "" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Leave To Date :</label>
                      <span className="ms-2">
                        { formData.LVE_DATE_TO || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Leave Starts On :</label>
                      <span className="ms-2">
                        { LeaveStartEndArr[formData.LVE_START_ON] || "-" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Leave Ends On :</label>
                      <span className="ms-2">
                        { LeaveStartEndArr[formData.LVE_END_ON] || "-" }
                      </span>
                    </div>
                     
                  </div>
                </div>

                 <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Reason :</label>
                      <span className="ms-2">
                        { formData.REASON || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">TOTAL DAYS :</label>
                      <span className="ms-2">
                        { formData.TOTAL_DAYS || "" }
                      </span>
                    </div>
                  </div>
                </div>

                

                <div className="row">
                  <div className="form-group">
                    <label className="form-label">Auth Remarks:</label>
                    <textarea
                      className="form-control"
                      name="AUTH_REMARKS"
                      value={formData.AUTH_REMARKS || ""}
                      onChange={handleChange}
                    />
                    <div className="char-counter">
                      {getByteLength(formData.AUTH_REMARKS || "")} / 200 bytes
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAuthorize}
                  >
                    Authorize
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReject}
                  >
                    Reject
                  </button>
                </div>
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
