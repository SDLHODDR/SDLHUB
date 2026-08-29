import { useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";

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
import SDLCalendar from "../../../components/calendar/SDLCalendar";
import { CONFERENCE_MESSAGES } from "../constants/conferenceMessages";
import { getAuthroizationTaskCount } from "../../../store/eportal/ePortalAuthorizationCountSlice";

/* ============================================================
   DEFAULT FORM DATA
============================================================ */

const DEFAULT_FORM_DATA = {
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
};

/* ============================================================
   COMPONENT
============================================================ */

const ConferenceBookingModal = ({
  booking,
  mode,
  selectedDate,
  onClose,
  refreshTable,
}) => {
  const dispatch = useDispatch();

  const { user } = useContext(AuthContext);

  /* ============================================================
     STATES
  ============================================================ */

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const [initialFormData, setInitialFormData] = useState(DEFAULT_FORM_DATA);

  const [bookingUsers, setBookingUsers] = useState([]);

  const [divisions, setDivisions] = useState([]);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  /* ============================================================
     MODE
  ============================================================ */

  const isAddMode = mode === "add";

  const isPlanned = booking?.STATUS === "N";

  const isOwner = String(booking?.CHG_BY) === String(user?.empcode);

  const readOnly = !isAddMode && (!isPlanned || !isOwner);

  const canCancelBooking = !isAddMode && booking?.STATUS === "T" && isOwner;

  /* ============================================================
     DATE HELPERS
  ============================================================ */

  /*
   * Convert any supported date into:
   *
   * YYYY-MM-DD
   */

  const formatToInputDate = (dateStr) => {
    if (!dateStr) {
      return "";
    }

    /*
     * Already YYYY-MM-DD
     */

    if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    /*
     * Handle DD-MMM-YYYY
     *
     * Example:
     *
     * 29-Aug-2026
     */

    if (
      typeof dateStr === "string" &&
      /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)
    ) {
      const parsed = new Date(dateStr);

      if (!Number.isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();

        const month = String(parsed.getMonth() + 1).padStart(2, "0");

        const day = String(parsed.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }
    }

    /*
     * Generic Date parsing
     */

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Convert YYYY-MM-DD
   * to JavaScript Date
   */

  const parseFormDate = (dateStr) => {
    if (!dateStr) {
      return null;
    }

    const parts = dateStr.split("-").map(Number);

    if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
      return null;
    }

    const [year, month, day] = parts;

    return new Date(year, month - 1, day);
  };

  /*
   * JavaScript Date
   * -> YYYY-MM-DD
   */

  const formatDateForForm = (date) => {
    if (!date) {
      return "";
    }

    const selected = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(selected.getTime())) {
      return "";
    }

    const year = selected.getFullYear();

    const month = String(selected.getMonth() + 1).padStart(2, "0");

    const day = String(selected.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ============================================================
     FETCH DROPDOWN DATA
  ============================================================ */

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await getBookingDropdownData();

        if (res?.status) {
          const { employees = [], divisions = [] } = res.data || {};

          setBookingUsers(Array.isArray(employees) ? employees : []);

          setDivisions(Array.isArray(divisions) ? divisions : []);
        } else {
          setBookingUsers([]);
          setDivisions([]);
        }
      } catch (err) {
        console.error("Dropdown fetch error:", err);

        setBookingUsers([]);
        setDivisions([]);
      }
    };

    fetchDropdownData();
  }, []);

  /* ============================================================
     PREFILL FORM
  ============================================================ */

  useEffect(() => {
    /*
     * ==========================================================
     * EDIT / VIEW EXISTING BOOKING
     * ==========================================================
     */

    if (mode !== "add" && booking) {
      const totalMinutes = parseInt(booking.BOOK_TIME || 0, 10);

      const hours = Math.floor(totalMinutes / 60);

      const minutes = totalMinutes % 60;

      const data = {
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
      };

      setFormData(data);

      setInitialFormData(data);

      setErrors({});

      return;
    }

    /*
     * ==========================================================
     * ADD BOOKING
     * ==========================================================
     *
     * selectedDate comes from the LEFT SIDE SDLCalendar.
     *
     * Example:
     *
     * Calendar click:
     * 29-Aug-2026
     *
     * Modal:
     * Date = 2026-08-29
     *
     */

    if (mode === "add") {
      const calendarDate = formatDateForForm(selectedDate);

      console.log("Conference modal selectedDate:", selectedDate);

      console.log("Conference modal formatted date:", calendarDate);

      const data = {
        ...DEFAULT_FORM_DATA,

        bookingBy: user?.empcode || "",

        date: calendarDate || "",
      };

      setFormData(data);

      setInitialFormData(data);

      setErrors({});
    }
  }, [booking, mode, user, selectedDate]);

  /* ============================================================
     INPUT CHANGE
  ============================================================ */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === "checkbox" ? checked : value;

    /*
     * Attendees validation
     */

    if (name === "attendees") {
      /*
       * Digits only
       */

      newValue = newValue.replace(/\D/g, "");

      /*
       * Maximum 3 digits
       */

      newValue = newValue.slice(0, 3);

      /*
       * Maximum 100
       */

      if (newValue !== "" && Number(newValue) > 100) {
        newValue = "100";
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ============================================================
     BOOKING BY CHANGE
  ============================================================ */

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

  /* ============================================================
     DIVISION CHANGE
  ============================================================ */

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

  /* ============================================================
     BOOKING DATE CHANGE
  ============================================================ */

  const handleDateChange = (selectedDate) => {
    const formattedDate = formatDateForForm(selectedDate);

    setFormData((prev) => ({
      ...prev,
      date: formattedDate,
    }));

    setErrors((prev) => ({
      ...prev,
      date: "",
    }));
  };

  /* ============================================================
     VALIDATE BOOKING TIME
  ============================================================ */

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

  /* ============================================================
     HOURS CHANGE
  ============================================================ */

  const handleHoursChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      hours: value,
    }));

    validateBookingTime(value, formData.minutes);
  };

  /* ============================================================
     MINUTES CHANGE
  ============================================================ */

  const handleMinutesChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      minutes: value,
    }));

    validateBookingTime(formData.hours, value);
  };

  const isPastDate = (dateString) => {
    if (!dateString) return false;

    const selected = parseFormDate(dateString);
    if (!selected) return false;
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    return selected < today;
  };

  /* ============================================================
     FORM VALIDATION
  ============================================================ */

  const validateForm = () => {
    let newErrors = {};

    if (!formData.date) {
      newErrors.date = "Please select booking date";
    } else if (isAddMode && isPastDate(formData.date)) {
      newErrors.date = "Past dates cannot be selected for conference booking";
    }

    if (!formData.fromTime) {
      newErrors.fromTime = "Please select start time";
    }

    if (!formData.bookingBy) {
      newErrors.bookingBy = "Please select employee";
    }

    if (!formData.division) {
      newErrors.division = "Please select division";
    }

    if (!(formData.reason || "").trim()) {
      newErrors.reason = "Reason is required";
    }

    if (formData.attendees < 1) {
      newErrors.attendees = "Minimum 1 attendee required";
    }

    const totalMinutes =
      parseInt(formData.hours || 0) * 60 + parseInt(formData.minutes || 0);

    if (totalMinutes === 0) {
      newErrors.duration = "Booking duration must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     ADD BOOKING
  ============================================================ */

  const handleAddBooking = async (e, sendForApproval = false) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      notifyError(CONFERENCE_MESSAGES.FIX_FORM_ERRORS);

      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        ...formData,

        action: sendForApproval ? "add_and_send" : "add",
      });

      if (res.status) {
        await notifySuccess(
          sendForApproval
            ? CONFERENCE_MESSAGES.SENT_FOR_APPROVAL
            : CONFERENCE_MESSAGES.BOOKING_CREATED,
        );

        await refreshTable();

        onClose();
      } else {
        notifyError(res.message);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          CONFERENCE_MESSAGES.CREATE_BOOKING_FAILED,
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     EDIT BOOKING
  ============================================================ */

  const handleEditBooking = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      notifyError(CONFERENCE_MESSAGES.FIX_FORM_ERRORS);

      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        ...formData,

        action: "edit",
      });

      if (res.status) {
        await notifySuccess(CONFERENCE_MESSAGES.BOOKING_UPDATED);

        await refreshTable();

        onClose();
      } else {
        notifyError(res.message);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          CONFERENCE_MESSAGES.EDIT_FAILED,
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     SEND FOR CONFIRMATION
  ============================================================ */

  const handleSendForConfirmation = async () => {
    const confirmed = await confirmAction(
      CONFERENCE_MESSAGES.CONFIRM_SEND_TITLE,

      CONFERENCE_MESSAGES.CONFIRM_SEND_MESSAGE,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        bookingId: formData.bookingId,

        action: "send_confirmation",
      });

      if (res.status) {
        await notifySuccess(CONFERENCE_MESSAGES.SENT_FOR_APPROVAL);

        dispatch(getAuthroizationTaskCount());

        await refreshTable();

        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError(CONFERENCE_MESSAGES.ACTION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     DELETE BOOKING
  ============================================================ */

  const handleDeleteBooking = async () => {
    const confirmed = await confirmAction(
      CONFERENCE_MESSAGES.CONFIRM_DELETE_TITLE,

      CONFERENCE_MESSAGES.CONFIRM_DELETE_MESSAGE,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        bookingId: formData.bookingId,

        action: "delete",
      });

      if (res.status) {
        await notifySuccess(CONFERENCE_MESSAGES.BOOKING_DELETED);

        await refreshTable();

        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError(CONFERENCE_MESSAGES.DELETE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     CANCEL BOOKING
  ============================================================ */

  const handleCancelBooking = async () => {
    const confirmed = await confirmAction(
      CONFERENCE_MESSAGES.CONFIRM_CANCEL_TITLE,

      CONFERENCE_MESSAGES.CONFIRM_CANCEL_MESSAGE,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const res = await conferenceAction({
        bookingId: formData.bookingId,

        action: "cancel",
      });

      if (res.status) {
        await notifySuccess(CONFERENCE_MESSAGES.BOOKING_CANCELLED);

        await refreshTable();

        onClose();
      } else {
        notifyError(res.message);
      }
    } catch {
      notifyError(CONFERENCE_MESSAGES.CANCEL_FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     BACKDROP CLICK
  ============================================================ */

  const handleBackdropClick = async () => {
    if (loading) {
      return;
    }

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);

    /*
     * Nothing changed
     */

    if (!hasChanges) {
      onClose();

      return;
    }

    /*
     * Confirm discard
     */

    const confirmed = await confirmAction(
      CONFERENCE_MESSAGES.CONFIRM_DISCARD_TITLE,

      CONFERENCE_MESSAGES.CONFIRM_DISCARD_MESSAGE,
    );

    if (confirmed) {
      onClose();
    }
  };

  /* ============================================================
     TIME SLOTS
  ============================================================ */

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

  /* ============================================================
     SELECT OPTIONS
  ============================================================ */

  const bookingUserOptions = bookingUsers.map((emp) => ({
    value: emp.EMP_CODE,

    label: emp.EMP_NAME,
  }));

  const divisionOptions = divisions.map((div) => ({
    value: div.DIVSN_ID,

    label: div.DIVSN_DESC,
  }));

  const selectedBookingUser =
    bookingUserOptions.find(
      (option) => String(option.value) === String(formData.bookingBy),
    ) || null;

  const selectedDivision =
    divisionOptions.find(
      (option) => String(option.value) === String(formData.division),
    ) || null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ========================================================
          MODAL
      ======================================================== */}

      <div
        className="modal fade show"
        style={{
          display: "block",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {isAddMode
                  ? "Add Conference Booking"
                  : "Edit Conference Booking"}
              </h5>

              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={handleBackdropClick}
                disabled={loading}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {/* ==================================================
                BODY
            ================================================== */}

            <div className="modal-body">
              {/* =================================================
                  ROW 1
              ================================================= */}

              <div className="row mb-3">
                {/* DATE */}

                <div className="col-md-4">
                  <label className="form-label">Date</label>

                  <SDLCalendar
                    value={parseFormDate(formData.date)}
                    onChange={handleDateChange}
                    inline={false}
                    disabled={readOnly}
                    minDate={isAddMode ? new Date() : undefined}
                    className={`w-100 ${errors.date ? "p-invalid" : ""}`}
                  />

                  {errors.date && (
                    <div className="invalid-feedback d-block">
                      {errors.date}
                    </div>
                  )}
                </div>

                {/* FROM TIME */}

                <div className="col-md-4">
                  <label className="form-label">From Time</label>

                  <select
                    className={`form-select ${
                      errors.fromTime ? "is-invalid" : ""
                    }`}
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleChange}
                    disabled={readOnly}
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

                {/* BOOKING TIME */}

                <div className="col-md-4">
                  <label className="form-label">Booking Time</label>

                  <div className="d-flex gap-2">
                    {/* HOURS */}

                    <select
                      className="form-select"
                      name="hours"
                      value={formData.hours}
                      onChange={handleHoursChange}
                      disabled={readOnly}
                    >
                      {Array.from(
                        {
                          length: 16,
                        },
                        (_, i) => i,
                      ).map((hr) => (
                        <option key={hr} value={hr}>
                          {hr} Hr
                        </option>
                      ))}
                    </select>

                    {/* MINUTES */}

                    <select
                      className="form-select"
                      name="minutes"
                      value={formData.minutes}
                      onChange={handleMinutesChange}
                      disabled={readOnly}
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

              {/* =================================================
                  ROW 2
              ================================================= */}

              <div className="row mb-3">
                {/* BOOKING BY */}

                <div className="col-md-6">
                  <label className="form-label">Booking By</label>

                  <Select
                    placeholder="Search Employee..."
                    options={bookingUserOptions}
                    value={selectedBookingUser}
                    onChange={handleBookingByChange}
                    isDisabled={readOnly}
                    className={errors.bookingBy ? "is-invalid" : ""}
                  />

                  {errors.bookingBy && (
                    <div className="invalid-feedback d-block">
                      {errors.bookingBy}
                    </div>
                  )}
                </div>

                {/* ATTENDEES */}

                <div className="col-md-6">
                  <label className="form-label">No of Attendees</label>

                  <input
                    type="number"
                    className={`form-control ${
                      errors.attendees ? "is-invalid" : ""
                    }`}
                    name="attendees"
                    value={formData.attendees}
                    min={1}
                    max={100}
                    step={1}
                    disabled={readOnly}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");

                      if (!/^\d+$/.test(pasted)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;

                      if (value.length > 3) {
                        value = value.slice(0, 3);
                      }

                      if (value !== "" && Number(value) > 100) {
                        value = "100";
                      }

                      setFormData((prev) => ({
                        ...prev,
                        attendees: value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        attendees: "",
                      }));
                    }}
                  />

                  {errors.attendees && (
                    <div className="invalid-feedback">{errors.attendees}</div>
                  )}
                </div>
              </div>

              {/* =================================================
                  ROW 3
              ================================================= */}

              <div className="row mb-3">
                {/* DIVISION */}

                <div className="col-md-6">
                  <label className="form-label">Division</label>

                  <Select
                    placeholder="Search Division..."
                    options={divisionOptions}
                    value={selectedDivision}
                    onChange={handleDivisionChange}
                    isDisabled={readOnly}
                  />

                  {errors.division && (
                    <div className="invalid-feedback d-block">
                      {errors.division}
                    </div>
                  )}
                </div>

                {/* REASON */}

                <div className="col-md-6">
                  <label className="form-label">Reason</label>

                  <textarea
                    className={`form-control ${
                      errors.reason ? "is-invalid" : ""
                    }`}
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
                      {formData.reason?.length || 0}
                      /200
                    </small>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FACILITIES
              ================================================= */}

              <div className="row mb-3">
                {/* TEA */}

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

                {/* BREAKFAST */}

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

                {/* LUNCH */}

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

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="modal-footer">
              {/* =================================================
                  ADD MODE
              ================================================= */}

              {isAddMode && (
                <>
                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={(e) => handleAddBooking(e, false)}
                  >
                    {loading ? "Saving..." : "Save Booking"}
                  </button>

                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-success"
                    onClick={(e) => handleAddBooking(e, true)}
                  >
                    {loading ? "Saving..." : "Save & Send for Confirmation"}
                  </button>
                </>
              )}

              {/* =================================================
                  PLANNED + OWNER
              ================================================= */}

              {!isAddMode && isPlanned && isOwner && (
                <>
                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={handleEditBooking}
                  >
                    Update
                  </button>

                  <button
                    disabled={loading}
                    type="button"
                    className="btn btn-info"
                    onClick={handleSendForConfirmation}
                  >
                    Send For Confirmation
                  </button>
                </>
              )}

              {/* =================================================
                  CANCEL BOOKING
              ================================================= */}

              {!isAddMode && !isPlanned && canCancelBooking && (
                <button
                  type="button"
                  disabled={loading}
                  className="btn"
                  style={{
                    backgroundColor: "#FE9F43",

                    color: "#fff",
                  }}
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          BACKDROP
      ======================================================== */}

      <div
        className="modal-backdrop fade show"
        onClick={loading ? undefined : handleBackdropClick}
      />
    </>
  );
};

export default ConferenceBookingModal;
