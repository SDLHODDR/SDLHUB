import { renderLeaveActions } from "./leavesActions";
import { IconWithTooltip } from "../tooltipHelper";

export const leavesColumns = (handlers) => [
  {
    field: "LVE_CODE",
    header: "Leave Type",
    sortable: true,
  },
  {
    field: "LVE_DATE_FR",
    header: "From Dt.",
    sortable: true,
  },
  {
    field: "LVE_DATE_TO",
    header: "To Dt.",
    sortable: true,
  },
  {
    field: "NO_DAYS",
    header: "No. Days",
    sortable: true,
  },
  {
    field: "REMARKS",
    header: "Reason",
    sortable: true,
    body: (rowData) => {
      const text = rowData.REMARKS || "";

      const trimmed = text.length > 25
        ? text.substring(0, 25) + "..."
        : text;

      return (
        <span title={text}>
          {trimmed}
        </span>
      );
    }
  },
  
  {
    field: "statusText",
    header: "Status",
    body: (rowData) => {
      const hasAuthRemark = rowData?.status === "R" && rowData?.authremarks;

      return hasAuthRemark ? (
        <IconWithTooltip text={rowData.authremarks}>
          <span
            className={`badge badge-${rowData.statusColor} d-inline-flex align-items-center badge-xs`}
          >
            {rowData.statusText}
          </span>
        </IconWithTooltip>
      ) : (
        <span
          className={`badge badge-${rowData.statusColor} d-inline-flex align-items-center badge-xs`}
        >
          {rowData.statusText}
        </span>
      );
    },
  },
  {
    field: "col_actions",
    header: "Actions",
    sortable: false,
    body: (rowData) => renderLeaveActions(rowData, handlers),
    style: {
      width: "180px",
    },
  },
];
