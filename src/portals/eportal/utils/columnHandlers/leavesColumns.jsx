//import { renderLeaveActions } from "./leavesActions";
import Badge from "../../components/Badge";
import { IconWithTooltip } from "../tooltipHelper";

export const leavesColumns = (handlers) => [
  {
    field: "LVE_CODE",
    header: "Type",
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
