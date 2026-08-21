//import { renderLeaveActions } from "./leavesActions";
import Badge from "../../components/Badge";
import { IconWithTooltip } from "../tooltipHelper";
import { formatDashDate } from "../formatUtils";

export const leavesColumns = (handlers) => [
  {
    field: "LVE_CODE",
    header: "Type",
    sortable: true,
    
  },
  {
    header: "From Date",
    body: (rowData) => {
      return (
        formatDashDate(rowData.LVE_DATE_FR)
      )
    }
  },
  {
    header: "To Date",
    body: (rowData) => {
      return (
        formatDashDate(rowData.LVE_DATE_TO)
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
          <Badge
            text={rowData.statusText}
            className={`badge-${rowData.statusColor}`}
          />
        </IconWithTooltip>
      ) : (
        <Badge
          text={rowData.statusText}
          className={`badge-${rowData.statusColor}`}
        />
      );
    },
   
  },
  
];
