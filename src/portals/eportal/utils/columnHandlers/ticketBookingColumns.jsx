import { renderTicketBookingActions } from "./ticketBookingActions";
import { IconWithTooltip } from "../tooltipHelper";

export const ticketBookingColumns = (handlers) => [
  {
    field: "person_name",
    header: "Person Name",
    sortable: true,
    style: { width: "120px", whiteSpace: "nowrap" },
  },
//   {
//     field: "trvl_mode",
//     header: "Travel Mode",
//     sortable: true,
//     // style: { width: "150px", whiteSpace: "nowrap" },
//   },
  {
    field: "trvl_date",
    header: "Travel Date",
    sortable: true,
    // style: { width: "150px", whiteSpace: "nowrap" },
  },
  {
    field: "trvl_from_location",
    header: "From",
    sortable: true,
    // style: { width: "150px", whiteSpace: "nowrap" },
  },
  {
    field: "trvl_to_loc",
    header: "To",
    sortable: true,
    // style: { width: "150px", whiteSpace: "nowrap" },
  },
  {
    field: "trvl_ft_name",
    header: "Flight/Train",
    sortable: true,
    // style: { width: "150px", whiteSpace: "nowrap" },
  },
//   {
//     field: "ttnt_depr_time",
//     header: "Start Time",
//     sortable: true,
//     style: { width: "150px", whiteSpace: "nowrap" },
//   },
 
  {
    field: "remarks",
    header: "Remarks",
    body: (rowData) => {
      const text = rowData?.remarks || "-";
      const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;

      const hasAuthRemark = rowData?.status === "R" && rowData?.authremarks;

      return (
        <div className="remarks-wrapper">
          {/* Main Remarks */}
          <div className="remarks-main" title={text}>
            {trimmed}
          </div>

          {/* Show small indicator with tooltip instead of full block */}
          {hasAuthRemark && (
            <IconWithTooltip text={rowData.authremarks}>
              <span className="text-danger small ms-1">(Auth)</span>
            </IconWithTooltip>
          )}
        </div>
      );
    },
    // style: {
    //     minWidth: "450px",
    // },
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
    body: (rowData) => renderTicketBookingActions(rowData, handlers),
    style: {
      width: "180px",
    },
  },
];
