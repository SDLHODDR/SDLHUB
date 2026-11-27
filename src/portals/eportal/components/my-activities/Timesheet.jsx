import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ActivityPageLayout, ActivitySectionHead } from "./common/ActivityLayout";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
import SDLCalendar from "../../../../shared/components/calendar/SDLCalendar";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLActionButtons from "../../../../shared/components/buttons/SDLActionButtons";
import Badge from "../../../../shared/components/Badge";
import EportalPageLoader from "../loader/EportalPageLoader";
import TimesheetTaskModal from "../../modal/TimesheetTaskModal";
import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import { handleError, apiError } from "../../../../shared/services/errorHandler";
import { confirmAction, notifySuccess } from "../../../../shared/services/alertService";
import { toDMYDate, toISODate, isoToDate } from "../../../../shared/utils/formatUtils";
import {
  getTimesheetDay,
  getTimesheetManagers,
  deleteTimesheetTask,
  submitTimesheet,
  openTimesheetDocument,
} from "../../services/timesheetService";
import { TS_DAY_STATUS_BADGE, TS_TASK_STATUS_BADGE } from "../../constants/timesheetConstants";
import "../../assets/css/wideContentPages.css";
import "../../assets/css/timesheet.css";

/*
 * My Activities > Daily Timesheet.
 * Pick a day on the calendar, add the tasks worked on (category, task,
 * status, optional document), then submit the day. A submitted day is read-only.
 */
