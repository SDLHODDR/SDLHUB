import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import moment from "moment";
import {
  authCBRData,
  rejectCBRData,
  getConferenceRoomOptions,
} from "../services/conferenceService";
//import "../modal.css";
import Swal from "sweetalert2";

const AuthCFRModal = ({ formSettings, isOpen, onClose }) => {
  //console.log("===========formSettings AuthLRModal========", formSettings);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [hideReject, setHideReject] = useState(false);
  // =========================
  // ROOM OPTIONS STATE
  // =========================
  const [roomOptions, setRoomOptions] = useState({});

  const mid = formSettings.mid;
  const enableAuthRemarks = formSettings.mode === "auth";
  const authRemarksRef = useRef(null);
  if (!isOpen) return null;

  // ==========================================
  // LOAD ROOM MASTER ON COMPONENT LOAD
  // ==========================================
  useEffect(() => {
    loadRoomOptions();
  }, []);

  const loadRoomOptions = async () => {
    try {
      setLoading(true);

      const res = await getConferenceRoomOptions();

      //console.log("ROOM API RESPONSE ====", res);

      const options = {};

      (res?.room_options || []).forEach((item) => {
        options[item.ID] = item.ROOM_LABEL;
      });

      //console.log("OPTIONS ====", options);

      setRoomOptions(options);
    } catch (error) {
      console.error("Room API Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to load room list",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!formSettings.taskEmployeeConfig) return;

    const initial = {};

    initial.ID = formSettings.taskEmployeeConfig.TRAN_CODE;
    initial.TASK_ID = formSettings.taskEmployeeConfig.TASKID;
    //initial.outtype = formSettings.taskEmployeeConfig.outtype;
    initial.empName = formSettings.taskEmployeeConfig.empName;
    initial.TASKID = formSettings.taskEmployeeConfig.TASKID;
    initial.TRAN_CODE = formSettings.taskEmployeeConfig.TRAN_CODE;
    initial.REMARKS = formSettings.taskEmployeeConfig.reason;
    initial.taskIdAuth = formSettings.taskEmployeeConfig.taskIdAuth;
    initial.addedon = formSettings.taskEmployeeConfig.addedon;
    initial.task = formSettings.taskEmployeeConfig.task;
    //initial.gpDate = formSettings.taskEmployeeConfig.gpDate;

    initial.bookByName = formSettings.taskEmployeeConfig.bookByName;
    initial.room = formSettings.taskEmployeeConfig.room;
    initial.date = formSettings.taskEmployeeConfig.date;
    initial.room_id = formSettings.taskEmployeeConfig.room_id;
    initial.starttime = formSettings.taskEmployeeConfig.starttime;
    initial.endtime = formSettings.taskEmployeeConfig.endtime;
    initial.book_time = formSettings.taskEmployeeConfig.book_time;
    initial.noofattd = formSettings.taskEmployeeConfig.noofattd;
    initial.room_facl1 = formSettings.taskEmployeeConfig.room_facl1;
    initial.room_facl2 = formSettings.taskEmployeeConfig.room_facl2;
    initial.room_facl3 = formSettings.taskEmployeeConfig.room_facl3;
    initial.divsn_id = formSettings.taskEmployeeConfig.divsn_id;
    initial.book_by_name = formSettings.taskEmployeeConfig.book_by_name;

    setFormData(initial);
  }, [formSettings.taskEmployeeConfig]);

  // ===========================
  // Auto Focus
  // ===========================
  useEffect(() => {
    if (enableAuthRemarks && authRemarksRef.current) {
      authRemarksRef.current.focus();
    }
  }, [enableAuthRemarks]);

  // ===========================
  // Handle Change
  // ===========================
  const getByteLength = (str) => new TextEncoder().encode(str || "").length;

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

    // ==========================
    // HIDE REJECT ON ROOM CHANGE
    // ==========================
    if (name === "room_id") {
      setHideReject(!!value);
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
      const response = await rejectCBRData({
        ...latestData,
        authForm: true,
        flag: "R",
      });

      onClose?.();

      if (!response?.status) {
        Swal.fire({
          icon: "danger",
          title: "Error Occured!!!",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
        });
      }
    } catch (err) {
      console.error(err);
    }
    //finally {

    // }
  };

  const handleAuthorize = async () => {
    try {
      const latestData = formData;
      //console.log("---------Authorize request -------", latestData);
      const response = await authCBRData({
        ...latestData,
        authForm: true,
        flag: "A",
      });

      onClose?.();

      if (!response?.status) {
        Swal.fire({
          icon: "danger",
          title: "Error Occured!!!",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
        });
      }
    } catch (err) {
      console.error(err);
    }
    //finally {

    // }
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
                    Conference Booking Request for &nbsp;
                    <span className="fw-semibold">
                      {formData.bookByName || formData.book_by_name || ""}
                    </span>
                    <span
                      className="text-muted ms-2"
                      style={{ fontSize: "14px" }}
                    >
                      ({formData.date || ""})
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
                      <label className="fw-semibold">Room :</label>
                      <span className="ms-2">{formData.room || ""}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Room Id :</label>
                      <span className="ms-2">{formData.room_id || ""}</span>
                      <select
                        className="form-control mt-2"
                        name="room_id"
                        id="ROOM_ID"
                        value={formData.room_id || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Room</option>
                        {Object.entries(roomOptions).map(([key, val]) => (
                          <option key={key} value={key}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Start Time :</label>
                      <span className="ms-2">{formData.starttime || ""}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">End Time :</label>
                      <span className="ms-2">{formData.endtime || ""}</span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Book TIme :</label>
                      <span className="ms-2">{formData.book_time || ""}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">No of Attendant :</label>
                      <span className="ms-2">{formData.noofattd || ""}</span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Tea / Coffee :</label>
                      <span className="ms-2">
                        {formData.room_facl1 === "1" ||
                        formData.room_facl1 === 1
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Breakfast :</label>
                      <span className="ms-2">
                        {formData.room_facl2 === "1" ||
                        formData.room_facl2 === 1
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Lunch :</label>
                      <span className="ms-2">
                        {formData.room_facl3 === "1" ||
                        formData.room_facl3 === 1
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Division :</label>
                      <span className="ms-2">{formData.divsn_id || ""}</span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="form-group mb-3">
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

export default AuthCFRModal;
