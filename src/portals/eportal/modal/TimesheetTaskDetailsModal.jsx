import { useEffect } from "react";
import Badge from "../../../shared/components/Badge";
import { handleError } from "../../../shared/services/errorHandler";
import { toDMYDate, isoToDate } from "../../../shared/utils/formatUtils";
import { openTimesheetDocument } from "../services/timesheetService";
import { TS_DAY_STATUS_BADGE, TS_TASK_STATUS_BADGE } from "../constants/timesheetConstants";

/* One label / value pair of the details grid. */
const Detail = ({ label, children, wide = false }) => (
  <div className={wide ? "col-12" : "col-md-6"}>
    <div className="timesheet-detail-label">{label}</div>
    <div className="timesheet-detail-value">{children}</div>
  </div>
);

const orDash = (value) => (value ? value : <span className="text-muted">-</span>);

/*
 * Read-only view of one task from the Daily Timesheet Report (opened on row click).
 *   task  a report row (see getTimesheetReport.php)
 */
const TimesheetTaskDetailsModal = ({ task, onClose }) => {
  // Esc closes the popup.
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const viewDocument = () =>
    openTimesheetDocument(task.id).catch((error) =>
      handleError(error, { context: "Open timesheet document", fallback: "Unable to open the document." }),
    );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ts-details-title"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <h4 className="modal-title" id="ts-details-title">Task Details</h4>
              <span className="text-danger fs-16">({toDMYDate(isoToDate(task.date))})</span>
            </div>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close">
              <i className="ti ti-x" />
            </button>
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <Detail label="Employee">
                {task.empName} ({task.empCode})
                {task.isMine && <span className="badge bg-light text-dark ms-1">Me</span>}
              </Detail>
              <Detail label="Reporting Manager">{orDash(task.reportToName)}</Detail>

              <Detail label="Project">{orDash(task.project)}</Detail>
              <Detail label="Category">{task.category}</Detail>
              <Detail label="Task Status">
                <Badge text={task.taskStatusText} className={TS_TASK_STATUS_BADGE[task.taskStatus]} />
              </Detail>

              <Detail label="Task" wide>
                <span className="fw-semibold">{task.title}</span>
              </Detail>

              <Detail label="Description" wide>
                {/* Server-cleaned HTML (only p, br, lists, b/i/u; no attributes) - see tsCleanHtml. */}
                {task.description ? (
                  <div className="timesheet-detail-html" dangerouslySetInnerHTML={{ __html: task.description }} />
                ) : (
                  orDash("")
                )}
              </Detail>

              <Detail label="Remarks" wide>
                {task.remarks ? (
                  <div className="timesheet-detail-html" dangerouslySetInnerHTML={{ __html: task.remarks }} />
                ) : (
                  orDash("")
                )}
              </Detail>

              <Detail label="Document">
                {task.documentName ? (
                  <button type="button" className="btn btn-link btn-sm p-0 text-start timesheet-doc-link" onClick={viewDocument}>
                    <i className="ti ti-paperclip me-1" />
                    {task.documentName}
                  </button>
                ) : (
                  orDash("")
                )}
              </Detail>
              <Detail label="Day Status">
                <Badge text={task.dayStatusText} className={TS_DAY_STATUS_BADGE[task.dayStatus]} />
                {task.dayStatus === "S" && task.submittedOn && (
                  <span className="text-muted ms-2">on {task.submittedOn}</span>
                )}
              </Detail>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetTaskDetailsModal;
