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
          {(String(tid) === "57" ? rowData.CREATED_BY : rowData.EMP_CODE_FOR) ||
            rowData.CREATED_BY ||
            rowData.EMP_CODE_FOR ||
            "—"}
        </span>
      ),
      style: { width: "140px", whiteSpace: "nowrap" },
    },
    {
      field: "EMP_NAME",
      header: "Employee Name",
      sortable: true,
      body: (rowData) =>
        (String(tid) === "57" ? rowData.CREATED_BY_NAME : rowData.EMP_NAME) ||
        rowData.CREATED_BY_NAME ||
        rowData.EMP_NAME ||
        "—",
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
        const status = String(rowData.STATUS || "").toUpperCase();
        const statusInfo =
          status === "O" || status === "N"
            ? { label: "Pending", className: "bg-warning text-dark" }
            : status === "C" || status === "A"
              ? { label: "Accept", className: "bg-success" }
              : status === "X" || status === "R"
                ? { label: "Reject", className: "bg-danger" }
                : { label: status || "Closed", className: "bg-secondary" };
        return (
          <span
            className={`badge ${statusInfo.className}`}
            style={{ fontSize: "12px", padding: "5px 10px" }}
          >
            {statusInfo.label}
          </span>
        );
      },
      style: { width: "120px", textAlign: "center" },
    },
  ];
};
