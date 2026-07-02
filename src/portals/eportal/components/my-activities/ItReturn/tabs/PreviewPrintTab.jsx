import React, { useEffect, useState, useRef, useMemo } from "react";
import { getEmployeeSummary }  from "../../../../services/itReturnService";
import "../../../../assets/css/PreviewPrintTab.css";

import { useReactToPrint } from "react-to-print";

const PreviewPrintTab = ({ refreshPreview }) => {
  const [summary, setSummary] = useState(null);

  const tableRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    documentTitle: `Investment_Declaration_${summary?.employee_code || "Report"}`,
  });

  const currentDate = useMemo(() => new Date().toLocaleDateString("en-GB"), []);

  /* =====================================================
      FETCH SUMMARY
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getEmployeeSummary();

        if (mounted && res.success) {
          setSummary(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshPreview]);

  if (!summary) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );
  }

    const regimeText =
    summary.regime === "N"
      ? "New Tax Regime"
      : summary.regime === "O"
        ? "Old Tax Regime"
        : "-";

  const format = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* =====================================================
      FY / AY
  ===================================================== */

  const financialYear = summary.financial_year || "2025-26";

  const fyParts = financialYear.split("-");

  let assessmentYear = "";

  if (fyParts.length === 2) {
    assessmentYear = Number(fyParts[0]) + 1 + "-" + (Number(fyParts[1]) + 1);
  }

  return (
    <div className="card w-100">
      {/* PDF BUTTON */}
      <div className="card-header d-flex justify-content-end">
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <i className="ti ti-printer me-1"></i>
          Print / Save PDF
        </button>
      </div>

      {/* PRINT AREA */}
      <div className="card-body">
        <div ref={tableRef} className="print-container">
          <table className="table table-bordered print-table">
            <tbody>
              {/* =====================================================
                HEADER
            ===================================================== */}

              <tr>
                <th colSpan="4" className="text-center">
                  {summary.employee_company || "-"}
                </th>
              </tr>

              <tr>
                <th colSpan="4" className="text-center">
                  INVESTMENT DECLARATION FORM FOR THE FINANCIAL YEAR{" "}
                  {financialYear}
                </th>
              </tr>

              {/* =====================================================
                EMPLOYEE DETAILS
            ===================================================== */}

              <tr>
                <td className="label">Employee Code</td>
                <td className="value">{summary.employee_code || "-"}</td>

                <td className="label">PAN No</td>
                <td className="value">{summary.pan_no || "-"}</td>
              </tr>

              <tr>
                <td className="label">Employee Name</td>
                <td className="value">{summary.employee_name || "-"}</td>

                <td className="label">Designation</td>
                <td className="value">{summary.designation || "-"}</td>
              </tr>

              <tr>
                <td className="label">DOB</td>
                <td className="value">{summary.dob || "-"}</td>

                <td className="label">Gender</td>
                <td className="value">{summary.gender || "-"}</td>
              </tr>

              <tr>
                <td className="label">Assessment Year</td>
                <td className="value">{assessmentYear || "-"}</td>

                <td className="label">Financial Year</td>
                <td className="value">{financialYear}</td>
              </tr>

              {/* =====================================================
                TAX REGIME
            ===================================================== */}

              <tr>
                <td colSpan="4">
                  <b>Tax Scheme opted for Financial Year {financialYear}</b>
                </td>
              </tr>

              <tr>
                <td className="label">Regime</td>
                <td className="value">{regimeText}</td>
              </tr>

              {/* =====================================================
                NOTE
            ===================================================== */}

              <tr>
                <td colSpan="4">
                  <b>Note:</b> All the tax reliefs and deductions provided under
                  the Income Tax Act, 1961 can be availed under the Old Tax
                  Scheme only. Employee opting for Old Tax Scheme is required{" "}
                  <br /> to fill the below Investment Declaration Form.
                  <br />
                  <b>
                    I hereby declare that the following investment will be made
                    by me during the financial year {financialYear}
                    starting from 1st of April to 31st of March of{" "}
                    {financialYear}
                  </b>
                </td>
              </tr>

              {/* =====================================================
                SALARY SUMMARY
            ===================================================== */}

              <tr>
                <th colSpan="4" className="sectionHeader">
                  SALARY & TAX SUMMARY
                </th>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  GROSS SALARY
                </td>

                <td className="amountValue">{format(summary.gross_salary)}</td>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  OTHER INCOME (SECTION 24)
                </td>

                <td className="amountValue">
                  {format(summary.other_income_total)}
                </td>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  STANDARD DEDUCTION
                </td>

                <td className="amountValue">
                  {format(summary.standard_deduction)}
                </td>
              </tr>

              {summary.regime === "O" && (
                <tr>
                  <td colSpan="3" className="amountLabel">
                    PROFESSIONAL TAX
                  </td>

                  <td className="amountValue">
                    {format(summary.professional_tax)}
                  </td>
                </tr>
              )}

              {summary.regime === "O" && (
                <tr>
                  <td colSpan="3" className="amountLabel">
                    HRA DEDUCTION
                  </td>

                  <td className="amountValue">
                    {format(summary.hra_deduction)}
                  </td>
                </tr>
              )}

              {/* =====================================================
                DEDUCTION SECTIONS
            ===================================================== */}

              {summary.regime === "O" &&
                summary.deduction_sections?.map((section, secIndex) => (
                  <React.Fragment key={secIndex}>
                    <tr className="tableRow">
                      <th colSpan="4" className="sectionHeader">
                        {section.section_name}
                      </th>
                    </tr>

                    <tr style={{ background: "#f1f1f1" }}>
                      <th className="headCell">Sr No.</th>

                      <th className="headCell">Particulars</th>

                      <th className="headCell">Limit</th>

                      <th className="headCell">Amount</th>
                    </tr>

                    {section.records?.map((item, index) => (
                      <tr key={index}>
                        <td className="bodyCenter">{index + 1}</td>

                        <td className="bodyText">{item.description}</td>

                        <td className="bodyAmount">
                          {Number(item.limit || 0) > 0
                            ? format(item.limit)
                            : "-"}
                        </td>

                        <td className="bodyAmount">
                          {format(item.final_amount)}
                        </td>
                      </tr>
                    ))}

                    <tr className="tableRow">
                      <td colSpan="3" className="totalLabel">
                        TOTAL
                      </td>

                      <td className="totalValue">{format(section.total)}</td>
                    </tr>
                  </React.Fragment>
                ))}

              {/* =====================================================
                OTHER INCOME
            ===================================================== */}

              {summary.other_income?.length > 0 && (
                <>
                  <tr>
                    <th colSpan="4" className="sectionHeader">
                      OTHER INCOME (SECTION 24)
                    </th>
                  </tr>

                  <tr style={{ background: "#f1f1f1" }}>
                    <th className="headCell">Sr No.</th>

                    <th colSpan="2" className="headCell">
                      Particulars
                    </th>

                    <th className="headCell">Amount</th>
                  </tr>

                  {summary.other_income.map((item, index) => (
                    <tr key={index}>
                      <td className="bodyCenter">{index + 1}</td>

                      <td colSpan="2" className="bodyText">
                        {item.description}
                      </td>

                      <td className="bodyAmount">
                        {item.type === "DEDUCTION"
                          ? `(-) ${format(item.amount)}`
                          : format(item.amount)}
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="3" className="totalLabel">
                      TOTAL OTHER INCOME
                    </td>

                    <td className="totalValue">
                      {format(summary.other_income_total)}
                    </td>
                  </tr>
                </>
              )}

              {/* =====================================================
                FINAL TAX
            ===================================================== */}

              <tr>
                <td colSpan="3" className="amountLabel">
                  NET TAXABLE INCOME
                </td>

                <td className="amountValue">
                  {format(summary.net_taxable_income)}
                </td>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  INCOME TAX
                </td>

                <td className="amountValue">{format(summary.income_tax)}</td>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  EDUCATION CESS
                </td>

                <td className="amountValue">
                  {format(summary.education_cess)}
                </td>
              </tr>

              <tr>
                <td colSpan="3" className="amountLabel">
                  TOTAL TAX PAYABLE
                </td>

                <td className="amountValue">
                  {format(summary.total_tax_payable)}
                </td>
              </tr>

              {/* =====================================================
                DECLARATION
            ===================================================== */}

              <tr>
                <td colSpan="4" className="declarationCell">
                  <b>Declaration:</b>
                  <br />I <b>{summary.employee_name} </b>hereby declare that the
                  information given above is correct and true in all respects.
                  <br /> I also undertake to indemnify the company for any
                  loss/liability may arise in the event of the above information
                  being incorrect.
                  <br />
                  <br />
                  Date : {currentDate}
                  <br />
                  <br />
                  Place :
                  <div className="text-end">
                    <b>Employee Signature</b>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviewPrintTab;
