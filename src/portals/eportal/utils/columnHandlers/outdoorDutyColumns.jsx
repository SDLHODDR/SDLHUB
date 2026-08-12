import { renderOutdoorDutyActions } from "./OutdoorDutyActions";
import { IconWithTooltip } from "../tooltipHelper";
import { formatDashDate } from "../formatUtils";
import Badge from "../../components/Badge";

export const outdoorDutyColumns = (handlers) => [
    {
        header: "Date",
        sortable: true,
        body: (rowData) => {
            return (
                formatDashDate(rowData.asonDate)
            )
        }
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
        body: (rowData) => {
            return (
                formatDashDate(rowData.createdOn)
            )
        }
    },
    {
        field: "remarks",
        header: "Remarks",
        body: (rowData) => {
            const text = rowData?.remarks || "-";
            const trimmed =
                text.length > 15 ? `${text.substring(0, 15)}...` : text;
            
            return (
                <div className="remarks-wrapper">
                    {/* Main Remarks */}
                    <div className="remarks-main" title={text}>
                        {trimmed}
                    </div>
                </div>
            );
        },
        // style: {
        //     minWidth: "150px",
        // },
    },
    {
        field: "authremarks",
        header: "Auth Remarks",
        body: (rowData) => {
            
            const text = rowData?.status === "R" && rowData?.authremarks
                          ? rowData.authremarks
                          : "-";
            const trimmed =
                text.length > 15 ? `${text.substring(0, 15)}...` : text;
            
            return (
                <div className="remarks-wrapper">
                    <IconWithTooltip text={rowData.authremarks}>
                        <span className="text-danger small ms-1">
                            {trimmed}
                        </span>
                    </IconWithTooltip>
                    
                </div>
            );
        },
        // style: {
        //     minWidth: "150px",
        // },
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
    {
        key: "col_actions",
        header: "Actions",
        sortable: false,
        body: (rowData) => renderOutdoorDutyActions(rowData, handlers),
        style: {
            width: "180px",
        },
    },
    
];