const Timesheet = () => {
  const location = useLocation();
  const portalHome = `/${getPortalFromPath(location.pathname).key}/dashboard`;

  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [dayData, setDayData] = useState(null); // response of getTimesheetDay
  const [dayLoading, setDayLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState(null); // { task } while the task form is open
  const [busy, setBusy] = useState(false); // delete / submit in progress
  const [managers, setManagers] = useState({ options: [], defaultCode: "", deptName: "" });

  /* ---------------- load the selected day ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setDayLoading(true);
        const res = await getTimesheetDay(selectedDate, { signal: controller.signal });
        if (!res?.status) throw apiError(res, "Unable to load the timesheet.");
        setDayData(res.data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setDayData(null);
        handleError(error, { context: "Load timesheet day", fallback: "Unable to load the timesheet." });
      } finally {
        if (!controller.signal.aborted) setDayLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [selectedDate, reloadKey]);

  /* ---------------- reporting managers (once) ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    getTimesheetManagers({ signal: controller.signal })
      .then((res) => {
        if (!res?.status) throw apiError(res, "Unable to load the reporting managers.");
        setManagers({
          options: res.data?.options || [],
          defaultCode: res.data?.defaultCode || "",
          deptName: res.data?.deptName || "",
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        handleError(error, { context: "Load reporting managers", fallback: "Unable to load the reporting managers." });
      });

    return () => controller.abort();
  }, []);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const tasks = dayData?.tasks || [];
  const editable = Boolean(dayData?.editable); // today, before the cut-off (decided by the server)
  const day = dayData?.day;
  const cutoff = dayData?.cutoff || "6:00 PM";
  const isSubmitted = day?.status === "S";
  // Submitted earlier, then changed: back to Draft and needs submitting again.
  const needsResubmit = day?.status === "D" && Boolean(day?.submittedOn);

  /* ---------------- actions ---------------- */
  const handleDelete = async (task) => {
    const confirmed = await confirmAction("Delete Task", `Delete "${task.title}"?`);
    if (!confirmed) return;

    try {
      setBusy(true);
      const res = await deleteTimesheetTask(task.id);
      if (!res?.status) throw apiError(res, "Unable to delete the task.");
      notifySuccess(res.message || "Task deleted successfully.");
      reload();
    } catch (error) {
      handleError(error, { context: "Delete timesheet task", fallback: "Unable to delete the task." });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitDay = async () => {
    const confirmed = await confirmAction(
      "Submit Timesheet",
      `Submit ${tasks.length} task(s) for ${toDMYDate(isoToDate(selectedDate))}? You can't change it after submitting.`,
      { note: `Note: You can add, change and submit today's tasks only till ${cutoff}. Any change after submitting has to be submitted again.` },
    );
    if (!confirmed) return;

    try {
      setBusy(true);
      const res = await submitTimesheet(selectedDate);
      if (!res?.status) throw apiError(res, "Unable to submit the timesheet.");
      notifySuccess(res.message || "Timesheet submitted successfully.");
      reload();
    } catch (error) {
      handleError(error, { context: "Submit timesheet", fallback: "Unable to submit the timesheet." });
    } finally {
      setBusy(false);
    }
  };

  const handleViewDocument = (task) =>
    openTimesheetDocument(task.id).catch((error) =>
      handleError(error, { context: "Open timesheet document", fallback: "Unable to open the document." }),
    );

  /* ---------------- table ---------------- */
  const columns = [
    {
      header: "#",
      body: (row, options) => options.rowIndex + 1,
      style: { width: "50px" },
    },
    { field: "project", header: "Project", sortable: true, body: (row) => row.project || "-", style: { width: "100px" } },
    { field: "category", header: "Category", sortable: true, style: { width: "130px" } },
    {
      field: "title",
      header: "Task",
      body: (row) => <div className="timesheet-text-cell fw-semibold">{row.title}</div>,
      style: { width: "14%" },
    },
    {
      // Takes the remaining width; one line with "..." and the full text on hover.
      field: "description",
      header: "Description",
      body: (row) =>
        row.descriptionText ? (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip className="timesheet-desc-tooltip">{row.descriptionText}</Tooltip>}
          >
            <div className="timesheet-desc-cell" tabIndex={0}>{row.descriptionText}</div>
          </OverlayTrigger>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      header: "Document",
      body: (row) =>
        row.documentName ? (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-start timesheet-doc-link"
            onClick={() => handleViewDocument(row)}
            title={`Open ${row.documentName}`}
          >
            <i className="ti ti-paperclip me-1" />
            {row.documentName}
          </button>
        ) : (
          <span className="text-muted">-</span>
        ),
      style: { width: "190px" },
    },
    {
      field: "taskStatus",
      header: "Status",
      sortable: true,
      body: (row) => <Badge text={row.taskStatusText} className={TS_TASK_STATUS_BADGE[row.taskStatus]} />,
      style: { width: "120px" },
    },
    ...(editable
      ? [
          {
            header: "Action",
            body: (row) => (
              <SDLActionButtons
                row={row}
                actions={[
                  { key: "edit", label: "Edit task", onClick: (task) => setModal({ task }), disabled: () => busy },
                  { key: "delete", label: "Delete task", onClick: handleDelete, disabled: () => busy },
                ]}
              />
            ),
            style: { width: "110px" },
          },
        ]
      : []),
  ];

  return (
    <div className="timesheet-page">
      {(dayLoading || busy) && <EportalPageLoader />}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Daily Timesheet</h4>
          </div>
        </div>
        <BreadcrumbNav items={[{ text: "Home", link: portalHome }, { text: "Daily Timesheet" }]} />
      </div>

      <ActivityPageLayout
        calendarTitle="Select Date"
        calendarSubtitle="Select a day to fill or view its timesheet"
        calendar={
          <SDLCalendar
            mode="inline"
            value={isoToDate(selectedDate)}
            maxDate={new Date()}
            allowAllDates /* work done on a holiday / weekly off can be logged too */
            openModal={({ modalDate }) => modalDate && setSelectedDate(toISODate(new Date(modalDate)))}
          />
        }
      >
        <ActivitySectionHead
          title={
            <span className="d-flex align-items-center flex-wrap gap-2">
              Timesheet for {toDMYDate(isoToDate(selectedDate))}
              {day && <Badge text={day.statusText} className={TS_DAY_STATUS_BADGE[day.status]} />}
            </span>
          }
          subtitle={
            isSubmitted && day?.submittedOn ? `${tasks.length} task(s) · submitted on ${day.submittedOn}` : `${tasks.length} task(s)`
          }
          actions={
            editable && (
              <div className="d-flex gap-2 flex-wrap">
                <button type="button" className="btn btn-primary" onClick={() => setModal({ task: null })} disabled={busy || dayLoading}>
                  <i className="ti ti-plus me-1" />
                  Add Task
                </button>
                {isSubmitted ? (
                  <button type="button" className="btn btn-success" disabled title="Change a task to submit again">
                    <i className="ti ti-circle-check me-1" />
                    Submitted
                  </button>
                ) : (
                  <button type="button" className="btn btn-success" onClick={handleSubmitDay} disabled={busy || dayLoading || !tasks.length}>
                    <i className="ti ti-send me-1" />
                    {needsResubmit ? "Submit Again" : "Submit Day"}
                  </button>
                )}
              </div>
            )
          }
        />

        {dayData && !editable && dayData.lockReason && (
          <div className="alert alert-info py-2 mb-3">{dayData.lockReason}</div>
        )}
        {editable && needsResubmit && (
          <div className="alert alert-warning py-2 mb-3">
            You changed this timesheet after submitting it. Please submit it again before {cutoff}.
          </div>
        )}
        {editable && !needsResubmit && (
          <div className="text-muted small mb-2">
            <i className="ti ti-clock me-1" />
            You can add, edit and submit today's tasks until {cutoff}
            {isSubmitted ? "; any change will need to be submitted again." : "."}
          </div>
        )}
        {day?.authRemarks && <div className="alert alert-warning py-2 mb-3">Remarks: {day.authRemarks}</div>}

        <SDLDataTable
          data={tasks}
          columns={columns}
          className="eportal-fit-table"
          tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
          scrollable={false}
          emptyMessage={dayLoading ? " " : editable ? 'No tasks yet. Click "Add Task" to log your work.' : "No tasks were logged for this day."}
        />
      </ActivityPageLayout>

      {modal && (
        <TimesheetTaskModal
          date={selectedDate}
          task={modal.task}
          projects={dayData?.projects || []}
          categories={dayData?.categories || []}
          managers={managers}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default Timesheet;
