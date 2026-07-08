// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
import Swal from "sweetalert2";
import { authGPData, rejectGPData } from "../services/outdoorDutyService";

const OutdoorDutyAuthorizationModal = ({
  outddorduty,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const OUT_TYPE_LABELS = {
    OI: "In/Out same day",
    OD: "Out for full day",
    FO: "First Half Out",
    SO: "Second Half Out",
    FW: "Field Work",
    TO: "Tour",
    "": "-",
  };

  //const [formData, setFormData] = useState({});

  const getByteLength = (str) => new TextEncoder().encode(str || "").length;

  const [formData, setFormData] = useState(() => ({
    ID: outddorduty.TRAN_CODE,
    TASK_ID: outddorduty.ID,
    TRAN_CODE: outddorduty.TRAN_CODE,
    OUT_TYPE: outddorduty.OUT_TYPE,
    empName: outddorduty.REQUEST_FOR,
    empCode: outddorduty.DETAILS.EMP_CODE,
    TabId: outddorduty.TASK_ID,
    REMARKS: outddorduty.REMARKS,
    GPASS_DATE: outddorduty.GPASS_DATE,
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
      const response = await rejectGPData({
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
      const response = await authGPData({
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
                    OutDoor Duty Request for &nbsp;
                    <span className="fw-semibold">
                      {formData.empName ?? ""}
                    </span>
                    <span
                      className="text-muted ms-2"
                      style={{ fontSize: "14px" }}
                    >
                      ({formData.GPASS_DATE || ""})
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
                      <label className="fw-semibold">Out Type :</label>
                      <span className="ms-2">
                        {OUT_TYPE_LABELS[formData.OUT_TYPE || ""]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Remarks :</label>
                      <span className="ms-2">{formData.REMARKS || ""}</span>
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

export default OutdoorDutyAuthorizationModal;
