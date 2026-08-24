import { useEffect, useMemo, useState } from "react";
import {
  authCBRData,
  getConferenceRoomOptions,
  rejectCBRData,
} from "../services/conferenceService";
import { notifyError, notifySuccess } from "../../../services/alertService";

const getByteLength = (value) => new TextEncoder().encode(value || "").length;
const isSelectedFacility = (value) => value === "Y" || value === "1" || value === 1;

const createFormData = (booking = {}) => ({
  ID: booking.TRAN_CODE || booking.ID || "",
  TASK_ID: booking.TASKID || booking.TASK_ID || "",
  TASKID: booking.TASKID || booking.TASK_ID || "",
  TRAN_CODE: booking.TRAN_CODE || booking.ID || "",
  taskIdAuth: booking.taskIdAuth || "",
  empName: booking.empName || "",
  addedon: booking.addedon || "",
  task: booking.task || "",
  REMARKS: booking.reason || booking.REMARKS || "",
  bookByName: booking.bookByName || booking.BOOK_BY_NAME || "",
  book_by_name: booking.book_by_name || booking.BOOK_BY_NAME || "",
  date: booking.date || booking.DT || "",
  room: booking.room || booking.ROOM_LABEL || "",
  room_id: String(booking.room_id || booking.ROOM_ID || ""),
  starttime: booking.starttime || booking.STARTTIME || "",
  endtime: booking.endtime || booking.ENDTIME || "",
  book_time: booking.book_time || booking.BOOK_TIME || "",
  noofattd: booking.noofattd || booking.NOOF_ATTD || "",
  room_facl1: booking.room_facl1 || booking.ROOM_FACL1 || "",
  room_facl2: booking.room_facl2 || booking.ROOM_FACL2 || "",
  room_facl3: booking.room_facl3 || booking.ROOM_FACL3 || "",
  divsn_id: booking.divsn_id || booking.DIVSN_ID || "",
  AUTH_REMARKS: "",
});

const AuthCFRModal = ({ formSettings = {}, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => createFormData(formSettings.taskEmployeeConfig));
  const [roomOptions, setRoomOptions] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const loadRoomOptions = async () => {
      try {
        setLoading(true);
        const response = await getConferenceRoomOptions();
        const options = {};

        (response?.room_options || []).forEach((room) => {
          options[String(room.ID)] = room.ROOM_LABEL;
        });

        setRoomOptions(options);
      } catch (error) {
        console.error("Unable to load conference room options:", error);
        notifyError("Unable to load room list");
      } finally {
        setLoading(false);
      }
    };

    loadRoomOptions();
  }, [isOpen]);

  const roomEntries = useMemo(() => Object.entries(roomOptions), [roomOptions]);
  const bookingMinutes = Number.parseInt(formData.book_time, 10) || 0;
  const bookingHours = Math.floor(bookingMinutes / 60);
  const remainingMinutes = String(bookingMinutes % 60).padStart(2, "0");

  const handleRoomChange = (event) => {
    const roomId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      room_id: roomId,
      room: roomOptions[roomId] || "",
    }));
  };

  const handleRemarksChange = (event) => {
    let remarks = event.target.value;
    while (getByteLength(remarks) > 200) {
      remarks = remarks.slice(0, -1);
    }

    setFormData((previous) => ({ ...previous, AUTH_REMARKS: remarks }));
  };

  const submitAuthorization = async (flag) => {
    try {
      setLoading(true);
      const request = flag === "A" ? authCBRData : rejectCBRData;
      const response = await request({ ...formData, authForm: true, flag });

      if (!response?.status) {
        notifyError(response?.message || "Unable to process conference booking.");
        return;
      }

      notifySuccess(flag === "A" ? "Conference booking authorized." : "Conference booking rejected.");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Conference booking authorization failed:", error);
      notifyError("Unable to process conference booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Conference Booking Authorization</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="text" className="form-control" value={formData.date} disabled />
                </div>
                <div className="col-md-4">
                  <label className="form-label">From Time</label>
                  <select className="form-select" value={formData.starttime} disabled>
                    <option value={formData.starttime}>{formData.starttime || "-"}</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Booking Time</label>
                  <div className="d-flex gap-2">
                    <select className="form-select" value={bookingHours} disabled>
                      <option value={bookingHours}>{bookingHours} Hr</option>
                    </select>
                    <select className="form-select" value={remainingMinutes} disabled>
                      <option value={remainingMinutes}>{remainingMinutes} Min</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Booking By</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.bookByName || formData.book_by_name || ""}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">No of Attendees</label>
                  <input type="number" className="form-control" value={formData.noofattd} disabled />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Division</label>
                  <input type="text" className="form-control" value={formData.divsn_id} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reason</label>
                  <textarea className="form-control" rows="2" value={formData.REMARKS} disabled />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={isSelectedFacility(formData.room_facl1)} disabled readOnly />
                    <label className="form-check-label">Tea / Coffee</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={isSelectedFacility(formData.room_facl2)} disabled readOnly />
                    <label className="form-check-label">Breakfast</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={isSelectedFacility(formData.room_facl3)} disabled readOnly />
                    <label className="form-check-label">Lunch</label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="conference-auth-room">Room</label>
                    <select
                      id="conference-auth-room"
                      className="form-select"
                      value={formData.room_id || ""}
                      onChange={handleRoomChange}
                      disabled={loading}
                    >
                      <option value="">Select Room</option>
                      {roomEntries.map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="conference-auth-room-id">Room Id</label>
                    <select
                      id="conference-auth-room-id"
                      className="form-select"
                      value={formData.room_id || ""}
                      onChange={handleRoomChange}
                      disabled={loading}
                    >
                      <option value="">Select Room Id</option>
                      {roomEntries.map(([id]) => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="conference-auth-remarks">Auth Remarks</label>
                <textarea
                  id="conference-auth-remarks"
                  className="form-control"
                  rows="3"
                  value={formData.AUTH_REMARKS || ""}
                  onChange={handleRemarksChange}
                  disabled={loading}
                />
                <small className="text-muted d-block text-end">
                  {getByteLength(formData.AUTH_REMARKS)} / 200
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => submitAuthorization("A")}
                  disabled={loading}
                >
                 Authorize
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => submitAuthorization("R")}
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default AuthCFRModal;
