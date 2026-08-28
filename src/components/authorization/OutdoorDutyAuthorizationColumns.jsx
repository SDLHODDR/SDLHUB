import { notifyWarning } from "../../services/alertService"; // adjust path to match your project

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
  }
  openModal(rowData);
};

export const getOutdoorDutyAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    body: (rowData) => formatDashDate(rowData.CREATED_ON),
  },
  {
    header: "Created By",
    body: (rowData) => rowData?.CREATED_BY || "-",
  },
  {
    header: "Outdoor Date",
    body: (rowData) => formatDashDate(rowData.GPASS_DATE) || "-",
  },
  {
    header: "OUT TYPE",
    body: (rowData) => OUT_TYPE_LABELS[rowData?.OUT_TYPE] || rowData?.OUT_TYPE || "-",
  },
  {
    field: "REMARKS",
    header: "REMARKS",
    body: (rowData) => {
      const text = rowData?.REMARKS || "-";
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
];