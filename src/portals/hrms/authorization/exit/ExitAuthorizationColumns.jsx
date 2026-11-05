export const getExitAuthorizationColumns = (formatDashDate, tid = 0, exitTaskIds = [], joinTaskIds = []) => {
  return [
    {
      field: "CREATED_SORT",
      header: "Date",
      sortable: true,
      body: (rowData) => formatDashDate(rowData.CREATED_ON),
      style: { width: "115px", whiteSpace: "nowrap" },
    },
    {
      field: "CREATED_BY_NAME",
      header: "Created By",
      sortable: true,
      body: (rowData) => rowData.CREATED_BY_NAME || "—",
      style: { width: "150px" },
    },
    {
      field: "CNAME",
      header: "Company",
      sortable: true,
      body: (rowData) => rowData.CNAME || "—",
      style: { width: "105px", whiteSpace: "nowrap" },
    },
    {
      field: "DIVSN",
      header: "Division",
      sortable: true,
      body: (rowData) => rowData.DIVSN || "—",
      style: { width: "100px" },
    },
    {
      field: "DNAME",
      header: "Department",
      sortable: true,
      body: (rowData) => rowData.DNAME || "—",
      style: { width: "130px" },
    },
    ...((exitTaskIds || []).includes(String(tid))
      ? [
          {
            header: "Department - Designation - Location",
            body: (rowData) =>
              [rowData.EXIT_DEPT, rowData.EXIT_DESIG, rowData.EXIT_LOC]
                .filter(Boolean)
                .join(" - ") || "—",
            style: { width: "260px" },
          },
        ]
      : []),
    ...((joinTaskIds || []).includes(String(tid))
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
      field: "TRAN_DESC",
      header: "Task Description",
      sortable: true,
      body: (rowData) => (
        <div
          style={{
            lineHeight: "1.4",
            fontSize: "13px",
            wordBreak: "break-word",
          }}
        >
          {rowData.TRAN_DESC || "—"}
        </div>
      ),
      // No fixed width: takes the remaining space and wraps.
    },
  ];
};
