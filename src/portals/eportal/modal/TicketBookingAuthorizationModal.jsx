// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
import Swal from "sweetalert2";
import { authTBRData, rejectTBRData } from "../services/ticketbookingService";

const TicketBookingAuthorizationModal = ({
  ticketbooking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const getByteLength = (str) => new TextEncoder().encode(str || "").length;
  const [formData, setFormData] = useState(() => ({
    ID: ticketbooking.TRAN_CODE,
    TASK_ID: ticketbooking.ID,
    TRAN_CODE: ticketbooking.TRAN_CODE,
    CREATED_BY: ticketbooking.CREATED_BY,
    CREATED_ON: ticketbooking.CREATED_ON,
    empName: ticketbooking.REQUEST_FOR,
    TabId: ticketbooking.TASK_ID,
    REMARKS: ticketbooking.REMARKS,
    TRVL_DATE: ticketbooking.TRVL_DATE,
    TRVL_CLASS: ticketbooking.TRVL_CLASS,
    REQUEST_FOR: ticketbooking.REQUEST_FOR,
    TRVL_FROM_LOC: ticketbooking.TRVL_FROM_LOC,
    TRVL_TO_LOC: ticketbooking.TRVL_TO_LOC,
    TRVL_FT_NAME: ticketbooking.TRVL_FT_NAME,
    TRVL_FT_NO: ticketbooking.TRVL_FT_NO,
    TRVL_MODE: ticketbooking.TRVL_MODE,
    TTNT_ARVL_TIME: ticketbooking.TTNT_ARVL_TIME,
    TTNT_DEPR_TIME: ticketbooking.TTNT_DEPR_TIME,
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
      const response = await rejectTBRData({
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
      const response = await authTBRData({
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
                    Ticket Booking Request for &nbsp;
                    <span className="fw-semibold">
                      {formData.empName ?? ""}
                    </span>
                    <span
                      className="text-muted ms-2"
                      style={{ fontSize: "14px" }}
                    >
                      ({formData.TRVL_DATE || ""})
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
                      <label className="fw-semibold">Travel Class :</label>
                      <span className="ms-2">
                        { formData.TRVL_CLASS || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Travel Date :</label>
                      <span className="ms-2">
                        { formData.TRVL_DATE || "" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Travel From :</label>
                      <span className="ms-2">
                        { formData.TRVL_FROM_LOC || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Travel To :</label>
                      <span className="ms-2">
                        { formData.TRVL_TO_LOC || "" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Travel MODE :</label>
                      <span className="ms-2">
                        { formData.TRVL_MODE || "" }
                      </span>
                    </div>
                     
                  </div>
                </div>

                 <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Flight / Train Name :</label>
                      <span className="ms-2">
                        { formData.TRVL_FT_NAME || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Flight / Train Number :</label>
                      <span className="ms-2">
                        { formData.TRVL_FT_NO || "" }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Suitable Departure Onwards :</label>
                      <span className="ms-2">
                        { formData.TTNT_ARVL_TIME || "" }
                      </span>
                    </div>
                     <div className="mb-3">
                      <label className="fw-semibold">Suitable Arrival Onwards :</label>
                      <span className="ms-2">
                        { formData.TTNT_DEPR_TIME || "" }
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

export default TicketBookingAuthorizationModal;
