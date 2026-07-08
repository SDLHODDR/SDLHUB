import { renderOutdoorDutyActions } from "./OutdoorDutyActions";
import { IconWithTooltip } from "../tooltipHelper";

export const outdoorDutyColumns = (handlers) => [
    {
        field: "asonDate",
        header: "Date",
        sortable: true,
        style: { width: "120px", whiteSpace: "nowrap" },
    },
    {
        field: "outType",
        header: "Out Type",
        sortable: true,
        style: { width: "150px", whiteSpace: "nowrap" },
    },
    {
        field: "remarks",
        header: "Remarks",
        body: (rowData) => {
            const text = rowData?.remarks || "-";
            const trimmed =
                text.length > 15 ? `${text.substring(0, 15)}...` : text;

            const hasAuthRemark =
                rowData?.status === "R" && rowData?.authremarks;

            return (
                <div className="remarks-wrapper">
                    {/* Main Remarks */}
                    <div className="remarks-main" title={text}>
                        {trimmed}
                    </div>

                    {/* Show small indicator with tooltip instead of full block */}
                    {hasAuthRemark && (
                        <IconWithTooltip text={rowData.authremarks}>
                            <span className="text-danger small ms-1">
                                (Auth)
                            </span>
                        </IconWithTooltip>
                    )}
                </div>
            );
        },
        style: {
            minWidth: "450px",
        },
    },
    {
        field: "statusText",
        header: "Status",
        body: (rowData) => {
            const hasAuthRemark =
                rowData?.status === "R" && rowData?.authremarks;

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
        key: "col_actions",
        header: "Actions",
        sortable: false,
        body: (rowData) => renderOutdoorDutyActions(rowData, handlers),
        style: {
            width: "180px",
        },
    },
];