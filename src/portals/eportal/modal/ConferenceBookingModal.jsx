import { useEffect, useState, useContext } from "react";
import {
  getBookingDropdownData,
  conferenceAction,
} from "../services/conferenceService";
import {
  notifySuccess,
  notifyError,
  confirmAction,
} from "../../../services/alertService";
import AuthContext from "../../../auth/AuthContext";

import Select from "react-select";
import "../assets/css/conferencebookingmodal.css";

const ConferenceBookingModal = ({ booking, mode, onClose, refreshTable }) => {
  const handleBackdropClick = async () => {
    if (loading) return;

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);

    if (!hasChanges) {
      onClose();
      return;
    }

    const confirmed = await confirmAction(
      "Discard changes?",
      "Unsaved changes will be lost.",
    );

    if (confirmed) {
      onClose();
    }
  };

  /* ================= FORMAT DATE FOR INPUT ================= */
  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";

    // If already yyyy-mm-dd
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      return dateStr;
    }

    const date = new Date(dateStr);
    if (isNaN(date)) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ================= DROPDOWN STATES ================= */
  const [bookingUsers, setBookingUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const isAddMode = mode === "add";
  const isPlanned = booking?.STATUS === "N";
  const isOwner = String(booking?.CHG_BY) === String(user?.empcode);

  const readOnly = !isAddMode && (!isPlanned || !isOwner);
  const canCancelBooking = !isAddMode && booking?.STATUS === "T" && isOwner;

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    bookingId: "",
    date: "",
    fromTime: "",
    hours: "0",
    minutes: "00",
    bookingBy: "",
    attendees: 1,
    division: "",
    reason: "",
    tea: false,
    breakfast: false,
    lunch: false,
  });

  /* ================= FETCH DROPDOWN DATA ================= */
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await getBookingDropdownData();
        if (res.status) {
          setBookingUsers(res.employees || []);
          setDivisions(res.divisions || []);
        }
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    };

    fetchDropdownData();
  }, []);

  /* ================= PREFILL FORM WHEN MODAL OPENS ================= */
  useEffect(() => {
    if (mode !== "add" && booking) {
      const totalMinutes = parseInt(booking.BOOK_TIME || 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setFormData({
        bookingId: booking.ID || "",
        date: formatToInputDate(booking.DT),
        fromTime: booking.STARTTIME || "",
        hours: String(hours),
        minutes: minutes === 30 ? "30" : "00",
        bookingBy: booking.BOOK_BY_EMP || "",
        attendees: booking.NOOF_ATTD || 1,
        division: booking.DIVSN_ID || "",
        reason: booking.REMARKS || "",
        tea: booking.ROOM_FACL1 === "Y" || booking.ROOM_FACL1 == 1,
        breakfast: booking.ROOM_FACL2 === "Y" || booking.ROOM_FACL2 == 1,
        lunch: booking.ROOM_FACL3 === "Y" || booking.ROOM_FACL3 == 1,
      });
    } else if (mode === "add") {
      setFormData((prev) => ({
        ...prev,
        bookingBy: user?.empcode || "",
      }));
    }
  }, [booking, mode, user]);

  /* ================= HANDLE INPUT CHANGE ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // remove error for that field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBookingByChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      bookingBy: selected ? selected.value : "",
    }));

    setErrors((prev) => ({
      ...prev,
      bookingBy: "",
    }));
  };

  const handleDivisionChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      division: selected ? selected.value : "",
    }));

    setErrors((prev) => ({
      ...prev,
      division: "",
    }));
  };

  const validateBookingTime = (hours, minutes) => {
    const totalMinutes = Number(hours) * 60 + Number(minutes);

    if (totalMinutes === 0) {
      setErrors((prev) => ({
        ...prev,
        duration: "Booking duration must be greater than 0",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        duration: "",
      }));
    }
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      minutes: value,
    }));

    validateBookingTime(formData.hours, value);
  };

  const handleHoursChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      hours: value,
    }));

    validateBookingTime(value, formData.minutes);
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    let newErrors = {};

    if (!formData.date) newErrors.date = "Please select booking date";

    if (!formData.fromTime) newErrors.fromTime = "Please select start time";

    if (!formData.bookingBy) newErrors.bookingBy = "Please select employee";

    if (!formData.division) newErrors.division = "Please select division";

    if (!(formData.reason || "").trim())
      newErrors.reason = "Reason is required";

    if (formData.attendees < 1)
      newErrors.attendees = "Minimum 1 attendee required";

    const totalMinutes =
      parseInt(formData.hours || 0) * 60 + parseInt(formData.minutes || 0);

    if (totalMinutes === 0)
      newErrors.duration = "Booking duration must be greater than 0";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ================= RESET FORM ================= */

  const handleAddBooking = async (e, sendForApproval = false) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      notifyError("Please fix the form errors before submitting");
      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        ...formData,
        action: sendForApproval ? "add_and_send" : "add",
      });

      if (res.status) {
        const msg = sendForApproval
          ? "Booking created and sent for confirmation"
          : "Conference booking created successfully";

        await notifySuccess(msg);
        await refreshTable();
        //refreshTable();
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create booking",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      notifyError("Please fix the form errors before submitting");
      return;
    }

    try {
      setLoading(true);
      const res = await conferenceAction({
        ...formData,
        action: "edit",
      });

      if (res.status) {
        await notifySuccess("Booking updated successfully");

        await refreshTable();
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Edit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForConfirmation = async () => {
    const confirmed = await confirmAction(
      "Send for Confirmation?",
      "This will send the booking for approval.",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await conferenceAction({
        bookingId: formData.bookingId,
        action: "send_confirmation",
      });

      if (res.status) {
        await notifySuccess("Booking sent for confirmation");

        await refreshTable();
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    const confirmed = await confirmAction(
      "Delete Booking?",
      "This action cannot be undone",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await conferenceAction({
        bookingId: formData.bookingId,
        action: "delete",
      });

      if (res.status) {
        await notifySuccess("Booking deleted successfully");

        await refreshTable();
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = await confirmAction(
      "Cancel Booking?",
      "Do you really want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await conferenceAction({
        bookingId: formData.bookingId,
        action: "cancel",
      });

      if (res.status) {
        await notifySuccess("Conference room booking cancelled");

        await refreshTable();
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError("Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TIME SLOTS ================= */
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  return (
    <>
      {/* ================= MODAL ================= */}
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {isAddMode
                  ? "Add Conference Booking"
                  : "Edit Conference Booking"}
              </h5>

              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              {/* ROW 1 */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    //min={new Date().toISOString().split("T")[0]}
                    min={
                      isAddMode
                        ? new Date().toISOString().split("T")[0]
                        : undefined
                    }
                    className={`form-control ${errors.date ? "is-invalid" : ""}`}
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                  {errors.date && (
                    <div className="invalid-feedback">{errors.date}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">From Time</label>
                  <select
                    className={`form-select ${errors.fromTime ? "is-invalid" : ""}`}
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleChange}
                    isDisabled={readOnly}
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.fromTime && (
                    <div className="invalid-feedback">{errors.fromTime}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Booking Time</label>

                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      name="hours"
                      value={formData.hours}
                      onChange={handleHoursChange}
                      isDisabled={readOnly}
                    >
                      {Array.from({ length: 16 }, (_, i) => i).map((hr) => (
                        <option key={hr} value={hr}>
                          {hr} Hr
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select"
                      name="minutes"
                      value={formData.minutes}
                      onChange={handleMinutesChange}
                      isDisabled={readOnly}
                    >
                      <option value="00">00 Min</option>
                      <option value="30">30 Min</option>
                    </select>
                  </div>

                  {errors.duration && (
                    <div className="invalid-feedback d-block">
                      {errors.duration}
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2 */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Booking By</label>
                  <Select
                    placeholder="Search Employee..."
                    options={bookingUsers.map((emp) => ({
                      value: emp.EMP_CODE,
                      label: `${emp.EMP_CODE} - ${emp.EMP_NAME}`,
                    }))}
                    value={
                      bookingUsers
                        .map((emp) => ({
                          value: emp.EMP_CODE,
                          label: `${emp.EMP_CODE} - ${emp.EMP_NAME}`,
                        }))
                        .find((opt) => opt.value === formData.bookingBy) || null
                    }
                    onChange={handleBookingByChange}
                    isDisabled={readOnly}
                  />

                  {errors.bookingBy && (
                    <div className="invalid-feedback d-block">
                      {errors.bookingBy}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">No of Attendees</label>
                  <input
                    type="number"
                    className={`form-control ${errors.attendees ? "is-invalid" : ""}`}
                    name="attendees"
                    min="1"
                    value={formData.attendees}
                    onChange={handleChange}
                    disabled={readOnly}
                    max={500}
                    step={1}
                  />
                  {errors.attendees && (
                    <div className="invalid-feedback">{errors.attendees}</div>
                  )}
                </div>
              </div>

              {/* ROW 3 */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Division</label>
                  <Select
                    placeholder="Search Division..."
                    options={divisions.map((div) => ({
                      value: div.DIVSN_ID,
                      label: div.DIVSN_DESC,
                    }))}
                    value={
                      divisions
                        .map((div) => ({
                          value: div.DIVSN_ID,
                          label: div.DIVSN_DESC,
                        }))
                        .find((opt) => opt.value === formData.division) || null
                    }
                    onChange={handleDivisionChange}
                    isDisabled={readOnly}
                  />
                  {errors.division && (
                    <div className="invalid-feedback d-block">
                      {errors.division}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Reason</label>

                  <textarea
                    className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                    name="reason"
                    rows="2"
                    maxLength={200}
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={readOnly}
                  />

                  <div className="d-flex justify-content-between">
                    {errors.reason && (
                      <div className="invalid-feedback d-block">
                        {errors.reason}
                      </div>
                    )}
                    <small className="text-muted ms-auto">
                      {formData.reason.length}/200
                    </small>
                  </div>
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="tea"
                      id="tea"
                      checked={formData.tea}
                      onChange={handleChange}
                      disabled={readOnly}
                    />
                    <label className="form-check-label" htmlFor="tea">
                      Tea / Coffee
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="breakfast"
                      id="breakfast"
                      checked={formData.breakfast}
                      onChange={handleChange}
                      disabled={readOnly}
                    />
                    <label className="form-check-label" htmlFor="breakfast">
                      Breakfast
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="lunch"
                      id="lunch"
                      checked={formData.lunch}
                      onChange={handleChange}
                      disabled={readOnly}
                    />
                    <label className="form-check-label" htmlFor="lunch">
                      Lunch
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              {isAddMode && (
                <>
                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => handleAddBooking(e, false)}
                  >
                    Save Booking
                  </button>

                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-success"
                    onClick={(e) => handleAddBooking(e, true)}
                  >
                    Save & Send for Confirmation
                  </button>
                </>
              )}

              {!isAddMode && isPlanned && isOwner && (
                <>
                  <button
                    disabled={loading}
                    className="btn btn-primary"
                    onClick={handleEditBooking}
                  >
                    Update
                  </button>

                  <button
                    disabled={loading}
                    className="btn btn-info"
                    onClick={handleSendForConfirmation}
                  >
                    Send For Confirmation
                  </button>
                </>
              )}

              {!isAddMode && !isPlanned && canCancelBooking && (
                <button
                  className="btn"
                  style={{ backgroundColor: "#FE9F43", color: "#fff" }}
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        onClick={loading ? undefined : handleBackdropClick}
      ></div>
    </>
  );
};

export default ConferenceBookingModal;
