export const getTicketBookingAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    body: (rowData) => formatDashDate(rowData.CREATED_ON),
  },
  {
    header: "Created By",
    body: (rowData) => rowData?.CREATED_BY || "-",
  },
  {
    header: "Travel Person",
    body: (rowData) => rowData?.REQUEST_FOR || "-",
  },
  {
    header: "Travel Date",
    body: (rowData) => formatDashDate(rowData.TRVL_DATE) || "-",
  },
   {
    header: "Travel Mode",
    body: (rowData) => rowData.TRVL_MODE || "-",
  },
  {
    header: "Flight/Train Name",
    body: (rowData) => rowData.TRVL_FT_NAME || "-",
  },
  {
    header: "Travel Class",
    body: (rowData) => rowData.TRVL_CLASS || "-",
  },
  {
    header: "Travel From",
    body: (rowData) => rowData?.TRVL_FROM_LOC || "-",
  },
  {
    header: "Travel To",
    body: (rowData) => rowData?.TRVL_TO_LOC || "-",
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