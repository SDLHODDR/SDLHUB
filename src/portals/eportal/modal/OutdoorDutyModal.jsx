import { useState, useEffect, useCallback } from "react";
import {
    getGPDataDetails,
    //getGPSVDataDetails,
    saveGPData,
    saveGPDataAUTH,
    //editGPData,
    //editGPDataAUTH,
} from "../services/outdoorDutyService";

import { notifyError, notifySuccess } from "../../../services/alertService";
import SDLtextEditor  from "../../../components/editor/SDLtextEditor";
import { stripHtmlToText } from "../utils/formatUtils";

const OutdoorDutyModal = ({
    formSettings,
    modalState,
    closeModal,
    onSuccess,
}) => {
    const { mode } = formSettings;
    const MAX_POST_REMARKS_BYTES = 3500;
    // --- File upload config ---
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const ALLOWED_FILE_EXTENSIONS = [
      "pdf", "doc", "docx", "xls", "xlsx",
      "jpg", "jpeg", "png",
      "mp4", "mov", "avi", "mkv",
    ];
    const ALLOWED_FILE_MIME_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];
    //const [date, setDate] = useState(new Date());
    //const [startTime, setStartTime] = useState("");
    //const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [gpData, setGPData] = useState({});
    const [formData, setFormData] = useState({});
    const { isOpen, modalDate } = modalState;
    const [attachment, setAttachment] = useState(null); // File object
    const [fileError, setFileError] = useState("");
    const [existingAttachment, setExistingAttachment] = useState(null); // { name, url } from gpData, for edit mode
    // console.log(
    //     "===========Outdoor Duty Submitted 123=========",
    //     formSettings,
    //     modalState,
    // );
    const [errors, setErrors] = useState({});
    //const isReadOnly = ["view", "readonly"].includes(mode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    //const isEditMode = modalState.mode === "edit";
    //const isRejectEditMode = mode === "edit-reject";
    //const isPostRemarkMode = mode === "postremark";
    //const isCreateMode = mode === "create";
    const isPostRemarkNwMode = modalState.isPostRemark;
    const [postRemarksKey, setPostRemarksKey] = useState(0);

    //const enableOutType = isCreateMode || isEditMode || isRejectEditMode;
    //const enablePostRemarks = (isEditMode && status === "Not send to auth") || isPostRemarkMode;

    // useEffect(() => {
    //     if (isOpen) {
    //         setIsSubmitting(false); // reset every time modal opens
    //         //setIsUpdating(false);
    //     }
    // }, [isOpen]);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setIsSubmitting(false);
        }
    }

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
        setAttachment(null);         // add
        setFileError("");            // add
        setExistingAttachment(null); // add
    };

    const handleCloseModal = () => {
        resetForm();
        closeModal();
    };

    

    const handlePostRemarksChange = (e) => {
      const html = e.target.value;
      const plainText = stripHtmlToText(html);
      const byteLength = getByteLength(plainText);

      if (byteLength > MAX_POST_REMARKS_BYTES) {
        // formData.POST_REMARKS is left untouched (last valid value);
        // bump key to force the editor to remount and re-sync its DOM to that value
        setPostRemarksKey((k) => k + 1);
        setErrors((prev) => ({
          ...prev,
          POST_REMARKS: `Limit of ${MAX_POST_REMARKS_BYTES} characters reached`,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        POST_REMARKS: html,
      }));

      setErrors((prev) => ({
        ...prev,
        POST_REMARKS: "",
      }));
    };

    const buildSubmitPayload = (extraFields = {}) => {
      console.log("[5] buildSubmitPayload — attachment at submit time:", attachment);
      const { POST_REMARKS_DOC: _ignoredStale, ...cleanFormData } = formData;

      // const basePayload = {
      //   ...formData,
      //   POST_REMARKS: stripHtmlToText(formData.POST_REMARKS) ?? "",
      //   ...extraFields,
      // };

      const basePayload = {
        ...cleanFormData,
        POST_REMARKS: stripHtmlToText(formData.POST_REMARKS) ?? "",
        ...extraFields,
      };

      // No file selected and nothing to remove → keep the existing JSON flow
      if (!attachment) {
        return basePayload;
      }

      // File present → switch to multipart
      const fd = new FormData();
      Object.entries(basePayload).forEach(([key, value]) => {
        fd.append(key, value ?? "");
      });
      fd.append("POST_REMARKS_DOC", attachment, attachment.name); // matches PHP $_FILES key
      // console.log("[8] FormData entries check:");
      // for (const [key, value] of fd.entries()) {
      //   console.log(" ", key, "=", value);
      // }
      return fd;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true); // disable immediately

        try {
            let isEditPM = modalState.mode === "edit";
            isEditPM = isPostRemarkNwMode ? isPostRemarkNwMode : isEditPM;
            // const payload = {
            //     ...formData,
            //     POST_REMARKS: stripHtmlToText(formData.POST_REMARKS) ?? "",
            //     ...(isEditPM ? { editGpData: true } : { saveGpData: true }),
            // };
            const payload = buildSubmitPayload(
                isEditPM ? { editGpData: true } : { saveGpData: true }
            );
            const apiCall = saveGPData;
            const response = await apiCall(payload);
            if (response?.status) {
                notifySuccess(response?.message || "Outdoor Duty saved successfully.");
                resetForm();
                onSuccess?.();
                closeModal();
            } else {
                setIsSubmitting(false); // re-enable
                notifyError(response?.message || "Unable to save Outdoor Duty");
            }
            //console.log("Submitting:", formData);
            //console.log("-------Submitting:-------Payload---", payload);
            setLoading(true);
            //console.log("==============Save Response:==========", response);
        } catch (err) {
            console.error("Submit Error:", err);
            setIsSubmitting(false); // re-enable on error
            notifyError("Something went wrong while saving data.");
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
            // const payload = {
            //     ...formData,
            //     POST_REMARKS: stripHtmlToText(formData.POST_REMARKS) ?? "",
            //     ...(isEdit ? { editGpData: true } : { saveGpData: true }),
            //     withAuth: true,
            // };
            const payload = buildSubmitPayload({
                ...(isEdit ? { editGpData: true } : { saveGpData: true }),
                withAuth: true,
            });
            const apiCall = saveGPDataAUTH;
            const response = await apiCall(payload);
            if (response?.status) {
                notifySuccess(response?.message || "Outdoor Duty saved successfully");
                resetForm();
                onSuccess?.();
                closeModal();
            } else {
                setIsSubmitting(false); // re-enable
                notifyError(response?.message || "Unable to save Outdoor Duty.");
            }
            //console.log("Submitting:", formData);
            //console.log("-------Submitting:-------Payload---", payload);
            setLoading(true);
            //console.log("==============Save Response:==========", response);
        } catch (err) {
            console.error("Submit Error:", err);
            setIsSubmitting(false); // re-enable on error
            notifyError("Something went wrong while saving data.");
        } finally {
            setIsSubmitting(false); // ALWAYS reset
            setLoading(false);
        }
    };

    const fetchGPData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getGPDataDetails({
                id: modalState.id || null,
                getGpdata: true,
            });
            if (response.status) {
                setGPData(response.data || {});
            } else {
                notifyError(response?.message || "Unable to fetch Outdoor Duty.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [modalState.id]);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate fetch-on-open; setLoading(true) fires before the await
            fetchGPData();
        }
    }, [isOpen, fetchGPData]);

    // const checkGPData = async (newValue) => {
    //     try {
    //         setLoading(true);
    //         const response = await getGPSVDataDetails({
    //             val: newValue,
    //             id: gpData.ID || null,
    //             emp: gpData.EMP_CODE,
    //             gd: formData.GPASS_DATE,
    //             getValues: true,
    //         });
    //         // Expecting FORM API response (not list)
    //         return response || {};
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //     }
    // };

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
    //console.log("****************** GPData *******************", gpData);
    // Initialize Form
    // ===========================
    const [prevGPData, setPrevGPData] = useState(gpData);
    if (gpData !== prevGPData) {
        setPrevGPData(gpData);

        const gpFormData = gpData?.form_data;
        const gpFormDataHdn = gpData?.hidden;

        if (gpFormData) {
            const initial = {};

            if (gpFormDataHdn?.ATTACHMENT_NAME || gpData?.attachment_url) {
                setExistingAttachment({
                    name: gpFormDataHdn?.ATTACHMENT_NAME || "Attached file",
                    url: gpData?.attachment_url,
                });
            }

            Object.values(gpFormData).forEach((field) => {
                if (field?.name) {
                    initial[field.name] = field.value ?? "";
                }
            });

            (gpFormDataHdn || []).forEach((field) => {
                if (field?.name) {
                    initial[field.name] = field.value ?? "";
                }
            });

            const rawDate = initial["GPASS_DATE"] || modalDate;
            if (rawDate) {
                initial["GPASS_DATE"] = formatDate(rawDate);
            }

            initial["employee_name"] = gpFormData["employee_name"];

            setFormData(initial);
        }
    }
        // useEffect(() => {
        //     const gpFormData = gpData?.form_data;
        //     //const gpFormData = gpData?.formData;
        //     const gpFormDataHdn = gpData?.hidden;

        //     if (!gpFormData) return;
        //     const initial = {};

        //     //console.log("=========== gpFormData =========", gpFormData);
        //     //console.log("=========== gpFormData-Hidden =========", gpFormDataHdn);

        //     // Main form fields
        //     Object.values(gpFormData).forEach((field) => {
        //         if (field?.name) {
        //             initial[field.name] = field.value ?? "";
        //         }
        //     });

        //     // Hidden fields
        //     (gpFormDataHdn || []).forEach((field) => {
        //         if (field?.name) {
        //             initial[field.name] = field.value ?? "";
        //         }
        //     });

        //     // Format Date
        //     const rawDate = initial["GPASS_DATE"] || modalDate;

        //     if (rawDate) {
        //         initial["GPASS_DATE"] = formatDate(rawDate);
        //     }

        //     initial["employee_name"] = gpFormData["employee_name"];
        //     //console.log("=========== Initial FormData =========", initial);

        //     setFormData(initial);
        // }, [gpData, modalDate]);

    //console.log("=========== Gp Data =========", gpData);
    //console.log("=========== formData =========", formData);
    // ===========================
    // Handle Change
    // ===========================
    const getByteLength = (str) => new TextEncoder().encode(str || "").length;

    const getFileExtension = (filename = "") => filename.split(".").pop()?.toLowerCase() || "";
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const validateFile = (file) => {
      if (!file) return "";

      const ext = getFileExtension(file.name);

      if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
        return `Unsupported file type ".${ext}". Allowed: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`;
      }

      // Belt-and-braces: some browsers/OS report empty/odd MIME types for
      // office docs, so we only hard-fail on MIME when it's present AND
      // clearly not in our list AND the extension check already passed above.
      if (file.type && !ALLOWED_FILE_MIME_TYPES.includes(file.type)) {
        // Extension already validated above; don't double-block office files
        // whose MIME type varies by OS. Only block obviously wrong types
        // (e.g. an .exe renamed to .pdf would still fail extension check).
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `File is too large (${formatFileSize(file.size)}). Max allowed is ${MAX_FILE_SIZE_MB} MB.`;
      }

      if (file.size === 0) {
        return "Selected file appears to be empty.";
      }

      return "";
    };

    const handleFileChange = (e) => {
      const file = e.target.files?.[0] || null;
      console.log("========[1] file picked from input:========", file);

      if (!file) {
        setAttachment(null);
        setErrors((prev) => ({ ...prev, ATTACHMENT: "" }));
        return;
      }

      const error = validateFile(file);
      console.log("[2] validateFile result:", error || "no error - valid");

      if (error) {
        setErrors((prev) => ({ ...prev, ATTACHMENT: error }));
        setAttachment(null);
        e.target.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, ATTACHMENT: "" }));
      console.log("[3] setAttachment called with:", file.name);
      setAttachment(file);
      setExistingAttachment(null);
    };

    const handleRemoveFile = () => {
      setAttachment(null);
      setErrors((prev) => ({ ...prev, ATTACHMENT: "" }));
      setExistingAttachment(null);
      const input = document.getElementById("ATTACHMENT");
      if (input) input.value = "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (["REMARKS", "POST_REMARKS", "AUTH_REMARKS"].includes(name)) {
            const encoder = new TextEncoder();
            let bytes = encoder.encode(newValue);

            if (bytes.length > 200) {
                newValue = newValue.slice(0, 200); // simple cut
            }
        } // else if (name  === "OUT_TYPE") {
        //     checkGPData(newValue);
        // }

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

        // if (isPostRemarkNwMode) {
        //     const plainPostRemarks = stripHtmlToText(formData.POST_REMARKS).trim();
        //     if (!plainPostRemarks) {
        //         newErrors.POST_REMARKS = "Post Remarks is required";
        //     } else if (getByteLength(plainPostRemarks) > MAX_POST_REMARKS_BYTES) {
        //         newErrors.POST_REMARKS = `Post Remarks exceeds ${MAX_POST_REMARKS_BYTES} characters`;
        //     }
        // }
        if (isPostRemarkNwMode) {
          const plainPostRemarks = stripHtmlToText(formData.POST_REMARKS).trim();
          if (!plainPostRemarks) {
              newErrors.POST_REMARKS = "Post Remarks is required";
          } else if (getByteLength(plainPostRemarks) > MAX_POST_REMARKS_BYTES) {
              newErrors.POST_REMARKS = `Post Remarks exceeds ${MAX_POST_REMARKS_BYTES} characters`;
          }

          // New: attachment required only when adding Post Remarks
          if (!attachment && !existingAttachment) {
              newErrors.ATTACHMENT = "Attachment is required when adding Post Remarks";
          }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const outTypeField = Object.values(gpData?.form_data || {}).find(
    //const outTypeField = Object.values(gpData?.formData || {}).find(    
        (field) => field?.name === "OUT_TYPE",
    );

    //const enableRemarks = isCreateMode || (isEditMode && config["type"]["GPSTATUS"] === "Not Sent for Auth");

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
        {/* {loading && (
        <div className="p-4 text-center">
          <div className="spinner-border text-warning"></div>
        </div>
      )} */}
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
                        disabled={isPostRemarkNwMode}
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
                        // disabled={formData.REMARKS?.is_readonly}
                        disabled={isPostRemarkNwMode}
                        placeholder="Enter outdoor duty purpose"
                      />
                      {!isPostRemarkNwMode && (
                        <div className="char-counter">{getByteLength(formData.REMARKS || "")} / 200</div>
                      )}
                      {errors.REMARKS && (
                        <div className="invalid-feedback">{errors.REMARKS}</div>
                      )}
                    </div>
                  </div>
                </div>

                {isPostRemarkNwMode && (
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Post Remarks</label>

                      <SDLtextEditor
                        key={postRemarksKey}
                        value={formData.POST_REMARKS || ""}
                        onChange={handlePostRemarksChange}
                        disabled={isSubmitting}
                        placeholder="Enter post remarks"
                      />

                      <div className="char-counter">
                        {getByteLength(formData.POST_REMARKS || "")} / {MAX_POST_REMARKS_BYTES}
                      </div>
                      {errors.POST_REMARKS && (
                        <div className="invalid-feedback d-block">{errors.POST_REMARKS}</div>
                      )}
                    </div>

                    {/* Attachment — required alongside Post Remarks */}
                    <div className="mb-3">
                      <label className="form-label">
                        Attachment
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <input
                        type="file"
                        id="ATTACHMENT"
                        name="ATTACHMENT"
                        className={`form-control ${errors.ATTACHMENT ? "is-invalid" : ""}`}
                        accept={ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />

                      <div className="form-text">
                        Allowed: PDF, DOC/DOCX, XLS/XLSX, JPG/PNG, MP4/MOV/AVI/MKV — max {MAX_FILE_SIZE_MB} MB.
                      </div>

                      {errors.ATTACHMENT && (
                        <div className="invalid-feedback d-block">{errors.ATTACHMENT}</div>
                      )}

                      {attachment && !errors.ATTACHMENT && (
                        <div className="d-flex align-items-center gap-2 mt-2 p-2 border rounded">
                          <i className="ti ti-paperclip" />
                          <span className="text-truncate" style={{ maxWidth: "300px" }}>
                            {attachment.name}
                          </span>
                          <span className="text-muted small">({formatFileSize(attachment.size)})</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={handleRemoveFile}
                            disabled={isSubmitting}
                          >
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      )}

                      {existingAttachment && !attachment && (
                        <div className="d-flex align-items-center gap-2 mt-2 p-2 border rounded bg-light">
                          <i className="ti ti-paperclip" />
                          <a href={existingAttachment.url} target="_blank" rel="noreferrer" className="text-truncate">
                            {existingAttachment.name}
                          </a>
                          <span className="text-muted small ms-auto">(existing)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
                {/* {isPostRemarkNwMode && (
                    <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Post Remarks
                      </label>

                      
                        
                        <SDLtextEditor
                          key={postRemarksKey}
                          value={formData.POST_REMARKS || ""}
                          onChange={handlePostRemarksChange}
                          disabled={isSubmitting}
                          placeholder="Enter post remarks"
                        />
                      
                      <div className="char-counter">{getByteLength(formData.POST_REMARKS || "")} / {MAX_POST_REMARKS_BYTES}</div>
                      {errors.POST_REMARKS && (
                        <div className="invalid-feedback">{errors.POST_REMARKS}</div>
                      )}
                    </div>
                  </div>
                </div>
                )} */}
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
                    <button type="submit" className="btn btn-primary me-2" data-bs-dismiss="modal"
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
                  {!isPostRemarkNwMode && (
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" 
                      onClick={handleSaveAuth} 
                      disabled={isSubmitting}
                    >
                      Save and Send for Auth 
                    </button>
                )}
                  
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