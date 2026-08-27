import { useEffect, useMemo, useState } from "react";

import {
  authCBRData,
  getConferenceRoomAvailability,
  getConferenceRoomOptions,
  rejectCBRData,
} from "../services/conferenceService";

import { notifyError, notifySuccess } from "../../../services/alertService";


const getByteLength = (value) =>
  new TextEncoder().encode(value || "").length;


const isSelectedFacility = (value) =>
  value === "Y" || value === "1" || value === 1;


const createFormData = (booking = {}) => ({
  ID: booking.TRAN_CODE || booking.ID || "",

  TASK_ID:
    booking.TASKID ||
    booking.TASK_ID ||
    "",

  TASKID:
    booking.TASKID ||
    booking.TASK_ID ||
    "",

  TRAN_CODE:
    booking.TRAN_CODE ||
    booking.ID ||
    "",

  taskIdAuth:
    booking.taskIdAuth ||
    "",

  empName:
    booking.empName ||
    "",

  addedon:
    booking.addedon ||
    "",

  task:
    booking.task ||
    "",

  REMARKS:
    booking.reason ||
    booking.REMARKS ||
    "",

  bookByName:
    booking.bookByName ||
    booking.BOOK_BY_NAME ||
    "",

  book_by_name:
    booking.book_by_name ||
    booking.BOOK_BY_NAME ||
    "",

  date:
    booking.date ||
    booking.DT ||
    "",

  room:
    booking.room ||
    booking.ROOM_LABEL ||
    "",

  room_id:
    String(
      booking.room_id ||
      booking.ROOM_ID ||
      ""
    ),

  starttime:
    booking.starttime ||
    booking.STARTTIME ||
    "",

  endtime:
    booking.endtime ||
    booking.ENDTIME ||
    "",

  book_time:
    booking.book_time ||
    booking.BOOK_TIME ||
    "",

  noofattd:
    booking.noofattd ||
    booking.NOOF_ATTD ||
    "",

  room_facl1:
    booking.room_facl1 ||
    booking.ROOM_FACL1 ||
    "",

  room_facl2:
    booking.room_facl2 ||
    booking.ROOM_FACL2 ||
    "",

  room_facl3:
    booking.room_facl3 ||
    booking.ROOM_FACL3 ||
    "",

  divsn_id:
    booking.divsn_id ||
    booking.DIVSN_ID ||
    "",

  AUTH_REMARKS: "",
});


/* ==========================================================
   FORMAT TIME
========================================================== */

const formatTime = (value) => {

  if (!value) {
    return "-";
  }

  /*
   * If already HH:MM
   */
  if (/^\d{1,2}:\d{2}/.test(String(value))) {
    return String(value).substring(0, 5);
  }

  /*
   * Try Date
   */
  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return String(value);
};


/* ==========================================================
   NORMALIZE DATE
========================================================== */

const normalizeDateForApi = (value) => {

  if (!value) {
    return "";
  }

  const stringValue = String(value).trim();

  /*
   * Already DD-MM-YYYY
   */
  if (/^\d{2}-\d{2}-\d{4}$/.test(stringValue)) {
    return stringValue;
  }

  /*
   * YYYY-MM-DD
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {

    const [year, month, day] = stringValue.split("-");

    return `${day}-${month}-${year}`;
  }

  /*
   * Oracle style:
   * 31-AUG-2026
   */

  const match = stringValue.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/
  );

  if (match) {

    const months = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };

    const day = match[1].padStart(2, "0");
    const month = months[match[2].toUpperCase()];
    const year = match[3];

    if (month) {
      return `${day}-${month}-${year}`;
    }
  }

  return stringValue;
};


