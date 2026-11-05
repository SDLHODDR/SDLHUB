const OfficeDetailsTab = ({ profile }) => {
  const employee = profile?.employee || {};

  /* =========================================================
     OFFICE DETAILS
  ========================================================= */

  const officeDetails = [
    {
      label: "Employee ID",
      value: employee?.EMP_CODE || "-",
    },
    {
      label: "Department",
      value: employee?.DEPT_NAME || "-",
    },
    {
      label: "Designation",
      value: employee?.DESIG_NAME || "-",
    },
    {
      label: "Reports To",
      value: employee?.REPORT_TO_NAME || "-",
    },
    {
      label: "Joining Date",
      value: employee?.DOJ || "-",
    },
    {
      label: "Confirmation Date",
      value: employee?.DATE_CONF || "-",
    },
    {
      label: "Shift",
      value: employee?.SHFT_LABEL || "-",
    },
    {
      label: "Experience",
      value: employee?.EXPERIENCE || "-",
    },
  ];

  return (
    <div className="office-details-tab">
      <div className="table-responsive">
        <table
          className="table table-sm mb-0"
          style={{
            fontSize: "14px",
          }}
        >
          <tbody>
            {officeDetails.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    width: "58%",
                    fontWeight: 600,
                    color: "#526273",
                    padding: "7px 6px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {item.label}:
                </td>

                <td
                  style={{
                    width: "42%",
                    color: "#68788a",
                    padding: "7px 6px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficeDetailsTab;