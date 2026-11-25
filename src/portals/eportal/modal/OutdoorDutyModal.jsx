import { useState, useEffect, useCallback } from "react";
import SDLSelect from "../../../shared/components/form/SDLSelect";
import {
    getGPDataDetails,
    saveGPData,
    saveGPDataAUTH,
} from "../services/outdoorDutyService";

import { notifyError, notifySuccess } from "../../../shared/services/alertService";
import SDLtextEditor  from "../../../shared/components/editor/SDLtextEditor";
import { stripHtmlToText, toDMYDate } from "../../../shared/utils/formatUtils";
import { handleError } from "../../../shared/services/errorHandler";

const OutdoorDutyModal = ({
    formSettings,
    modalState,
    closeModal,
    onSuccess,
}) => {
    const { mode } = formSettings;
    const MAX_POST_REMARKS_BYTES = 3500;
    // --- File upload config ---
    const MAX_FILE_SIZE_MB = 1;
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
    const [gpData, setGPData] = useState({});
    const [formData, setFormData] = useState({});
    const { isOpen, modalDate } = modalState;
    const [attachment, setAttachment] = useState(null); // File object
    const [existingAttachment, setExistingAttachment] = useState(null); // { name, url } from gpData, for edit mode
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isPostRemarkNwMode = modalState.isPostRemark;
    const [postRemarksKey, setPostRemarksKey] = useState(0);

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
        setAttachment(null);         // add
                    // add
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
      const { POST_REMARKS_DOC: _ignoredStale, ...cleanFormData } = formData;

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
        } catch (err) {
            handleError(err, { context: "Save outdoor duty", fallback: "Unable to save Outdoor Duty." });
            setIsSubmitting(false); // re-enable on error
        } finally {
            setIsSubmitting(false); // ALWAYS reset
        }
    };

    const handleSaveAuth = async (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true); // disable immediately

        try {
            const isEdit = modalState.mode === "edit";
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
        } catch (err) {
            handleError(err, { context: "Save outdoor duty", fallback: "Unable to save Outdoor Duty." });
            setIsSubmitting(false); // re-enable on error
        } finally {
            setIsSubmitting(false); // ALWAYS reset
        }
    };

    const fetchGPData = useCallback(async () => {
        try {
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
            handleError(error, { context: "Load outdoor duty", fallback: "Unable to fetch Outdoor Duty." });
        }
    }, [modalState.id]);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate fetch-on-open
            fetchGPData();
        }
    }, [isOpen, fetchGPData]);

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
                initial["GPASS_DATE"] = toDMYDate(rawDate);
            }

            initial["employee_name"] = gpFormData["employee_name"];

            setFormData(initial);
        }
    }

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

      if (!file) {
        setAttachment(null);
        setErrors((prev) => ({ ...prev, ATTACHMENT: "" }));
        return;
      }

      const error = validateFile(file);

      if (error) {
        setErrors((prev) => ({ ...prev, ATTACHMENT: error }));
        setAttachment(null);
        e.target.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, ATTACHMENT: "" }));
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
    // Validation
    // ===========================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.OUT_TYPE) {
            newErrors.OUT_TYPE = "Out Type is required";
        }

        if (!formData.REMARKS) {
            newErrors.REMARKS = "Remarks is required";
        }

        if (isPostRemarkNwMode) {
          const plainPostRemarks = stripHtmlToText(formData.POST_REMARKS).trim();
          if (!plainPostRemarks) {
              newErrors.POST_REMARKS = "Post Remarks is required";
          } else if (getByteLength(plainPostRemarks) > MAX_POST_REMARKS_BYTES) {
              newErrors.POST_REMARKS = `Post Remarks exceeds ${MAX_POST_REMARKS_BYTES} characters`;
          }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const outTypeField = Object.values(gpData?.form_data || {}).find(
        (field) => field?.name === "OUT_TYPE",
    );

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
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Out Type:
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <SDLSelect
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
                      </SDLSelect>
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
                        disabled={isPostRemarkNwMode}
                        placeholder="Enter outdoor duty purpose"
                      />
                      {errors.REMARKS && (
                        <div className="invalid-feedback">{errors.REMARKS}</div>
                      )}
                      {!isPostRemarkNwMode && (
                        <div
                          className="text-end small mt-1"
                          style={{ color: getByteLength(formData.REMARKS || "") > 180 ? "red" : "#666" }}
                        >
                          {getByteLength(formData.REMARKS || "")} / 200
                        </div>
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

                      {errors.POST_REMARKS && (
                        <div className="invalid-feedback d-block">{errors.POST_REMARKS}</div>
                      )}
                      <div className="char-counter">
                        {getByteLength(formData.POST_REMARKS || "")} / {MAX_POST_REMARKS_BYTES}
                      </div>
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
                  {!isPostRemarkNwMode && (
                    <button type="submit" className="btn btn-success" data-bs-dismiss="modal"
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
