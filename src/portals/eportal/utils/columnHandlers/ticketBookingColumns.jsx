import SDLActionButtons from "../../../../components/SDLActionButtons"; // adjust path
import { getTicketBookingActions } from "./ticketBookingActions"; // adjust path
import { IconWithTooltip } from "../tooltipHelper";
import { formatDashDate } from "../formatUtils";
import Badge from "../../components/Badge";

export const ticketBookingColumns = (handlers) => {
  const actions = getTicketBookingActions(handlers);

  return [
    {
      field: "person_name",
      header: "Person Name",
      sortable: true,
      style: { width: "17%" },
    },
    {
      header: "Travel Date",
      style: { width: "10%" },
      body(rowData) {
        return formatDashDate(rowData.trvl_date);
      },
    },
    {
      field: "trvl_from_location",
      header: "From",
      sortable: true,
      style: { width: "8%" },
    },
    {
      field: "trvl_to_loc",
      header: "To",
      sortable: true,
      style: { width: "8%" },
    },
    {
      field: "trvl_ft_name",
      header: "Flight/Train",
      sortable: true,
      style: { width: "12%" },
    },
    {
      field: "remarks",
      header: "Remarks",
      style: { width: "10%" },
      body: (rowData) => {
        const text = rowData?.remarks || "-";
        const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
        return (
          <div className="remarks-wrapper">
            <div className="remarks-main" title={text}>
              {trimmed}
            </div>
          </div>
        );
      },
    },
    {
      field: "authremarks",
      header: "Auth Remarks",
      style: { width: "8%" },
      body: (rowData) => {
        const text =
          rowData?.status === "R" && rowData?.authremarks ? rowData.authremarks : "-";
        const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
        return (
          <div className="remarks-wrapper">
            <IconWithTooltip text={rowData.authremarks}>
              <span className="text-danger small ms-1">{trimmed}</span>
            </IconWithTooltip>
          </div>
        );
      },
    },
    {
      field: "statusText",
      header: "Status",
      style: { width: "12%" },
      body: (rowData) => {
        const hasAuthRemark = rowData?.status === "R" && rowData?.authremarks;
        return hasAuthRemark ? (
          <IconWithTooltip text={rowData.authremarks}>
            <Badge text={rowData.statusText} className={`badge-${rowData.statusColor}`} />
          </IconWithTooltip>
        ) : (
          <Badge text={rowData.statusText} className={`badge-${rowData.statusColor}`} />
        );
      },
    },
    {
      field: "col_actions",
      header: "Actions",
      sortable: false,
      body: (rowData) => (
        <SDLActionButtons row={rowData} actions={actions} />
      ),
      style: { width: "9%", textAlign: "center" },
    },
  ];
};
