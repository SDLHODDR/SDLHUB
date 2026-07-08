import { useState, useEffect } from "react";
import {
    getGPDataDetails,
    saveGPData,
    saveGPDataAUTH,
    editGPData,
    editGPDataAUTH,
} from "../services/outdoorDutyService";
import Swal from "sweetalert2";

const OutdoorDutyModal = ({
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
    const [gpData, setGPData] = useState({});
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
        OUT_TYPE: "",
        REMARKS: "",
        GPASS_DATE: "",
        employee_name: "",
    };

    const initialErrors = {};

    const resetForm = () => {
        setFormData(initialFormData);
        setErrors(initialErrors);
        setGPData({});
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
                ...(isEdit ? { editGpData: true } : { saveGpData: true }),
            };
            const apiCall = isEdit ? editGPData : saveGPData;
            const response = await apiCall(payload);
            if (response?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text:
                        response?.message ||
                        `Outdoor Duty ${isEdit ? "updated" : "saved"} successfully.`,
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
                        `Unable to ${isEdit ? "update" : "save"} Outdoor Duty.`,
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
                ...(isEdit ? { editGpData: true } : { saveGpData: true }),
                withAuth: true,
            };
            const apiCall = isEdit ? editGPDataAUTH : saveGPDataAUTH;
            const response = await apiCall(payload);
            if (response?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text:
                        response?.message ||
                        `Outdoor Duty ${isEdit ? "updated" : "saved"} successfully.`,
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
                        `Unable to ${isEdit ? "update" : "save"} Outdoor Duty.`,
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
            fetchGPData();
        }
    }, [isOpen]);

    const fetchGPData = async () => {
        try {
            setLoading(true);
            const response = await getGPDataDetails({
                id: modalState.id || null,
                getGpdata: true,
                //hiddenTaskId: formConfig.taskIdHdn || null
            });
            // Expecting FORM API response (not list)
            setGPData(response || {});
        } catch (error) {
            console.error("Error fetching data:", error);
        } //finally {
        //setLoading(false);
        // }
    };

    // Initialize Form
    // ===========================
    useEffect(() => {
        const gpFormData = gpData?.form_data;
        const gpFormDataHdn = gpData?.hidden;

        if (!gpFormData) return;
        const initial = {};

        console.log("=========== gpFormData =========", gpFormData);
        console.log("=========== gpFormData-Hidden =========", gpFormDataHdn);

        // Main form fields
        Object.values(gpFormData).forEach((field) => {
            if (field?.name) {
                initial[field.name] = field.value ?? "";
            }
        });

        // Hidden fields
        (gpFormDataHdn || []).forEach((field) => {
            if (field?.name) {
                initial[field.name] = field.value ?? "";
            }
        });

        // Format Date
        const rawDate = initial["GPASS_DATE"] || modalDate;

        if (rawDate) {
            initial["GPASS_DATE"] = formatDate(rawDate);
        }

        initial["employee_name"] = gpFormData["employee_name"];
        console.log("=========== Initial FormData =========", initial);

        setFormData(initial);
    }, [gpData, modalDate]);

    console.log("=========== Gp Data =========", gpData);
    console.log("=========== formData =========", formData);
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
    const validateForm = () => {
        const newErrors = {};
        // if (!formData.GPASS_DATE) {
        //   newErrors.GPASS_DATE = "GatePass Date is required";
        // }

        if (!formData.OUT_TYPE) {
            newErrors.OUT_TYPE = "Out Type is required";
        }

        if (!formData.REMARKS) {
            newErrors.REMARKS = "Remarks is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const outTypeField = Object.values(gpData?.form_data || {}).find(
        (field) => field?.name === "OUT_TYPE",
    );

    const enableRemarks =
        isCreateMode ||
        (isEditMode && config["type"]["GPSTATUS"] === "Not Sent for Auth");

    // useEffect(() => {
    //   if (formSettings?.mode === "edit" && formSettings?.data) {

    //     const data = formSettings.data;

    //     setFormData((prev) => ({
    //       ...prev,
    //       GPASS_DATE: data.GPASS_DATE || "",
    //       OUT_TYPE: data.OUT_TYPE || "",
    //       REMARKS: data.REMARKS || "",
    //       POST_REMARKS: data.POST_REMARKS || ""
    //     }));
    //   }
    // }, [formSettings]);

    //   console.log("===========Outdoor Duty Rebuild =========", formSettings, formData);
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
                            Apply For Outdoor Duty{" "}
                        </h4>{" "}
                        <span className="text-danger fs-16">
                            {" "}
                            ({formData.GPASS_DATE || ""})
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
                <div className="row">
                  {/* <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <label className="form-label mb-0 me-2">
                        Employee Name
                      </label>
                      : <span className="text-danger ms-1"> {formData.employee_name || ""} </span>
                    </div>
                  </div> */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Out Type:
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <select
                        className={`form-control ${errors.OUT_TYPE ? "is-invalid" : ""}`}
                        name="OUT_TYPE"
                        id="OUT_TYPE"
                        value={formData.OUT_TYPE || ""}
                        onChange={handleChange}
                      >
                         <option value="">Select</option>
                       {Object.entries(outTypeField?.options || {}).map(([key, val]) => (
                          <option key={key} value={key}>
                            {val}
                          </option>
                        ))}
                      </select>
                      {errors.OUT_TYPE && (
                        <div className="invalid-feedback">{errors.OUT_TYPE}</div>
                      )}
                    </div>
                  </div>
                </div>


                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Remarks
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <textarea
                        className={`form-control ${errors.REMARKS ? "is-invalid" : ""}`}
                        name="REMARKS"
                        id="REMARKS"
                        value={formData.REMARKS || ""}
                        onChange={handleChange}
                        disabled={formData.REMARKS?.is_readonly}
                        placeholder="Enter outdoor duty purpose"
                      />
                      <div className="char-counter">{getByteLength(formData.REMARKS || "")} / 200 bytes</div>
                      {errors.REMARKS && (
                        <div className="invalid-feedback">{errors.REMARKS}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <input
                  type="hidden"
                  id="GPASS_DATE" 
                  name="GPASS_DATE" 
                  value={formData.GPASS_DATE || ""}
                />
              {Object.values(gpData.hidden || {}).map((field, i) => (
                <input
                  key={i}
                  type="hidden"
                  name={field.name}
                  value={field.value || ""}
                />
              ))}
              {/* Footer */}
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

export default OutdoorDutyModal;