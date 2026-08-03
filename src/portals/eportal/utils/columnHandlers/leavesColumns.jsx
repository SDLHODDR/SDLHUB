//import { renderLeaveActions } from "./leavesActions";
import { IconWithTooltip } from "../tooltipHelper";
import { formatDate } from "../formatUtils";

export const leavesColumns = (handlers) => [
  {
    field: "LVE_CODE",
    header: "Type",
    sortable: true,
    
  },
  {
    header: "From Dt",
    body: (rowData) => {
      return (
        formatDate(rowData.LVE_DATE_FR)
      )
    }
  },
  {
    header: "To Dt",
    body: (rowData) => {
      return (
        formatDate(rowData.LVE_DATE_TO)
      )
    }
  },
  {
    field: "NO_DAYS",
    header: "Days",
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
    },
    
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
  
];