const AuthCFRModal = ({
  formSettings = {},
  isOpen,
  onClose,
  onSuccess,
}) => {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() =>
    createFormData(
      formSettings.taskEmployeeConfig
    )
  );

  const [roomOptions, setRoomOptions] = useState([]);

  const [loadingRooms, setLoadingRooms] =
    useState(false);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [roomAvailability, setRoomAvailability] =
    useState([]);

  const [selectedRoom, setSelectedRoom] =
    useState(null);

  const [roomError, setRoomError] =
    useState("");


  /* ==========================================================
     RELOAD FORM WHEN MODAL OPENS
  ========================================================== */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    const booking =
      formSettings.taskEmployeeConfig || {};

    setFormData(createFormData(booking));

    setRoomAvailability([]);
    setRoomError("");
    setSelectedRoom(null);

  }, [
    isOpen,
    formSettings.taskEmployeeConfig,
  ]);


  /* ==========================================================
     LOAD ACTIVE ROOMS
  ========================================================== */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    const loadRoomOptions = async () => {

      try {

        setLoadingRooms(true);

        const response =
          await getConferenceRoomOptions();

        if (!response?.status) {

          notifyError(
            response?.message ||
            "Unable to load conference rooms."
          );

          return;
        }

        const rooms =
          Array.isArray(response?.room_options)
            ? response.room_options
            : [];

        /*
         * API already returns STATUS = A.
         *
         * Keep frontend safety check too.
         */

        const activeRooms =
          rooms.filter(
            (room) =>
              String(room.STATUS).toUpperCase() === "A"
          );

        setRoomOptions(activeRooms);

      } catch (error) {

        console.error(
          "Unable to load conference room options:",
          error
        );

        notifyError(
          "Unable to load room list."
        );

      } finally {

        setLoadingRooms(false);
      }
    };


    loadRoomOptions();

  }, [isOpen]);


  /* ==========================================================
     FIND CURRENT ROOM
  ========================================================== */

  useEffect(() => {

    if (!formData.room_id || !roomOptions.length) {
      setSelectedRoom(null);
      return;
    }

    const room =
      roomOptions.find(
        (item) =>
          String(item.ID) ===
          String(formData.room_id)
      );

    setSelectedRoom(room || null);

  }, [
    formData.room_id,
    roomOptions,
  ]);


  /* ==========================================================
     LOAD AVAILABILITY
  ========================================================== */

  const loadRoomAvailability = async (
    roomId
  ) => {

    if (!roomId) {
      setRoomAvailability([]);
      return;
    }

    const bookingDate =
      normalizeDateForApi(formData.date);

    if (!bookingDate) {
      setRoomAvailability([]);
      return;
    }

    try {

      setLoadingAvailability(true);

      setRoomError("");

      const response =
        await getConferenceRoomAvailability({
          roomId,
          date: bookingDate,
          transactionId:
            formData.ID ||
            formData.TRAN_CODE ||
            "",
        });

      if (!response?.status) {

        setRoomAvailability([]);

        setRoomError(
          response?.message ||
          "Unable to check room availability."
        );

        return;
      }

      const bookings =
        Array.isArray(response?.bookings)
          ? response.bookings
          : [];

      setRoomAvailability(bookings);

    } catch (error) {

      console.error(
        "Room availability error:",
        error
      );

      setRoomAvailability([]);

      setRoomError(
        "Unable to check room availability."
      );

    } finally {

      setLoadingAvailability(false);
    }
  };


  /* ==========================================================
     ROOM CHANGE
  ========================================================== */

  const handleRoomChange = async (event) => {

    const roomId =
      event.target.value;

    const room =
      roomOptions.find(
        (item) =>
          String(item.ID) ===
          String(roomId)
      );

    setSelectedRoom(room || null);

    setRoomAvailability([]);

    setRoomError("");

    setFormData((previous) => ({
      ...previous,

      room_id: roomId,

      room:
        room?.ROOM_LABEL ||
        "",
    }));


    if (roomId) {

      await loadRoomAvailability(
        roomId
      );
    }
  };


  /* ==========================================================
     REMARKS
  ========================================================== */

  const handleRemarksChange = (event) => {

    let remarks =
      event.target.value;

    while (
      getByteLength(remarks) > 200
    ) {
      remarks =
        remarks.slice(0, -1);
    }

    setFormData((previous) => ({
      ...previous,
      AUTH_REMARKS: remarks,
    }));
  };


  /* ==========================================================
     CAPACITY CHECK
  ========================================================== */

  const attendeeCount =
    Number.parseInt(
      formData.noofattd,
      10
    ) || 0;

  const roomCapacity =
    Number.parseInt(
      selectedRoom?.ROOM_CAPACITY,
      10
    ) || 0;

  const capacityExceeded =
    Boolean(
      selectedRoom &&
      attendeeCount > roomCapacity
    );


  /* ==========================================================
     TIME CONFLICT CHECK
     
     Backend availability gives us existing bookings.
     This additional frontend check makes the UI immediately
     clear.
  ========================================================== */

  const bookingStart =
    formatTime(formData.starttime);

  const bookingEnd =
    formatTime(formData.endtime);


  const hasRoomBookings =
    roomAvailability.length > 0;


  /* ==========================================================
     SUBMIT AUTHORIZATION
  ========================================================== */

  const submitAuthorization =
    async (flag) => {

      /*
       * Room is mandatory only for authorization.
       *
       * For Reject we don't need to select a room.
       */

      if (flag === "A") {

        if (!formData.room_id) {

          setRoomError(
            "Please select a Conference Room."
          );

          return;
        }


        if (capacityExceeded) {

          setRoomError(
            `Selected room capacity is ${roomCapacity}, but booking is for ${attendeeCount} attendees.`
          );

          return;
        }


        /*
         * If availability has bookings, don't automatically
         * reject here because the backend should ultimately
         * perform the final overlap check.
         *
         * We display the bookings to admin.
         */
      }


      try {

        setLoading(true);

        const request =
          flag === "A"
            ? authCBRData
            : rejectCBRData;

        const response =
          await request({
            ...formData,
            authForm: true,
            flag,
          });


        if (!response?.status) {

          notifyError(
            response?.message ||
            "Unable to process conference booking."
          );

          return;
        }


        notifySuccess(
          flag === "A"
            ? "Conference booking authorized."
            : "Conference booking rejected."
        );

        onSuccess?.();

        onClose?.();

      } catch (error) {

        console.error(
          "Conference booking authorization failed:",
          error
        );

        notifyError(
          "Unable to process conference booking."
        );

      } finally {

        setLoading(false);
      }
    };


  if (!isOpen) {
    return null;
  }


  return (
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
      >

        <div className="modal-dialog modal-dialog-centered modal-lg">

          <div className="modal-content">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="modal-header">

              <h5 className="modal-title fw-bold">
                Conference Booking Authorization
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
              />

            </div>


            {/* ==================================================
                BODY
            ================================================== */}

            <div className="modal-body">


              {/* ==================================================
                  DATE / TIME
              ================================================== */}

              <div className="row mb-3">

                <div className="col-md-4">

                  <label className="form-label">
                    Date
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      formData.date || "-"
                    }
                    disabled
                  />

                </div>


                <div className="col-md-4">

                  <label className="form-label">
                    From Time
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formatTime(
                      formData.starttime
                    )}
                    disabled
                  />

                </div>


                <div className="col-md-4">

                  <label className="form-label">
                    Booking Time
                  </label>

                  <div className="d-flex gap-2">

                    <input
                      type="text"
                      className="form-control"
                      value={`${Math.floor(
                        (Number.parseInt(
                          formData.book_time,
                          10
                        ) || 0) / 60
                      )} Hr`}
                      disabled
                    />

                    <input
                      type="text"
                      className="form-control"
                      value={`${String(
                        (Number.parseInt(
                          formData.book_time,
                          10
                        ) || 0) % 60
                      ).padStart(2, "0")} Min`}
                      disabled
                    />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  BOOKING DETAILS
              ================================================== */}

              <div className="row mb-3">

                <div className="col-md-6">

                  <label className="form-label">
                    Booking By
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      formData.bookByName ||
                      formData.book_by_name ||
                      "-"
                    }
                    disabled
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label">
                    No of Attendees
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    value={
                      formData.noofattd || "-"
                    }
                    disabled
                  />

                </div>

              </div>


              {/* ==================================================
                  DIVISION / REASON
              ================================================== */}

              <div className="row mb-3">

                <div className="col-md-6">

                  <label className="form-label">
                    Division
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      formData.divsn_id || "-"
                    }
                    disabled
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label">
                    Reason
                  </label>

                  <textarea
                    className="form-control"
                    rows="2"
                    value={
                      formData.REMARKS || ""
                    }
                    disabled
                  />

                </div>

              </div>


              {/* ==================================================
                  BOOKING FACILITIES
              ================================================== */}

              <div className="row mb-3">

                <div className="col-md-4">

                  <div className="form-check">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelectedFacility(
                        formData.room_facl1
                      )}
                      disabled
                      readOnly
                    />

                    <label className="form-check-label">
                      Tea / Coffee
                    </label>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="form-check">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelectedFacility(
                        formData.room_facl2
                      )}
                      disabled
                      readOnly
                    />

                    <label className="form-check-label">
                      Breakfast
                    </label>

                  </div>

                </div>


                <div className="col-md-4">

                  <div className="form-check">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelectedFacility(
                        formData.room_facl3
                      )}
                      disabled
                      readOnly
                    />

                    <label className="form-check-label">
                      Lunch
                    </label>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  ROOM
              ================================================== */}

              <div className="mb-3">

                <label
                  className="form-label"
                  htmlFor="conference-auth-room"
                >
                  Room
                  <span className="text-danger">
                    {" "}*
                  </span>
                </label>


                <select
                  id="conference-auth-room"
                  className={`form-select ${
                    roomError
                      ? "is-invalid"
                      : ""
                  }`}
                  value={
                    formData.room_id || ""
                  }
                  onChange={handleRoomChange}
                  disabled={
                    loading ||
                    loadingRooms
                  }
                >

                  <option value="">
                    {loadingRooms
                      ? "Loading rooms..."
                      : "Select Room"}
                  </option>


                  {roomOptions.map(
                    (room) => (

                      <option
                        key={room.ID}
                        value={room.ID}
                      >
                        {room.ROOM_LABEL}
                      </option>

                    )
                  )}

                </select>


                {roomError && (
                  <div className="invalid-feedback">
                    {roomError}
                  </div>
                )}

              </div>


              {/* ==================================================
                  SELECTED ROOM INFORMATION
              ================================================== */}

              {selectedRoom && (

                <div className="border rounded p-3 mb-3 bg-light">

                  <div className="row">

                    {/* CAPACITY */}

                    <div className="col-md-4">

                      <small className="text-muted d-block">
                        Room Capacity
                      </small>

                      <strong
                        className={
                          capacityExceeded
                            ? "text-danger"
                            : ""
                        }
                      >
                        {selectedRoom.ROOM_CAPACITY}
                        {" "}Persons
                      </strong>

                    </div>


                    {/* LOCATION */}

                    <div className="col-md-4">

                      <small className="text-muted d-block">
                        Location
                      </small>

                      <strong>
                        {selectedRoom.ROOM_LOCATION ||
                          "-"}
                      </strong>

                    </div>


                    {/* FACILITIES */}

                    <div className="col-md-4">

                      <small className="text-muted d-block">
                        Room Facilities
                      </small>

                      {selectedRoom.FACILITIES?.length ? (

                        <div className="mt-1">

                          {selectedRoom.FACILITIES.map(
                            (facility, index) => (

                              <span
                                key={`${facility}-${index}`}
                                className="badge bg-secondary me-1 mb-1"
                              >
                                {facility}
                              </span>

                            )
                          )}

                        </div>

                      ) : (
                        <span className="text-muted">
                          No facilities
                        </span>
                      )}

                    </div>

                  </div>


                  {/* CAPACITY WARNING */}

                  {capacityExceeded && (

                    <div className="alert alert-danger py-2 mt-3 mb-0">

                      <strong>
                        Capacity exceeded:
                      </strong>{" "}

                      This room can accommodate only{" "}
                      {roomCapacity} persons, but the
                      booking is for{" "}
                      {attendeeCount} persons.

                    </div>

                  )}

                </div>

              )}


              {/* ==================================================
                  ROOM AVAILABILITY
              ================================================== */}

              {selectedRoom && (

                <div className="mb-3">

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <label className="form-label mb-0 fw-semibold">
                      Room Availability
                    </label>

                    {loadingAvailability && (

                      <span className="text-muted small">

                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        />

                        Checking availability...

                      </span>

                    )}

                  </div>


                  {!loadingAvailability &&
                    roomAvailability.length === 0 && (

                      <div className="alert alert-success py-2 mb-0">

                        <strong>
                          Room available
                        </strong>

                        <div className="small">
                          No other booking found for{" "}
                          {formData.date || "this date"}.
                        </div>

                      </div>

                    )}


                  {!loadingAvailability &&
                    roomAvailability.length > 0 && (

                      <div className="border rounded">

                        <div className="table-responsive">

                          <table className="table table-sm table-bordered mb-0">

                            <thead className="table-light">

                              <tr>

                                <th>
                                  From
                                </th>

                                <th>
                                  To
                                </th>

                                <th>
                                  Attendees
                                </th>

                                <th>
                                  Booking By
                                </th>

                                <th>
                                  Status
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {roomAvailability.map(
                                (booking) => (

                                  <tr
                                    key={booking.ID}
                                  >

                                    <td>
                                      {formatTime(
                                        booking.START_TIME
                                      )}
                                    </td>

                                    <td>
                                      {formatTime(
                                        booking.END_TIME
                                      )}
                                    </td>

                                    <td>
                                      {booking.NOOF_ATTD ||
                                        "-"}
                                    </td>

                                    <td>
                                      {booking.BOOK_BY_EMP ||
                                        "-"}
                                    </td>

                                    <td>
                                      {booking.STATUS ||
                                        "-"}
                                    </td>

                                  </tr>

                                )
                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}

                </div>

              )}


              {/* ==================================================
                  AUTH REMARKS
              ================================================== */}

              <div className="mb-3">

                <label
                  className="form-label"
                  htmlFor="conference-auth-remarks"
                >
                  Auth Remarks
                </label>

                <textarea
                  id="conference-auth-remarks"
                  className="form-control"
                  rows="3"
                  value={
                    formData.AUTH_REMARKS || ""
                  }
                  onChange={handleRemarksChange}
                  disabled={loading}
                />

                <small className="text-muted d-block text-end">
                  {getByteLength(
                    formData.AUTH_REMARKS
                  )}{" "}
                  / 200
                </small>

              </div>

            </div>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="modal-footer">

              <div className="d-flex gap-2">

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    submitAuthorization("A")
                  }
                  disabled={
                    loading ||
                    loadingAvailability ||
                    capacityExceeded
                  }
                >

                  {loading ? (

                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      />

                      Processing...

                    </>

                  ) : (
                    "Authorize"
                  )}

                </button>


                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() =>
                    submitAuthorization("R")
                  }
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