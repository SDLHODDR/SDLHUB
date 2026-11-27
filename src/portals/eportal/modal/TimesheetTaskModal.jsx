import { useRef, useState } from "react";
import SDLReactSelect from "../../../shared/components/form/SDLReactSelect";
import SDLtextEditor from "../../../shared/components/editor/SDLtextEditor";
import { validateFields, validateRequired, validateLength, hasErrors } from "../../../shared/validation";
import { handleError, apiError } from "../../../shared/services/errorHandler";
import { notifySuccess } from "../../../shared/services/alertService";
import { toDMYDate, isoToDate, stripHtmlToText } from "../../../shared/utils/formatUtils";
import { saveTimesheetTask, openTimesheetDocument } from "../services/timesheetService";
import { TS_LIMITS, TS_TASK_STATUS_OPTIONS, TS_DOCUMENT } from "../constants/timesheetConstants";

const EMPTY_TASK = {
  projectId: "",
  categoryId: "",
  title: "",
  description: "",
  taskStatus: "C",
  remarks: "",
  reportTo: "",
};

/* Editor toolbar: font, size, simple formatting and lists (the server keeps only these). */
const EDITOR_TOOLBAR = ["fontName", "fontSize", "separator", "bold", "italic", "underline", "separator", "numberedList", "bulletList"];

/* Visible length of the editor's HTML (what the limits count). */
const textLength = (html) => stripHtmlToText(html).trim().length;

/* Length check for formatted text: "" or the message. */
const htmlMax = (max, label) => (html) => (textLength(html) > max ? `${label} must not exceed ${max} characters.` : "");

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

/* "" when the file can be uploaded, otherwise the reason. */
const checkDocument = (file) => {
  const ext = String(file.name.split(".").pop() || "").toLowerCase();
  if (!TS_DOCUMENT.EXTENSIONS.includes(ext)) return `Only ${TS_DOCUMENT.TYPES_LABEL} files are allowed.`;
  if (file.size > TS_DOCUMENT.MAX_BYTES) return `The file is ${formatSize(file.size)}; the limit is ${TS_DOCUMENT.MAX_LABEL}.`;
  if (file.size === 0) return "The file is empty.";
  return "";
};

/*
 * Add / edit one task of a timesheet day.
 *   date        "YYYY-MM-DD"
 *   task        the task being edited, or null to add
 *   projects    [{ value, label }]
 *   categories  [{ value, label }]
 *   managers    { options: [{ value, label }], defaultCode, deptName }
 *               reporting managers of the employee's department
 */
