import { useState, useEffect, useCallback } from "react";
import SDLSelect from "../../../shared/components/form/SDLSelect";
import SDLTimeSelect from "../../../shared/components/form/SDLTimeSelect";
import {
  getTBRDataDetails,
  saveTBRData,
  saveTBRDataAUTH,
  editTBRData,
  editTBRDataAUTH,
} from "../services/ticketbookingService";
import { notifyError, notifySuccess } from "../../../shared/services/alertService";
import SDLReactSelect from "../../../shared/components/form/SDLReactSelect";
import SDLPageLoader from "../../../shared/components/SDLPageLoader"
import { handleError } from "../../../shared/services/errorHandler";
import { toDMYDate } from "../../../shared/utils/formatUtils";
import { validateTime } from "../../../shared/validation";

// BCS_TRVLTKT_REQUEST.PERSON_NAME is VARCHAR2(100 BYTE): non-English letters
// take 2-3 bytes each, so the save-time check counts bytes, not letters.
const PERSON_NAME_MAX_BYTES = 100;

const TicketBookingModal = ({
  formSettings,
  modalState,
  closeModal,
  onSuccess,
}) => {
  const { mode } = formSettings;

  const [loading, setLoading] = useState(true);
  const [tbData, setTBData] = useState({});
  const [formData, setFormData] = useState({});
  const { isOpen, modalDate } = modalState;

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===========================
  // Field Controls
  // ===========================
  // NOTE: "status" isn't defined anywhere in the original code (not in
  // formSettings/modalState/state). Pull it from wherever your API/modal
  // actually stores it. Using tbData?.status as a placeholder here —
  // adjust to match your real data shape.

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
      setPrevIsOpen(isOpen);
      if (isOpen) {
          setIsSubmitting(false);
      }
  }

  const initialFormData = {
    TRVL_EMP: "",
    EMP_CODE: "",
    PERSON_NAME: "",
    TRVL_MODE: "",
    TRVL_CLASS: "",
    TRVL_FROM_LOC: "",
    TRVL_TO_LOC: "",
    TRVL_FT_NAME: "",
    TRVL_FT_NO: "",
    TTNT_DEPR_TIME: "",
    TTNT_ARVL_TIME: "",
    REMARKS: "",
  };

  const initialErrors = {};

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setTBData({});
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSubmitting(true); // disable immediately

    try {
      const isEdit = modalState.mode === "edit";
      const payload = {
        ...formData,
        ...(modalState.id && { id: modalState.id }),
        ...({ ID: modalState.id }), 
        ...(isEdit ? { editTbrData: true } : { saveTbrData: true }),
      };
      const apiCall = isEdit ? editTBRData : saveTBRData;
      const response = await apiCall(payload);
      if (response?.status) {
        notifySuccess(response?.message || "Ticket Booking Request saved successfully.");
        resetForm();
        onSuccess?.();
        closeModal();
      } else {
        setIsSubmitting(false); // re-enable
        notifyError(response?.message || "Unable to save Ticket Booking Request.");
      }
    } catch (err) {
      handleError(err, { context: "Save ticket booking request", fallback: "Unable to save Ticket Booking Request." });
      setIsSubmitting(false); // re-enable on error
    } finally {
      setIsSubmitting(false); // ALWAYS reset
      setLoading(false);
    }
  };

  const handleSaveAuth = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSubmitting(true); // disable immediately

    try {
      const isEdit = modalState.mode === "edit";
      const payload = {
        ...formData,
        ...(modalState.id && { id: modalState.id }),
        ...(isEdit ? { editTbrData: true } : { saveTbrData: true }),
        withAuth: true,
      };
      const apiCall = isEdit ? editTBRDataAUTH : saveTBRDataAUTH;
      const response = await apiCall(payload);
      if (response?.status) {
        notifySuccess(response?.message || "Ticket Booking saved successfully");
        resetForm();
        onSuccess?.();
        closeModal();
      } else {
        setIsSubmitting(false); // re-enable
        notifyError(response?.message || "Unable to save Ticket Booking.");
      }
    } catch (err) {
      handleError(err, { context: "Save ticket booking", fallback: "Unable to save Ticket Booking." });
      setIsSubmitting(false); // re-enable on error
    } finally {
      setIsSubmitting(false); // ALWAYS reset
      setLoading(false);
    }
  };

  // ===========================
  // ===========================

  const fetchTBData = useCallback(async () => {
      try {
        setLoading(true);
        const response = await getTBRDataDetails({
          id: modalState.id || null,
          ID: modalState.id || null,
          getTbrdata: true,
        });

        // The API returns { status, pass: { var: { type: {...} } } }.
        // Unwrap "pass" here so the rest of the component can treat
        // tbData as the object that actually holds "var".
        setTBData(response?.data?.pass || {});
      } catch (error) {
        handleError(error, { context: "Load ticket booking", fallback: "Unable to fetch Ticket Booking." });
      } finally {
        // Without this the loader stayed on top of the form forever.
        setLoading(false);
      }
  }, [modalState.id]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate fetch-on-open; setLoading(true) fires before the await
      fetchTBData();
    }
  }, [isOpen, fetchTBData]);

  const [prevTBData, setPrevTBData] = useState(tbData);
  if (tbData !== prevTBData) {
    setPrevTBData(tbData);

    const tbFormDataHdn = tbData?.hidden;

    const types = tbData?.var?.type;
    if (!types) return;

      const initial = {};

        // Fields are grouped by input type (TEXT, TEXTAREA, SELECT, HIDDEN).
        // Flatten every group into a single { name: value } map.
        Object.values(types).forEach((group) => {
          Object.values(group).forEach((field) => {
            if (field?.name) {
              initial[field.name] = field.value ?? "";
            }
          });
        });

        (tbFormDataHdn || []).forEach((field) => {
                if (field?.name) {
                    initial[field.name] = field.value ?? "";
                }
            });

        // SELECT fields sometimes arrive with the human-readable label as
        // "value" (e.g. "Train") instead of the option key (e.g. "T").
        // Reverse-map label -> key so <select value={...}> actually matches
        // one of the <option value={key}> elements.
        const selectGroup = types.SELECT || {};
        Object.values(selectGroup).forEach((field) => {
            if (!field?.name) return;

            const options = field.options;
            // Only handle the {key: label} shape (TRVL_MODE-style), not the
            // array-of-objects shape (TRVL_CLASS/EMP_CODE-style).
            if (!options || Array.isArray(options)) return;

            const currentVal = initial[field.name];
            if (currentVal && !(currentVal in options)) {
                const matchedKey = Object.entries(options).find(
                    ([, label]) => label === currentVal,
                )?.[0];

                if (matchedKey) {
                    initial[field.name] = matchedKey;
                }
            }
        });

        // Format Date
        const rawDate = initial["TRVL_DATE"] || modalDate;
        if (rawDate) {
          initial["TRVL_DATE"] = toDMYDate(rawDate);
        }

        setFormData(initial);
  }

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

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ===========================
  // Prepare Config
  // ===========================
  // tbData now IS the unwrapped "pass" object, so tbData.var.type holds
  // the TEXT / TEXTAREA / SELECT / HIDDEN groups.
  const config = tbData?.var || { type: {} };


  const showEmp = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      EMP_CODE: "",
      PERSON_NAME: "",
    }));

    // clear related errors
    setErrors((prev) => ({
      ...prev,
      TRVL_EMP: "",
      EMP_CODE: "",
      PERSON_NAME: "",
    }));
  };

  // ===========================
  // Validation
  // ===========================
  /* Both times valid HH:MM and arrival earlier than departure: an overnight
     journey. The backend then stores the arrival on the next day. */
  const isOvernight = (depart, arrive) =>
    !validateTime(depart, { required: true, allow24: true }) &&
    !validateTime(arrive, { required: true, allow24: true }) &&
    arrive < depart;

  const validateForm = (data) => {
    const newErrors = {};

    // Same departure and arrival time is never a valid journey.
    // (Earlier arrival is allowed: it means the next day, see isOvernight.)
    if (
      data.TTNT_DEPR_TIME &&
      data.TTNT_ARVL_TIME &&
      data.TTNT_DEPR_TIME === data.TTNT_ARVL_TIME
    ) {
      newErrors.TTNT_ARVL_TIME = "Arrival time cannot be the same as departure time.";
    }

    if (data.TRVL_EMP === "O" && !data.PERSON_NAME?.trim()) {
      newErrors.PERSON_NAME = "Person Name is required";
    } else if (data.TRVL_EMP === "O" && new TextEncoder().encode(data.PERSON_NAME.trim()).length > PERSON_NAME_MAX_BYTES) {
      newErrors.PERSON_NAME = `Person Name must not exceed ${PERSON_NAME_MAX_BYTES} characters`;
    }

    if (!data.TRVL_MODE?.trim()) {
      newErrors.TRVL_MODE = "Travel Mode is required";
    }

    if (!data.TRVL_FROM_LOC?.trim()) {
      newErrors.TRVL_FROM_LOC = "Travel From Location is required";
    }

    if (!data.TRVL_TO_LOC?.trim()) {
      newErrors.TRVL_TO_LOC = "Travel To Location is required";
    }

    if (!data.TRVL_FT_NAME?.trim() ) {
      newErrors.TRVL_FT_NAME = "Flight/Train Name is required";
    }

    if (!data.TRVL_EMP?.trim()) {
      newErrors.TRVL_EMP = "Employee Name is required";
    }

    if (data.TRVL_EMP === "E" && !data.EMP_CODE?.trim()) {
      newErrors.EMP_CODE = "Employee Name is required";
    }

    if (!data.REMARKS?.trim()) {
      newErrors.REMARKS = "Remarks is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const bookingUserOptions = (config.type.SELECT?.EMP_CODE?.options || []).map(
    (emp) => ({
      value: emp.EMP_CODE,
      label: `${emp.EMP_CODE} - ${emp.EMP_NAME}`,
    }),
  );

  return (
    <>
    {loading && (
        <div className="p-4 text-center">
          <SDLPageLoader />
        </div>
      )}
      {/* Add Outdoor Duty */}
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <h4 className="modal-title">Apply For Ticket Booking</h4>{" "}
                <span className="text-danger fs-16">
                  ({formData.TRVL_DATE || ""})
                </span>
              </div>

              <button
                type="button"
                className="btn-close custom-btn-close p-0"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <form>
              {/* Body */}
              <div className="modal-body">
                {/* ---- First Row -----*/}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label"> Travelling Person: </label>
                    <SDLSelect
                      className={`select2 form-control ${errors.TRVL_EMP ? "is-invalid" : ""}`}
                      name="TRVL_EMP"
                      id="TRVL_EMP"
                      value={formData.TRVL_EMP || ""}
                      onChange={showEmp}
                    >
                      <option value="">Select</option>
                      {Object.entries(
                        config.type.SELECT?.TRVL_EMP?.options || {},
                      ).map(([key, val]) => (
                        <option key={key} value={key}>
                          {" "}
                          {val}{" "}
                        </option>
                      ))}
                    </SDLSelect>
                    {errors.TRVL_EMP && (
                      <div className="invalid-feedback">{errors.TRVL_EMP}</div>
                    )}
                  </div>
                  {/* Employee Code (Default when E selected) */}
                  {formData.TRVL_EMP === "E" && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Employee Code:</label>
                      <SDLReactSelect
                        value={formData.EMP_CODE}
                        options={bookingUserOptions}
                        onChange={(val) => handleChange({ target: { name: "EMP_CODE", value: val } })}
                        hasError={!!errors.EMP_CODE}
                        placeholder="Search Employee..."
                      />
                      {errors.EMP_CODE && (
                        <div className="invalid-feedback d-block">{errors.EMP_CODE}</div>
                      )}
                    
                    </div>
                  )}
                  {/* Person Name (When Other selected) */}
                  {formData.TRVL_EMP === "O" && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Person Name:</label>
                      <input
                        type="text"
                        className={`form-control ${errors.PERSON_NAME ? "is-invalid" : ""}`}
                        name="PERSON_NAME"
                        id="PERSON_NAME"
                        maxLength={PERSON_NAME_MAX_BYTES}
                        value={formData.PERSON_NAME || ""}
                        onChange={handleChange}
                      />
                      {errors.PERSON_NAME && (
                        <div className="invalid-feedback">
                          {errors.PERSON_NAME}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* ---- Second Row -----*/}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label"> Travel Mode: </label>
                    <SDLSelect
                      className={`select2 form-control ${errors.TRVL_MODE ? "is-invalid" : ""}`}
                      name="TRVL_MODE"
                      id="TRVL_MODE"
                      value={formData.TRVL_MODE || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {Object.entries(
                        config.type.SELECT?.["TRVL_MODE"]?.options || {},
                      ).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val}
                        </option>
                      ))}
                    </SDLSelect>
                    {errors.TRVL_MODE && (
                      <div className="invalid-feedback">
                        {" "}
                        {errors.TRVL_MODE}{" "}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Travel Class:</label>

                    <SDLSelect
                      className={`select2 form-control ${errors.TRVL_CLASS ? "is-invalid" : ""}`}
                      name="TRVL_CLASS"
                      id="TRVL_CLASS"
                      value={formData.TRVL_CLASS || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {(config.type.SELECT?.TRVL_CLASS?.options || []).map(
                        (opt, i) => (
                          <option key={i} value={opt.TRVL_CLASS}>
                            {opt.TRVL_CLASS}
                          </option>
                        ),
                      )}
                    </SDLSelect>
                    {errors.TRVL_CLASS && (
                      <div className="invalid-feedback">
                        {errors.TRVL_CLASS}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Travel From:</label>

                    <input
                      type="text"
                      name="TRVL_FROM_LOC"
                      className={`form-control ${errors.TRVL_FROM_LOC ? "is-invalid" : ""}`}
                      id="TRVL_FROM_LOC"
                      value={formData.TRVL_FROM_LOC || ""}
                      onChange={handleChange}
                    />
                    {errors.TRVL_FROM_LOC && (
                      <div className="invalid-feedback">
                        {errors.TRVL_FROM_LOC}
                      </div>
                    )}
                  </div>
                </div>
                {/* ---- Third Row -----*/}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Travel To:</label>
                    <input
                      type="text"
                      name="TRVL_TO_LOC"
                      className={`form-control ${errors.TRVL_TO_LOC ? "is-invalid" : ""}`}
                      id="TRVL_TO_LOC"
                      value={formData.TRVL_TO_LOC || ""}
                      onChange={handleChange}
                    />
                    {errors.TRVL_TO_LOC && (
                      <div className="invalid-feedback">
                        {errors.TRVL_TO_LOC}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Flight / Train Name :</label>
                    <input
                      type="text"
                      className={`form-control ${errors.TRVL_FT_NAME ? "is-invalid" : ""}`}
                      id="TRVL_FT_NAME"
                      name="TRVL_FT_NAME"
                      value={formData.TRVL_FT_NAME || ""}
                      onChange={handleChange}
                    />

                    {errors.TRVL_FT_NAME && (
                      <div className="invalid-feedback">
                        {errors.TRVL_FT_NAME}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Flight / Train Number:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.TRVL_FT_NO ? "is-invalid" : ""}`}
                      id="TRVL_FT_NO"
                      name="TRVL_FT_NO"
                      value={formData.TRVL_FT_NO || ""}
                      onChange={handleChange}
                    />
                    {errors.TRVL_FT_NO && (
                      <div className="invalid-feedback">
                        {errors.TRVL_FT_NO}
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {" "}
                      Suitable Departure Onwards (24 hrs):{" "}
                    </label>
                    <SDLTimeSelect
                      id="TTNT_DEPR_TIME"
                      name="TTNT_DEPR_TIME"
                      value={formData.TTNT_DEPR_TIME || ""}
                      onChange={handleChange}
                      hasError={Boolean(errors.TTNT_DEPR_TIME)}
                    />

                    {errors.TTNT_DEPR_TIME && (
                      <div className="invalid-feedback d-block">
                        {errors.TTNT_DEPR_TIME}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {" "}
                      Suitable Arrival Onwards (24 hrs):{" "}
                    </label>
                    <SDLTimeSelect
                      id="TTNT_ARVL_TIME"
                      name="TTNT_ARVL_TIME"
                      value={formData.TTNT_ARVL_TIME || ""}
                      onChange={handleChange}
                      hasError={Boolean(errors.TTNT_ARVL_TIME)}
                    />

                    {errors.TTNT_ARVL_TIME ? (
                      <div className="invalid-feedback d-block">
                        {errors.TTNT_ARVL_TIME}
                      </div>
                    ) : isOvernight(formData.TTNT_DEPR_TIME, formData.TTNT_ARVL_TIME) && (
                      <div className="form-text text-warning">
                        Arrives the next day (overnight journey).
                      </div>
                    )}
                  </div>
                </div>
                {/* ---- Fourth Row -----*/}
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label"> Remarks: </label>
                    <textarea
                      className={`form-control ${errors.REMARKS ? "is-invalid" : ""}`}
                      id="REMARKS"
                      name="REMARKS"
                      value={formData.REMARKS || ""}
                      onChange={handleChange}
                    />
                    {/* Counter only when editable */}
                    <div
                      className="text-end small"
                      style={{
                        color:
                          getByteLength(formData.REMARKS || "") > 180
                            ? "red"
                            : "#666",
                      }}
                    >
                      {getByteLength(formData.REMARKS || "")} / 200
                    </div>
                    {errors.REMARKS && (
                      <div className="invalid-feedback"> {errors.REMARKS} </div>
                    )}
                  </div>
                </div>
              </div>
              <input
                type="hidden"
                id="TRVL_DATE"
                name="TRVL_DATE"
                value={formData.TRVL_DATE || ""}
              />
              {Object.values(config.type.HIDDEN || {}).map((field, i) => (
                <input
                  key={i}
                  type="hidden"
                  name={field.name}
                  value={formData[field.name] || ""}
                />
              ))}
              <div className="modal-footer">
                <div className="d-flex gap-2">
                  {mode === "create" && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-success"
                    data-bs-dismiss="modal"
                    onClick={handleSaveAuth}
                    disabled={isSubmitting}
                  >
                    Save and Send for Auth
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
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

export default TicketBookingModal;
