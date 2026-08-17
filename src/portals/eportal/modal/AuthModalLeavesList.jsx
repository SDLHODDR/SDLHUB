//import React from "react";

const AuthModalLeavesList = ({
  dataSource = [],
  loading = false,
}) => {
  const safeData = Array.isArray(dataSource)
    ? dataSource
    : [];

  if (loading) {
    return (
      <div className="text-center py-4">
        Loading Leave Register...
      </div>
    );
  }

  if (!loading && safeData.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No Leave Register Found
      </div>
    );
  }

  let srNo = 1;

  return (
    <div className="table-responsive">
      <table
        className="table table-bordered table-sm mb-0 leave-register-table"
        style={{
          fontSize: "12px",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
        }}
      >
        <thead className="table-light">
          <tr>
            {/* <th>No</th>
            <th>Department</th>
            <th>Code</th>
            <th>Employee Name</th> */}
            <th>Leave Code</th>
            <th>Opening Balance</th>
            <th>Period</th>
            <th>Enjoyed</th>
            <th>Balance</th>
            <th>Month Dates</th>
          </tr>
        </thead>

        <tbody>
          {safeData.map((emp, empIndex) => {
            const totalRows =
              emp.leave_details?.reduce(
                (acc, lv) =>
                  acc +
                  (lv.periods?.length || 1),
                0
              ) || 1;

            let firstEmpRow = true;

            const employeeRows =
              emp.leave_details?.map(
                (leave, leaveIndex) => {
                  const periods =
                    leave.periods?.length
                      ? leave.periods
                      : [
                          {
                            PERIOD: "",
                            ENJOYED: 0,
                            BALANCE:
                              leave.OPENING_BALANCE,
                            MONTH_DATES: "",
                          },
                        ];

                  return periods.map(
                    (prd, prdIndex) => {
                      const currentSrNo =
                        firstEmpRow
                          ? srNo++
                          : null;

                      const row = (
                        <tr
                          key={`${empIndex}-${leaveIndex}-${prdIndex}`}
                        >
                          {firstEmpRow && (
                            <>
                              {/* <td
                                rowSpan={
                                  totalRows
                                }
                                className="text-center align-middle"
                              >
                                {currentSrNo}
                              </td> */}

                              {/* <td
                                rowSpan={
                                  totalRows
                                }
                                className="align-middle"
                              >
                                {emp.DEPT}
                              </td> */}

                              {/* <td
                                rowSpan={
                                  totalRows
                                }
                                className="text-center align-middle"
                              >
                                {
                                  emp.EMP_CODE
                                }
                              </td> */}

                              {/* <td
                                rowSpan={
                                  totalRows
                                }
                                className="align-middle"
                              >
                                {
                                  emp.EMP_NAME
                                }
                              </td> */}
                            </>
                          )}

                          {prdIndex === 0 && (
                            <>
                              <td
                                rowSpan={
                                  periods.length
                                }
                                className="text-center align-top"
                              >
                                {
                                  leave.LEAVE_CODE
                                }
                              </td>

                              <td
                                rowSpan={
                                  periods.length
                                }
                                className="text-end align-top"
                              >
                                {
                                  leave.OPENING_BALANCE
                                }
                              </td>
                            </>
                          )}

                          <td className="text-center">
                            {prd.PERIOD}
                          </td>

                          <td className="text-center">
                            {prd.ENJOYED}
                          </td>

                          <td className="text-center">
                            {prd.BALANCE}
                          </td>

                          <td
                            className="text-center"
                            style={{
                              minWidth:
                                "140px",
                              whiteSpace:
                                "normal",
                            }}
                          >
                            {prd.MONTH_DATES ||
                              "-"}
                          </td>
                        </tr>
                      );

                      firstEmpRow = false;

                      return row;
                    }
                  );
                }
              );

            return employeeRows;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuthModalLeavesList;