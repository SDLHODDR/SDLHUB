export const getExitAuthorizationColumns = (formatDashDate, tid = 0, exitTaskIds = [], joinTaskIds = []) => {
  return [
    {
      header: "Date",
      body: (rowData) => formatDashDate(rowData.CREATED_ON),
    },
    {
      header: "Created By",
      body: (rowData) => rowData.CREATED_BY_NAME,
    },
    {
      header: "Company",
      body: (rowData) => rowData.CNAME,
    },
    {
      header: "Division",
      body: (rowData) => rowData.DIVSN,
    },
    {
      header: "Department",
      body: (rowData) => rowData.DNAME,
    },
    ...(exitTaskIds.includes(String(tid))
      ? [
          {
            header: "Department - Designation - Location",
            body: (rowData) => `${rowData.EXIT_DEPT} - ${rowData.EXIT_DESIG} - ${rowData.EXIT_LOC}`,
          },
        ]
      : []),
    ...(joinTaskIds.includes(String(tid))
      ? [
          {
            header: "Department - Designation - Location",
            body: (rowData) => `${rowData.JOIN_DESIG} - ${rowData.JOIN_LOC}`,
          },
        ]
      : []),
    ...(tid == '2' || tid == '6'
      ? [
          {
            header: "Location",
            body: (rowData) => rowData.REQ_LOC_DESC,
          },
        ]
      : []),
    {
      header: "Task Description",
      sortable: true,
      body: (rowData) => rowData.TRAN_DESC,
    },
  ];
};