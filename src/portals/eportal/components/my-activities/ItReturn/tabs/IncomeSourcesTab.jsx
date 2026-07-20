import { useEffect, useRef, useState } from "react";
import {
  getIncomeData,
  saveRegime,
  saveOtherIncome,
} from "../../../../services/itReturnService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../../../../../services/alertService";

import { ITR_MESSAGES } from "../../../../constants/itrMessages";

function IncomeSourcesTab({ onDataSaved, editable }) {
  const [grossSalary, setGrossSalary] = useState([]);
  const [otherIncome, setOtherIncome] = useState([]);
  const [regime, setRegime] = useState("N");

  const isEditable = Boolean(editable);

  const fileInputRefs = useRef({});

  // PREVENT DUPLICATE API CALLS
  const hasFetched = useRef(false);

  /* =========================================
     FETCH DATA
  ========================================= */

  const fetchData = async () => {
    try {
      const res = await getIncomeData();

      console.log(res);

      if (res?.status) {
        setGrossSalary(res.data?.gross_salary || []);
        setOtherIncome(res.data?.other_income || []);
        setRegime(res.data?.regime || "N");
      }
    } catch (error) {
      console.error("Fetch income data error:", error);
      notifyError(ITR_MESSAGES.FAILED_LOAD_INCOME);
    }
  };

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    // Prevent StrictMode duplicate execution
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchData();
  }, []);

  /* =========================================
     PDF VALIDATION
  ========================================= */

  const isPdf = (file) => {
    return (
      file?.type === "application/pdf" ||
      file?.name?.toLowerCase().endsWith(".pdf")
    );
  };

  /* =========================================
     SAVE REGIME
  ========================================= */

  const handleSaveRegime = async () => {
    try {
      const res = await saveRegime({ regime });

      if (res?.success) {
        notifySuccess(res?.message || ITR_MESSAGES.REGIME_SAVED);
        onDataSaved?.();
      } else {
        notifyError(res?.message || ITR_MESSAGES.FAILED_SAVE_REGIME);
      }
    } catch (error) {
      console.error("Save regime error:", error);

      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          ITR_MESSAGES.FAILED_SAVE_REGIME,
      );
    }
  };

  /* =========================================
     OTHER INCOME CHANGE
  ========================================= */

  const handleOtherIncomeChange = (index, value) => {
    const updated = [...otherIncome];

    updated[index].AMOUNT = value;

    setOtherIncome(updated);
  };

  /* =========================================
     FILE CHANGE
  ========================================= */

  const handleFileChange = (index, file, itaxId) => {
    if (file && !isPdf(file)) {
      notifyError(ITR_MESSAGES.ONLY_PDF_ALLOWED);

      // clear input
      if (fileInputRefs.current[itaxId]) {
        fileInputRefs.current[itaxId].value = "";
      }

      return;
    }

    const updated = [...otherIncome];

    updated[index].file = file;

    setOtherIncome(updated);
  };

  /* =========================================
     SAVE OTHER INCOME
  ========================================= */

  const handleSaveOtherIncome = async () => {
    try {
      for (const item of otherIncome) {
        if (item.file && !isPdf(item.file)) {
          notifyError(ITR_MESSAGES.ONLY_PDF_ALLOWED);
          return;
        }
      }

      const formData = new FormData();

      otherIncome.forEach((item) => {
        formData.append(`OTH_INCOME[${item.ITAX_ID}]`, item.AMOUNT || "");

        if (item.file) {
          formData.append(`OTH_INCOME_DOC[${item.ITAX_ID}]`, item.file);
        }
      });

      const response = await saveOtherIncome(formData);

      if (response?.status) {
        // REFRESH DATA
        await fetchData();

        notifySuccess(response.message || ITR_MESSAGES.OTHER_INCOME_SAVED);
        onDataSaved?.();
      } else {
        notifyWarning(
          response?.message || ITR_MESSAGES.FAILED_SAVE_OTHER_INCOME,
        );
      }
    } catch (error) {
      console.error(error);

      notifyError(ITR_MESSAGES.SERVER_ERROR_OTHER_INCOME);
    }
  };

  return (
    <>
      {!editable && (
        <div className="alert alert-warning mb-3">{ITR_MESSAGES.ITR_EDIT}</div>
      )}
      <div>
        {/* =========================================
          REGIME
      ========================================= */}

        <div
          className="card mb-4 border-0 shadow-sm"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              background: "#dfe8f4",
              color: "#4b5c74",
              fontWeight: "600",
              fontSize: "15px",
              borderBottom: "1px solid #d7dee8",
              padding: "14px 20px",
            }}
          >
            Regime
          </div>

          <div
            className="card-body d-flex gap-3 align-items-center"
            style={{
              background: "#f8fafc",
              padding: "20px",
            }}
          >
            <div style={{ width: "300px" }}>
              <select
                className="form-control"
                value={regime}
                onChange={(e) => setRegime(e.target.value)}
                style={{
                  border: "1px solid #d7dee8",
                  borderRadius: "6px",
                  height: "42px",
                }}
              >
                <option value="">Please Select</option>
                <option value="O">Old</option>
                <option value="N">New</option>
              </select>
            </div>
            {isEditable && (
              <button
                className="btn"
                onClick={handleSaveRegime}
                style={{
                  background: "#FE9F43",
                  color: "#fff",
                  fontWeight: "600",
                  padding: "10px 25px",
                  borderRadius: "6px",
                  border: "none",
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* =========================================
          GROSS SALARY
      ========================================= */}

        <div
          className="card mb-4 border-0 shadow-sm"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              background: "#dfe8f4",
              color: "#4b5c74",
              fontWeight: "600",
              fontSize: "15px",
              borderBottom: "1px solid #d7dee8",
              padding: "14px 20px",
            }}
          >
            Gross Salary
          </div>

          <div
            className="card-body"
            style={{
              background: "#f8fafc",
              padding: "20px",
            }}
          >
            {grossSalary.length > 0 ? (
              grossSalary.map((item, index) => (
                <div className="row mb-3 align-items-center" key={index}>
                  <div className="col-md-6">
                    <strong>{item.SH_DESCR}</strong>
                  </div>

                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        className="form-control"
                        value={Number(item.AMOUNT || 0).toLocaleString()}
                        readOnly
                        style={{
                          border: "1px solid #d7dee8",
                          height: "42px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>{ITR_MESSAGES.NO_GROSS_SALARY}</div>
            )}
          </div>
        </div>

        {/* =========================================
          OTHER INCOME
      ========================================= */}

        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              background: "#dfe8f4",
              color: "#4b5c74",
              fontWeight: "600",
              fontSize: "15px",
              borderBottom: "1px solid #d7dee8",
              padding: "14px 20px",
            }}
          >
            Other Income (Section 24)
          </div>

          <div
            className="card-body"
            style={{
              background: "#f8fafc",
              padding: "20px",
            }}
          >
            {otherIncome.length > 0 ? (
              <>
                {otherIncome.map((item, index) => (
                  <div className="row mb-3 align-items-center" key={index}>
                    <div className="col-md-5">
                      <strong>{item.ITAX_DESC}</strong>
                    </div>

                    <div className="col-md-5">
                      <div className="d-flex gap-2">
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount"
                            value={item.AMOUNT || ""}
                            onChange={(e) =>
                              handleOtherIncomeChange(index, e.target.value)
                            }
                            style={{
                              border: "1px solid #d7dee8",
                              height: "42px",
                            }}
                          />
                        </div>

                        <input
                          type="file"
                          className="form-control"
                          accept="application/pdf"
                          ref={(el) =>
                            (fileInputRefs.current[item.ITAX_ID] = el)
                          }
                          onChange={(e) =>
                            handleFileChange(
                              index,
                              e.target.files?.[0] || null,
                              item.ITAX_ID,
                            )
                          }
                          style={{
                            border: "1px solid #d7dee8",
                            borderRadius: "6px",
                            height: "42px",
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      {item.AGREEMENT_ATTACH ? (
                        <a
                          href={`/assets/img/incometax/${item.FY}/${item.EMP_CODE}/${encodeURIComponent(item.AGREEMENT_ATTACH)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Attachment"
                          style={{
                            color: "#FFCA18",
                            fontSize: "18px",
                          }}
                        >
                          <i className="bx bx-show"></i>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
                {isEditable && (
                  <div className="text-center mt-4">
                    <button
                      className="btn"
                      onClick={handleSaveOtherIncome}
                      style={{
                        background: "#FE9F43",
                        color: "#fff",
                        fontWeight: "600",
                        padding: "10px 30px",
                        borderRadius: "6px",
                        border: "none",
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>{ITR_MESSAGES.NO_OTHER_INCOME}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default IncomeSourcesTab;
