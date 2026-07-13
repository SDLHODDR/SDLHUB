import { useState, useEffect } from "react";
import {
    getTBRDataDetails,
    saveTBRData,
    saveTBRDataAUTH,
    editTBRData,
    editTBRDataAUTH,
} from "../services/ticketbookingService";
import Swal from "sweetalert2";

const LeavesModal = ({
    formSettings,
    modalState,
    closeModal,
    onSuccess,
}) => {
    const { modalPage, mode, modeLabel, form_header, form_text } = formSettings;

    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [tbData, setTBData] = useState({});
    const [formData, setFormData] = useState({});
    const { isOpen, modalDate } = modalState;
    console.log(
        "===========Outdoor Duty Submitted 123=========",
        formSettings,
        modalState,
    );
    const [errors, setErrors] = useState({});
    const isReadOnly = ["view", "readonly"].includes(mode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = modalState.mode === "edit";
    const isRejectEditMode = mode === "edit-reject";
    const isPostRemarkMode = mode === "postremark";
    const isCreateMode = mode === "create";

    // ===========================
    // Field Controls
    // ===========================
    console.log(
        "===========EnableRemarks=========",
        isCreateMode,
        isEditMode,
        status,
    );

    const enableOutType = isCreateMode || isEditMode || isRejectEditMode;
    const enablePostRemarks =
        (isEditMode && status === "Not send to auth") || isPostRemarkMode;

    useEffect(() => {
        if (isOpen) {
            setIsSubmitting(false); // reset every time modal opens
            //setIsUpdating(false);
        }
    }, [isOpen]);

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

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true); // disable immediately

        try {
            const isEdit = modalState.mode === "edit";
            const payload = {
                ...formData,
                ...(modalState.id && { id: modalState.id }),
                ...(isEdit ? { editTbData: true } : { saveTbData: true }),
            };
            const apiCall = isEdit ? editTBRData : saveTBRData;
            const response = await apiCall(payload);
            if (response?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text:
                        response?.message ||
                        `Ticket Booking Request ${isEdit ? "updated" : "saved"} successfully.`,
                });

                resetForm();
                onSuccess?.();
                closeModal();
            } else {
                setIsSubmitting(false); // re-enable
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text:
                        response?.message ||
                        `Unable to ${isEdit ? "update" : "save"} Ticket Booking Request.`,
                });
            }
            console.log("Submitting:", formData);

            console.log("-------Submitting:-------Payload---", payload);
            setLoading(true);
            console.log("==============Save Response:==========", response);
        } catch (err) {
            console.error("Submit Error:", err);
            setIsSubmitting(false); // re-enable on error
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while saving data.",
            });
        } finally {
            setIsSubmitting(false); // ALWAYS reset
            setLoading(false);
        }
    };

    const handleSaveAuth = async (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true); // disable immediately

        try {
            const isEdit = modalState.mode === "edit";
            const payload = {
                ...formData,
                ...(modalState.id && { id: modalState.id }),
                ...(isEdit ? { editTbData: true } : { saveTbData: true }),
                withAuth:true,
            };
         const apiCall = isEdit ? editTBRDataAUTH : saveTBRDataAUTH;
            const response = await apiCall(payload);
            if (response?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text:
                        response?.message ||
                        `Ticket Booking ${isEdit ? "updated" : "saved"} successfully.`,
                });
                resetForm();
                onSuccess?.();
                closeModal();
            } else {
                setIsSubmitting(false); // re-enable
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text:
                        response?.message ||
                        `Unable to ${isEdit ? "update" : "save"} Ticket Booking.`,
                });
            }
            console.log("Submitting:", formData);

            console.log("-------Submitting:-------Payload---", payload);
            setLoading(true);
            console.log("==============Save Response:==========", response);
        } catch (err) {
            console.error("Submit Error:", err);
            setIsSubmitting(false); // re-enable on error
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while saving data.",
            });
        } finally {
            setIsSubmitting(false); // ALWAYS reset
            setLoading(false);
        }
    };

    // ===========================
    // Fetch Data
    // ===========================
    useEffect(() => {
        if (isOpen) {
            fetchTBData();
        }
    }, [isOpen]);

    const fetchTBData = async () => {
        try {
            setLoading(true);
            const response = await getTBRDataDetails({
                id: modalState.id || null,
                //ID: mid || null,
                ID: modalState.id || null,
                getTbrdata: true,
                ro: undefined,
                //hiddenTaskId: formConfig.taskIdHdn || null
            });
            // Expecting FORM API response (not list)
            setTBData(response || {});
        } catch (error) {
            console.error("Error fetching data:", error);
        } //finally {
        //setLoading(false);
        // }
    };

    

    // Initialize Form
    // ===========================
    useEffect(() => {
        console.log("*********************************************");
        const types = tbData?.var?.type;
        if (!types) return;

        console.log("----------types--------", types);
        console.log("----------tbData--------", tbData);

        const tbFormData = tbData?.formData;
        const tbFormDataHdn = tbData?.hidden;

        console.log("----------tbData--------", tbData);
        console.log("----------tbFormData--------", tbFormData);
        console.log("----------tbFormDataHdn--------", tbFormDataHdn);

        if (!tbFormData) return;
        const initial = {};

        console.log("=========== tbFormData 2222222222=========", tbFormData);
        console.log("=========== tbFormData-Hidden 23333333=========", tbFormDataHdn);

        // Main form fields
        Object.values(tbFormData).forEach((field) => {
            if (field?.name) {
                initial[field.name] = field.value ?? "";
            }
        });

        // Hidden fields
        (tbFormDataHdn || []).forEach((field) => {
            if (field?.name) {
                initial[field.name] = field.value ?? "";
            }
        });

        // Format Date
         const rawDate = initial["TRVL_DATE"] || modalDate;

        if (rawDate) {
            initial["TRVL_DATE"] = formatDate(rawDate);
        }

        // initial["employee_name"] = gpFormData["employee_name"];
        console.log("=========== Initial FormData =========", initial);

        setFormData(initial);
    }, [tbData, modalDate]);

    console.log("=========== Gp Data =========", tbData);
   
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
    const config = tbData?.var || { type: {} };
    console.log("========= COnfig ===========", config);

    // ===========================
    // Handle Change
    // ===========================
    const isValidTime = (time) => {
        const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/;
        return regex.test(time);
    };

    const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

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
    // Format Date
    // ===========================
    const formatDate = (dateVal) => {
        if (!dateVal) return "";

        const date = new Date(dateVal);
        if (isNaN(date)) return "";

        const day = String(date.getDate()).padStart(2, "0");
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
    };

    // ===========================
    // Validation
    // ===========================
    const validateForm = (data) => {
        const newErrors = {};
        
        if (data.TRVL_EMP === "O" && !data.PERSON_NAME?.trim()) {
            newErrors.PERSON_NAME = "Person Name is required";
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

        if (!data.TRVL_FT_NAME?.trim()) {
            newErrors.TRVL_FT_NAME = "Flight/Train Name is required";
        }

        if (arr <= dep) {
            newErrors.TTNT_ARVL_TIME =
                "Arrival time must be greater than Departure time";
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

        console.log("==========New Errors===========", newErrors);

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

     console.log("=========== formData =========", formData);
    if (!isOpen) return null;
    return (
    <>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", }} >
                        {/* <h4 className="modal-title mb-1"> {modeLabel} {form_header} </h4> */}
                        <h4 className="modal-title">
                            {" "}
                            Apply For Ticket Booking{" "}
                        </h4>{" "}
                        <span className="text-danger fs-16">
                            {" "}
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
                       <select
                            className={`select2 form-control ${errors.TRVL_EMP ? "is-invalid" : ""}`}
                            name="TRVL_EMP"
                            id="TRVL_EMP"
                            value={formData.TRVL_EMP || ""}
                            onChange={showEmp}
                        >
                          <option value="">Select</option>
                          {Object.entries(
                            config.type.SELECT?.TRVL_EMP ?.options || {}, ).map(([key, val]) => (
                            <option key={key} value={key}> {val} </option>
                        ))}
                      </select>
                      {errors.TRVL_EMP && (
                        <div className="invalid-feedback">
                          {errors.TRVL_EMP}
                        </div>
                      )}
                    </div>
                    {/* Employee Code (Default when E selected) */}
                    {formData.TRVL_EMP === "E" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Employee Code:</label>
                        <select
                          className={`select2 form-control ${errors.EMP_CODE ? "is-invalid" : ""}`}
                          name="EMP_CODE"
                          id="EMP_CODE"
                          value={formData.EMP_CODE || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          {(
                            config.type.SELECT?.EMP_CODE ?.options || [] ).map((emp, i) => (
                            <option key={i} value={emp.EMP_CODE} >
                              {emp.EMP_CODE} -{" "}
                              {emp.EMP_NAME}
                            </option>
                          ))}
                        </select>
                        {errors.EMP_CODE && (
                          <div className="invalid-feedback">
                            {errors.EMP_CODE}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Person Name (When Other selected) */}
                    {formData.TRVL_EMP === "O" && (
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Person Name:
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.PERSON_NAME ? "is-invalid" : ""}`}
                                name="PERSON_NAME"
                                id="PERSON_NAME"
                                value={
                                    formData.PERSON_NAME || ""
                                }
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
                        <select
                            className={`select2 form-control ${errors.TRVL_MODE ? "is-invalid" : ""}`}
                            name="TRVL_MODE"
                            id="TRVL_MODE"
                            value={formData.TRVL_MODE || ""}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            {Object.entries(
                                config.type.SELECT?.[
                                    "TRVL_MODE"
                                ]?.options || {},
                            ).map(([key, val]) => (
                                <option key={key} value={key}>
                                    {val}
                                </option>
                            ))}
                        </select>
                        {errors.TRVL_MODE && (
                            <div className="invalid-feedback"> {errors.TRVL_MODE} </div>
                        )}
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">
                            Travel className:
                        </label>

                        <select
                            className={`select2 form-control ${errors.TRVL_CLASS ? "is-invalid" : ""}`}
                            name="TRVL_CLASS"
                            id="TRVL_CLASS"
                            value={formData.TRVL_CLASS || ""}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            {(
                                config.type.SELECT?.TRVL_CLASS
                                    ?.options || []
                            ).map((opt, i) => (
                                <option
                                    key={i}
                                    value={opt.TRVL_CLASS}
                                >
                                    {opt.TRVL_CLASS}
                                </option>
                            ))}
                        </select>
                        {errors.TRVL_CLASS && (
                            <div className="invalid-feedback">
                                {errors.TRVL_CLASS}
                            </div>
                        )}
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">
                            Travel From:
                        </label>

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
                        <label className="form-label">
                            Travel To:
                        </label>
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
                        <label className="form-label">
                            Flight / Train Name :
                        </label>
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
                        <label className="form-label">
                            Flight / Train Number:
                        </label>
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
                        <label className="form-label"> Suitable Departure Onwards: </label>
                        <input
                            type="time"
                            className={`form-control ${ errors.TTNT_DEPR_TIME ? "is-invalid" : "" }`}
                            id="TTNT_DEPR_TIME"
                            name="TTNT_DEPR_TIME"
                            value={ formData.TTNT_DEPR_TIME || "" }
                            onChange={handleChange}
                            step="60" // only HH:MM
                        />

                        {errors.TTNT_DEPR_TIME && (
                            <div className="invalid-feedback">
                                {errors.TTNT_DEPR_TIME}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label"> Suitable Arrival Onwards: </label>
                        <input
                            type="time"
                            className={`form-control ${ errors.TTNT_ARVL_TIME ? "is-invalid" : "" }`}
                            id="TTNT_ARVL_TIME"
                            name="TTNT_ARVL_TIME"
                            value={ formData.TTNT_ARVL_TIME || "" }
                            onChange={handleChange}
                            step="60"
                        />

                        {errors.TTNT_ARVL_TIME && (
                            <div className="invalid-feedback">
                                {errors.TTNT_ARVL_TIME}
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
                        {/* Counter */}
                        {/* Counter only when editable */}
                        <div
                            className="text-end small"
                            style={{
                              color: getByteLength( formData.REMARKS || "", ) > 180 ? "red" : "#666",
                            }}
                        >
                            {getByteLength( formData.REMARKS || "", )}{" "}
                            / 200 bytes
                        </div>
                        {errors.REMARKS && (
                            <div className="invalid-feedback"> {errors.REMARKS} </div>
                        )}
                    </div>
                </div>
              </div>
              <input type="hidden" id="TRVL_DATE" name="TRVL_DATE" value={formData.TRVL_DATE || ""} />
                {Object.values(config.type.HIDDEN || {}).map(
                  (field, i) => (
                    <input
                       key={i}
                       type="hidden"
                       name={field.name}
                       value={formData[field.name] || ""}
                    />
                  ),
                )}
              <div className="modal-footer">
                <div className="d-flex gap-2">
                  {mode === "create" && (
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"
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
                  {/* {!isEditMode && ( */}
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" 
                      onClick={handleSaveAuth} 
                      disabled={isSubmitting}
                    >
                      Save and Send for Auth 
                    </button>
                  {/* )} */}
                  
                  <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>
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

export default LeavesModal;