export const getCFColumns = (formatDashDate) => [
  {
    field: "empName",
    header: "Booked By",
    style: { width: "16%" },
    sortable: true,
  },
  {
    header: "Created On",
    style: { width: "11%" },
    body: (rowData) => formatDashDate(rowData.addedon) || "-",
    sortable: true,
  },
  {
    header: "Booking Date",
    style: { width: "11%" },
    body: (rowData) => formatDashDate(rowData.date) || "-",
    sortable: true,
  },
  {
    field: "duration",
    header: "Duration",
    style: { width: "9%" },
  },
  {
    field: "noofattd",
    header: "No of Attendes",
    style: { width: "11%" },
  },
   {
    field: "room",
    header: "Room Label",
    style: { width: "12%" },
  },
  {
    field: "remarks",
    header: "Reason",
    style: { width: "30%" },
  },
];

