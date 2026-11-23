//import { renderLeaveActions } from "./leavesActions";
import Badge from "../../../../shared/components/Badge";
import { IconWithTooltip } from "../tooltipHelper";
import { formatDashDate } from "../../../../shared/utils/formatUtils";

export const leavesColumns = (handlers) => [
  {
    field: "LVE_CODE",
    header: "Type",
    sortable: true,
    // Only CL / SL / PL / OL, so a narrow column is enough.
    style: { width: "8%" },
  },
  {
    header: "From Date",
    style: { width: "15%" },
    body: (rowData) => {
      return (
        formatDashDate(rowData.LVE_DATE_FR)
      )
    }
  },
  {
    header: "To Date",
    style: { width: "15%" },
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
    style: { width: "11%" },
   
  },
  {
    field: "REMARKS",
    header: "Reason",
    sortable: true,
    style: { width: "30%" },
    body: (rowData) => {
      const text = rowData.REMARKS || "";

      // Show as much as fits in two lines of the column, then "..."; full text on hover.
      return (
        <span
          title={text}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {text}
        </span>
      );
    },
    
  },
  
  {
    field: "statusText",
    header: "Status",
    style: { width: "21%" },
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
