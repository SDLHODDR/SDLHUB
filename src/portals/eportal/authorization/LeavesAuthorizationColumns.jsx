export const LeaveStartEndArr = {
  B: "Beginning Of The Day",
  M: "Middle Of The Day",
  E: "End Of The Day",
};

export const getLeavesAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    body: (rowData) => formatDashDate(rowData.CREATED_ON),
  },
  {
    header: "Created By",
    body: (rowData) => rowData.CREATED_BY,
  },
  {
    header: "From Date",
    body: (rowData) => rowData.DETAILS.LVE_DATE_FR,
  },
  {
    header: "To Date",
    body: (rowData) => rowData.DETAILS.LVE_DATE_TO,
  },
  {
    field: "LVE_START_ON",
    header: "Start",
    sortable: true,
    body: (rowData) => {
      const startOn = LeaveStartEndArr[rowData?.LVE_START_ON] || rowData?.LVE_START_ON || "-";
      return <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{startOn}</span>;
    },
  },
  {
    field: "LVE_END_ON",
    header: "End",
    sortable: true,
    body: (rowData) => {
      const endOn = LeaveStartEndArr[rowData?.LVE_END_ON] || rowData?.LVE_END_ON || "-";
      return <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{endOn}</span>;
    },
  },
  {
    field: "LVE_CODE",
    header: "Leave Type",
    sortable: true,
    body: (rowData) => rowData?.LVE_CODE || "-",
  },
  {
    field: "TOTAL_DAYS",
    header: "No. of Days",
    sortable: true,
    body: (rowData) => rowData?.TOTAL_DAYS || "-",
  },
  {
    field: "REMARKS",
    header: "Reason",
    body: (rowData) => {
      const text = rowData?.DETAILS?.REASON || "-";
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