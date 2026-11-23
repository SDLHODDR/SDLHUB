import { notifyWarning } from "../../../shared/services/alertService"; // adjust path to match your project

export const OUT_TYPE_LABELS = {
  OI: "In/Out same day",
  OD: "Out for full day",
  FO: "First Half Out",
  SO: "Second Half Out",
  FW: "Field Work",
  TO: "Tour",
};

// Shared guard — used by every clickable cell instead of calling openModal directly
export const handleRowClick = (e, rowData, openModal) => {
  if (rowData?.REQUEST_TYPE && rowData.REQUEST_TYPE.trim() === "POSTREMARKS") {
    notifyWarning("Kindly submit your Post Remarks in Outdoor Duty page", "Action Required");
    return;
  } else if(rowData.TASK_ID == 22) {
    notifyWarning("Kindly submit your Post Remarks in Outdoor Duty page", "Action Required");
    return;
  }
  openModal(rowData);
};

export const getOutdoorDutyAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    style: { width: "11%" },
    body: (rowData) => formatDashDate(rowData.CREATED_ON),
  },
  {
    header: "Created By",
    style: { width: "17%" },
    body: (rowData) => rowData?.CREATED_BY || "-",
  },
  {
    header: "Outdoor Date",
    style: { width: "11%" },
    body: (rowData) => formatDashDate(rowData.GPASS_DATE) || "-",
  },
  {
    header: "Out Type",
    style: { width: "13%" },
    body: (rowData) => OUT_TYPE_LABELS[rowData?.OUT_TYPE] || rowData?.OUT_TYPE || "-",
  },
  {
    field: "REMARKS",
    header: "Remarks",
    style: { width: "48%" },
    body: (rowData) => {
      const text = rowData?.REMARKS || "-";
      // Up to two lines in the wider column, then "..."; full text on hover.
      return (
        <div className="remarks-wrapper">
          <div
            className="remarks-main"
            title={text}
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}
          >
            {text}
          </div>
        </div>
      );
    },
  },
];