import SDLActionButtons from "../../../../components/SDLActionButtons"; // adjust to match your real relative path
import { getOutdoorDutyActions } from "./outdoorDutyActions"; // adjust path
import { IconWithTooltip } from "../tooltipHelper";
import { formatDashDate } from "../formatUtils";
import Badge from "../../components/Badge";

export const outdoorDutyColumns = (handlers) => {
  const actions = getOutdoorDutyActions(handlers);

  return [
    {
      header: "Date",
      sortable: true,
      body: (rowData) => formatDashDate(rowData.asonDate),
    },
    {
      field: "outType",
      header: "Out Type",
      sortable: true,
      style: { width: "150px", whiteSpace: "nowrap" },
    },
    {
      header: "Created On",
      sortable: true,
      body: (rowData) => formatDashDate(rowData.createdOn),
    },
    {
      field: "remarks",
      header: "Remarks",
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
      key: "col_actions",
      header: "Actions",
      sortable: false,
      body: (rowData) => {
        //const status = rowData.status?.trim()?.toUpperCase();
        //const showDash = status === "T" && !rowData.postremarks;
        const visibleActions = actions.filter((a) => !a.show || a.show(rowData));

        // return (
        //   <div className="d-flex align-items-center justify-content-center gap-2">
        //     <SDLActionButtons row={rowData} actions={actions} />
        //     {showDash && <span className="text-muted">-</span>}
        //   </div>
        // );
        return (
            <div className="d-flex align-items-center justify-content-center gap-2" style={{ minWidth: "90px" }}>
                {visibleActions.length > 0 ? (
                <SDLActionButtons row={rowData} actions={actions} />
                ) : (
                <span className="text-muted">-</span>
                )}
            </div>
        );
      },
    //   style: { width: "180px" },
      style: { width: "120px", textAlign: "center" },
      bodyStyle: { textAlign: "center" },
    },
  ];
};