export const getMastersAuthorizationColumns = (formatDashDate, tid = 0) => {
  return [
    {
      field: "CREATED_ON",
      header: "Date",
      sortable: true,
      body: (rowData) => formatDashDate(rowData.CREATED_ON),
      style: { width: "130px", whiteSpace: "nowrap" },
    },
    {
      field: "EMP_CODE_FOR",
      header: "Employee Code",
      sortable: true,
      body: (rowData) => (
        <span className="fw-semibold text-dark">
          {rowData.EMP_CODE_FOR || rowData.CREATED_BY || "—"}
        </span>
      ),
      style: { width: "140px", whiteSpace: "nowrap" },
    },
    {
      field: "EMP_NAME",
      header: "Employee Name",
      sortable: true,
      body: (rowData) => rowData.EMP_NAME || rowData.CREATED_BY_NAME || "—",
      style: { width: "180px", whiteSpace: "nowrap" },
    },
    {
      field: "DIVSN",
      header: "Division",
      sortable: true,
      body: (rowData) => rowData.DIVSN || "—",
      style: { width: "120px", whiteSpace: "nowrap" },
    },
    {
      field: "DNAME",
      header: "Department",
      sortable: true,
      body: (rowData) => rowData.DNAME || "—",
      style: { width: "120px", whiteSpace: "nowrap" },
    },
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
      style: { minWidth: "280px" },
    },
    {
      field: "STATUS",
      header: "Status",
      sortable: true,
      body: (rowData) => {
        const isPending = rowData.STATUS === "O" || rowData.STATUS === "N";
        return (
          <span
            className={`badge ${
              isPending ? "bg-warning text-dark" : "bg-success"
            }`}
            style={{ fontSize: "12px", padding: "5px 10px" }}
          >
            {isPending ? "Pending" : rowData.STATUS || "Closed"}
          </span>
        );
      },
      style: { width: "120px", textAlign: "center" },
    },
  ];
};
