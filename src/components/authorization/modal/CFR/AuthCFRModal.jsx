import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import moment from "moment";
import {
  authCBRData,
  rejectCBRData,
  getConferenceRoomOptions
} from "../../../../portals/eportal/services/conferenceService";
import "../modal.css";
import Swal from "sweetalert2";

const AuthCFRModal = ({
    formSettings,
    isOpen,
    onClose
}) => {
    console.log("===========formSettings AuthLRModal========", formSettings);
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

        console.log("ROOM API RESPONSE ====", res);

        const options = {};

        (res?.room_options || []).forEach((item) => {
          options[item.ID] = item.ROOM_LABEL;
        });

        console.log("OPTIONS ====", options);

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
    const getByteLength = (str) =>
      new TextEncoder().encode(str || "").length;

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
        [name]: newValue
      }));
    };

    const handleReject = async () => {
        try {
            const latestData = formData;
            console.log("---------Reject request -------", latestData);
            const response = await rejectCBRData({
                ...latestData,
                authForm: true,
                flag: "R"
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
            console.log("---------Authorize request -------", latestData);
            const response = await authCBRData({
                ...latestData,
                authForm: true,
                flag: "A"
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
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "550px" }} >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              
              <h4 className="modal-title">
                <div>Conference Booking Request for</div>
                <div className="mt-1">
                  <span className="fw-semibold">
                    {formData.bookByName || formData.book_by_name || ""}
                  </span>
                  <span className="text-muted ms-2" style={{ fontSize: "14px" }} >
                    ({formData.date || ""})
                  </span>
                </div>
              </h4>
              {/* <button type="button" className="btn-close" onClick={onClose} ></button> */}
              <button type="button" className="btn-close custom-btn-close p-0" aria-label="Close" onClick={onClose}><i className="ti ti-x"></i></button>
            </div>

            {/* Body */}
            <div className="modal-body py-3">
            {/* ================= MAIN CARD ================= */}
              
                 {/* Row 1 */}
            <div className="row mb-2">
              <div className="col-md-6">
                <span className="fw-semibold text-dark">Room :</span>
                <span className="ms-1">{formData.room || ""}</span>
                
              </div>

              <div className="col-md-6">
                <span className="fw-semibold text-dark">Room Id :</span>
                <span className="ms-1">{formData.room_id || ""}</span>
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

            {/* Row 2 */}
            <div className="row mb-2">
              <div className="col-md-6">
                <span className="fw-semibold text-dark">Start Time :</span>
                <span className="ms-1">{formData.starttime || ""}</span>
              </div>

              <div className="col-md-6">
                <span className="fw-semibold text-dark">End Time :</span>
                <span className="ms-1">{formData.endtime || ""}</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-2">
              <div className="col-md-6">
                <span className="fw-semibold text-dark">Book TIme :</span>
                <span className="ms-1">{formData.book_time || ""}</span>
              </div>

              <div className="col-md-6">
                <span className="fw-semibold text-dark">No of Attendant :</span>
                <span className="ms-1">{formData.noofattd || ""}</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="row mb-2">
              <div className="col-md-6">
                <span className="fw-semibold text-dark">Tea / Coffee :</span>
                <span className="ms-1">
                    {formData.room_facl1 === "1" || formData.room_facl1 === 1 ? "Yes" : "No"}
                </span>
              </div>

              <div className="col-md-6">
                <span className="fw-semibold text-dark">Breakfast : </span>
                <span className="ms-1"> {formData.room_facl2 === "1" || formData.room_facl2 === 1 ? "Yes" : "No"} </span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="row mb-2">
              <div className="col-md-6">
                <span className="fw-semibold text-dark">Lunch :</span>
                <span className="ms-1">{formData.room_facl3 === "1" || formData.room_facl3 === 1 ? "Yes" : "No"}</span>
              </div>

              <div className="col-md-6">
                <span className="fw-semibold text-dark">Division : </span>
                <span className="ms-1"> {formData.divsn_id || ""} </span>
              </div>
            </div>
            <div className="row">
                  {enableAuthRemarks && (
                  <div className="form-group">
                    <label className="form-label">Auth Remarks:</label>
                    <textarea className="form-control" name="AUTH_REMARKS" 
                      value={formData.AUTH_REMARKS || ""}
                      onChange={handleChange}
                    />
                    <div className="char-counter">{getByteLength(formData.AUTH_REMARKS || "")} / 200 bytes</div>
                  </div>
                  )}
                </div>
             
            </div>
            {/* Footer */}
            {/* <div className="modal-footer py-3 justify-content-center">
              {formSettings?.mode === "auth" && (
              <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                <button className="btn btn-success" onClick={() => handleAuthorize()}
                  style={{ minWidth: "120px" }}>
                  Authorize
                </button>
                <button className="btn btn-danger" onClick={() => handleReject()} 
                  style={{ minWidth: "120px" }}>
                  Reject
                </button>
                
              </div>
              )}
            </div> */}

            <div className="modal-footer py-3 justify-content-center">
              {formSettings?.mode === "auth" && (
                <div className="d-flex justify-content-center align-items-center gap-3 mb-3">

                  <button className="btn btn-success"  onClick={() => handleAuthorize()} style={{ minWidth: "120px" }} >
                    Authorize
                  </button>

                  {!hideReject && (
                    <button className="btn btn-danger" onClick={() => handleReject()} style={{ minWidth: "120px" }} >
                      Reject
                    </button>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCFRModal;