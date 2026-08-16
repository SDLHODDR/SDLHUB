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
const handleRowClick = (e, rowData, openModal) => {
  e.preventDefault();

  if (rowData?.REQUEST_TYPE && rowData.REQUEST_TYPE.trim() === "POSTREMARKS") {
    notifyWarning("Kindly submit your Post Remarks in Outdoor Duty page", "Action Required");
    return;
  }

  openModal(rowData);
};

export const getOutdoorDutyAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    body: (rowData) => (
      <a
        href="#"
        onClick={(e) => handleRowClick(e, rowData, openModal)}
        title="Created On"
      >
        {formatDashDate(rowData.CREATED_ON)}
      </a>
    ),
  },
  {
    header: "Created By",
    body: (rowData) => {
      const taskfor = rowData?.CREATED_BY || "-";
      return (
        <a
          href="#"
          onClick={(e) => handleRowClick(e, rowData, openModal)}
          title="Created By"
        >
          {taskfor}
        </a>
      );
    },
  },
  {
    header: "Outdoor Date",
    body: (rowData) => (
      <a
        href="#"
        onClick={(e) => handleRowClick(e, rowData, openModal)}
        title="Outdoor Date"
      >
        {formatDashDate(rowData.GPASS_DATE)}
      </a>
    ),
  },
  {
    field: "OUT_TYPE",
    header: "OUT TYPE",
    sortable: true,
    body: (rowData) => {
      const code = rowData?.OUT_TYPE;
      return (
        <a
          href="#"
          onClick={(e) => handleRowClick(e, rowData, openModal)}
          title="OUT TYPE"
        >
          {OUT_TYPE_LABELS[code] || code || "-"}
        </a>
      );
    },
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
            <a
              href="#"
              onClick={(e) => handleRowClick(e, rowData, openModal)}
              title="Remarks"
            >
              {trimmed}
            </a>
          </div>
        </div>
      );
    },
    style: { minWidth: "450px" },
  },
];