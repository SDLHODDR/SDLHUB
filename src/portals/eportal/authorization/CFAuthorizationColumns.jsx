export const getCFColumns = (formatDashDate) => [
  {
    field: "empName",
    header: "Booked By",
    sortable: true,
  },
  {
    header: "Created On",
    body: (rowData) => formatDashDate(rowData.addedon) || "-",
    sortable: true,
  },
  {
    header: "Booking Date",
    body: (rowData) => formatDashDate(rowData.date) || "-",
    sortable: true,
  },
  {
    field: "duration",
    header: "Duration",
  },
  {
    field: "noofattd",
    header: "No of Attendes",
  },
   {
    field: "room",
    header: "Room Label",
  },
  {
    field: "remarks",
    header: "Reason",
  },
//   {
//     header: "Status",
//     body: (rowData) => {
//       const status = rowData.original?.STATUS;
//       const statusMap = {
//         T: { label: "Pending", className: "badge bg-warning" },
//         A: { label: "Approved", className: "badge bg-success" },
//         R: { label: "Rejected", className: "badge bg-danger" },
//       };
//       const config = statusMap[status] || { label: status || "-", className: "badge bg-secondary" };
//       return <span className={config.className}>{config.label}</span>;
//     },
//   },
];


// export const getCFColumns = (formatDashDate) => [
// {
//     header: "Created On",
//     body: (rowData) => formatDashDate(rowData.addedon),
// },
// {
//     header: "Created By",
//     body: (rowData) => rowData?.empName || "-",
// },
// {
//     header: "Booking For",
//     body: (rowData) => rowData?.empName || "-",
// },
// {
//     header: "Date",
//     body: (rowData) => {rowData.details}
// },
// { field: "duration", header: "Duration" },
// { field: "remarks", header: "Reason"}, 
//   {
//     header: "From Date",
//     body: (rowData) => rowData.DETAILS.LVE_DATE_FR,
//   },
//   {
//     header: "To Date",
//     body: (rowData) => rowData.DETAILS.LVE_DATE_TO,
//   },
//   {
//     field: "LVE_START_ON",
//     header: "Start",
//     sortable: true,
//     body: (rowData) => {
//       const startOn = LeaveStartEndArr[rowData?.LVE_START_ON] || rowData?.LVE_START_ON || "-";
//       return <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{startOn}</span>;
//     },
//   },
//   {
//     field: "LVE_END_ON",
//     header: "End",
//     sortable: true,
//     body: (rowData) => {
//       const endOn = LeaveStartEndArr[rowData?.LVE_END_ON] || rowData?.LVE_END_ON || "-";
//       return <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{endOn}</span>;
//     },
//   },
//   {
//     field: "LVE_CODE",
//     header: "Leave Type",
//     sortable: true,
//     body: (rowData) => rowData?.LVE_CODE || "-",
//   },
//   {
//     field: "TOTAL_DAYS",
//     header: "No. of Days",
//     sortable: true,
//     body: (rowData) => rowData?.TOTAL_DAYS || "-",
//   },
//   {
//     field: "REMARKS",
//     header: "Reason",
//     body: (rowData) => {
//       const text = rowData?.DETAILS?.REASON || "-";
//       const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
//       return (
//         <div className="remarks-wrapper">
//           <div className="remarks-main" title={text}>
//             {trimmed}
//           </div>
//         </div>
//       );
//     },
//   },