const TimesheetTaskModal = ({ date, task, projects = [], categories = [], managers = {}, onClose, onSaved }) => {
  const isEdit = Boolean(task?.id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          projectId: task.projectId || "",
          categoryId: task.categoryId,
          title: task.title,
          description: task.description || "",
          taskStatus: task.taskStatus,
          remarks: task.remarks || "",
          reportTo: task.reportTo || managers.defaultCode || "",
        }
      : { ...EMPTY_TASK, reportTo: managers.defaultCode || "" },
  );
  const [chosenFile, setChosenFile] = useState(null); // newly chosen File
  const [removeDocument, setRemoveDocument] = useState(false); // remove the saved one
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const savedDocumentName = isEdit && !removeDocument ? task.documentName : "";

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    const problem = file ? checkDocument(file) : "";
    setErrors((current) => ({ ...current, document: problem }));
    setChosenFile(problem ? null : file);
    if (problem) event.target.value = "";
  };

  const clearChosenFile = () => {
    setChosenFile(null);
    setErrors((current) => ({ ...current, document: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () =>
    validateFields(form, {
      projectId: [validateRequired, { message: "Please select a project." }],
      categoryId: [validateRequired, { message: "Please select a category." }],
      title: [
        [validateRequired, { message: "Please enter the task." }],
        [validateLength, { max: TS_LIMITS.TITLE, label: "Task" }],
      ],
      description: htmlMax(TS_LIMITS.DESCRIPTION, "Description"),
      taskStatus: [validateRequired, { message: "Please select the task status." }],
      reportTo: [validateRequired, { message: "Please select the reporting manager." }],
      remarks: htmlMax(TS_LIMITS.REMARKS, "Remarks"),
    });

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const formErrors = validate();
    setErrors((current) => ({ ...formErrors, document: current.document }));
    if (hasErrors(formErrors)) return;

    try {
      setSaving(true);
      const res = await saveTimesheetTask({
        ...form,
        id: task?.id,
        date,
        document: chosenFile,
        removeDocument: isEdit && removeDocument && !chosenFile,
      });

      if (!res?.status) {
        // Field messages from the server go under the field.
        if (res?.errors) setErrors((current) => ({ ...current, ...res.errors }));
        throw apiError(res, "Unable to save the task.");
      }

      notifySuccess(res.message || "Task saved successfully.");
      onSaved?.();
    } catch (error) {
      // A 400 reply carries field messages in error.data.errors: show them under the fields.
      const fieldErrors = error?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") setErrors((current) => ({ ...current, ...fieldErrors }));
      handleError(error, { context: "Save timesheet task", fallback: "Unable to save the task." });
    } finally {
      setSaving(false);
    }
  };

  const viewSavedDocument = () =>
    openTimesheetDocument(task.id).catch((error) =>
      handleError(error, { context: "Open timesheet document", fallback: "Unable to open the document." }),
    );

  const fieldError = (name) => errors[name] && <div className="invalid-feedback d-block">{errors[name]}</div>;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <h4 className="modal-title">{isEdit ? "Edit Task" : "Add Task"}</h4>
              <span className="text-danger fs-16">({toDMYDate(isoToDate(date))})</span>
            </div>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close">
              <i className="ti ti-x" />
            </button>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div className="modal-body timesheet-task-form">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">
                    Project <span className="text-danger">*</span>
                  </label>
                  <SDLReactSelect
                    value={form.projectId}
                    options={projects}
                    onChange={(value) => setField("projectId", value)}
                    placeholder="Select Project"
                    hasError={Boolean(errors.projectId)}
                  />
                  {fieldError("projectId")}
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <SDLReactSelect
                    value={form.categoryId}
                    options={categories}
                    onChange={(value) => setField("categoryId", value)}
                    placeholder="Select Category"
                    hasError={Boolean(errors.categoryId)}
                  />
                  {fieldError("categoryId")}
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Task Status <span className="text-danger">*</span>
                  </label>
                  <SDLReactSelect
                    value={form.taskStatus}
                    options={TS_TASK_STATUS_OPTIONS}
                    onChange={(value) => setField("taskStatus", value)}
                    isClearable={false}
                    hasError={Boolean(errors.taskStatus)}
                  />
                  {fieldError("taskStatus")}
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Reporting Manager <span className="text-danger">*</span>
                  </label>
                  <SDLReactSelect
                    value={form.reportTo}
                    options={managers.options || []}
                    onChange={(value) => setField("reportTo", value)}
                    placeholder="Search and select the reporting manager"
                    hasError={Boolean(errors.reportTo)}
                  />
                  {fieldError("reportTo")}
                  {!errors.reportTo && managers.deptName && (
                    <small className="d-block mt-1 text-muted">Employees of {managers.deptName}</small>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="ts-title">
                    Task <span className="text-danger">*</span>
                  </label>
                  <input
                    id="ts-title"
                    name="title"
                    type="text"
                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                    value={form.title}
                    maxLength={TS_LIMITS.TITLE}
                    placeholder="What did you work on?"
                    onChange={(e) => setField("title", e.target.value)}
                  />
                  {fieldError("title")}
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <div className={`timesheet-editor timesheet-editor--description ${errors.description ? "is-invalid" : ""}`}>
                    <SDLtextEditor
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Details of the work done (optional)"
                      toolbarConfig={EDITOR_TOOLBAR}
                      containerProps={{ style: { minHeight: 0 } }}
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>{fieldError("description")}</div>
                    <small className="text-muted">{textLength(form.description)}/{TS_LIMITS.DESCRIPTION}</small>
                  </div>
                </div>

                <div className="col-md-7">
                  <label className="form-label">Remarks</label>
                  <div className={`timesheet-editor timesheet-editor--remarks ${errors.remarks ? "is-invalid" : ""}`}>
                    <SDLtextEditor
                      value={form.remarks}
                      onChange={(e) => setField("remarks", e.target.value)}
                      placeholder="Blockers, follow-ups (optional)"
                      toolbarConfig={EDITOR_TOOLBAR}
                      containerProps={{ style: { minHeight: 0 } }}
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>{fieldError("remarks")}</div>
                    <small className="text-muted">{textLength(form.remarks)}/{TS_LIMITS.REMARKS}</small>
                  </div>
                </div>

                <div className="col-md-5">
                  <label className="form-label" htmlFor="ts-document">Upload Document</label>
                  <input
                    id="ts-document"
                    name="document"
                    type="file"
                    ref={fileInputRef}
                    className={`form-control ${errors.document ? "is-invalid" : ""}`}
                    accept={TS_DOCUMENT.EXTENSIONS.map((ext) => `.${ext}`).join(",")}
                    onChange={handleFileChange}
                  />
                  {fieldError("document")}

                  {chosenFile ? (
                    <small className="d-block mt-1 text-muted">
                      {chosenFile.name} ({formatSize(chosenFile.size)}){" "}
                      <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={clearChosenFile}>
                        Clear
                      </button>
                      {savedDocumentName && <span className="d-block">Replaces {savedDocumentName}.</span>}
                    </small>
                  ) : savedDocumentName ? (
                    <small className="d-block mt-1 text-muted">
                      Current:{" "}
                      <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={viewSavedDocument}>
                        {savedDocumentName}
                      </button>{" "}
                      ·{" "}
                      <button type="button" className="btn btn-link btn-sm p-0 align-baseline text-danger" onClick={() => setRemoveDocument(true)}>
                        Remove
                      </button>
                    </small>
                  ) : (
                    <small className="d-block mt-1 text-muted">
                      {isEdit && removeDocument && task.documentName ? `${task.documentName} will be removed. ` : ""}
                      Optional. {TS_DOCUMENT.TYPES_LABEL}, up to {TS_DOCUMENT.MAX_LABEL}.
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Update Task"
                  ) : (
                    "Add Task"
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimesheetTaskModal;
