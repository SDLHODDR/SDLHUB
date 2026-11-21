import { useEffect, useRef, useState } from "react";
import SDLSelect from "../../../../../../shared/components/form/SDLSelect";
import {
  getIncomeData,
  saveRegime,
  saveOtherIncome,
} from "../../../../services/itReturnService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../../../../../shared/services/alertService";

import { ITR_MESSAGES } from "../../../../constants/itrMessages";

function IncomeSourcesTab({ onDataSaved, editable }) {
  const [grossSalary, setGrossSalary] = useState([]);
  const [otherIncome, setOtherIncome] = useState([]);
  const [regime, setRegime] = useState("N");
  // Each section folds on its header so the page stays short.
  const [openSections, setOpenSections] = useState({ regime: true, gross: false, other: true });
  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

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
        const {
          gross_salary = [],
          other_income = [],
          regime = "N",
        } = res.data || {};

        setGrossSalary(Array.isArray(gross_salary) ? gross_salary : []);
        setOtherIncome(Array.isArray(other_income) ? other_income : []);
        setRegime(regime || "N");
      } else {
        setGrossSalary([]);
        setOtherIncome([]);
        setRegime("N");

        notifyError(res?.message || ITR_MESSAGES.FAILED_LOAD_INCOME);
      }
    } catch (error) {
      console.error("Fetch income data error:", error);

      setGrossSalary([]);
      setOtherIncome([]);
      setRegime("N");

      notifyError(
        error?.response?.data?.message ||
        error?.message ||
        ITR_MESSAGES.FAILED_LOAD_INCOME
      );
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

    if (res?.status) {
      notifySuccess(res?.message || ITR_MESSAGES.REGIME_SAVED);

      await fetchData();

      onDataSaved?.();
    } else {
      notifyError(res?.message || ITR_MESSAGES.FAILED_SAVE_REGIME);
    }
  } catch (error) {
    console.error("Save regime error:", error);

    notifyError(
      error?.response?.data?.message ||
      error?.message ||
      ITR_MESSAGES.FAILED_SAVE_REGIME
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
        <div className="alert alert-warning py-2 mb-3 itr-notice"><i className="fas fa-lock me-2" />{ITR_MESSAGES.ITR_EDIT}</div>
      )}
      <div>
        {/* =========================================
          REGIME
      ========================================= */}

        <div
          className="card mb-4 itr-section-card"
        >
          <div
            className={`card-header itr-section-header itr-collapsible ${openSections.regime ? "" : "collapsed"}`}
            role="button"
            tabIndex={0}
            aria-expanded={openSections.regime}
            onClick={() => toggleSection("regime")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSection("regime"))}
          >
            <span>Regime</span>
            <i className="ti ti-chevron-down itr-collapse-icon" />
          </div>

          <div
            className={`card-body itr-section-body gap-3 align-items-center ${openSections.regime ? "d-flex" : "d-none"}`}
          >
            <div style={{ width: "300px" }}>
              <SDLSelect
                className="form-control"
                value={regime}
                onChange={(e) => setRegime(e.target.value)}
              >
                <option value="">Please Select</option>
                <option value="O">Old</option>
                <option value="N">New</option>
              </SDLSelect>
            </div>
            {isEditable && (
              <button
                className="btn btn-primary"
                onClick={handleSaveRegime}
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
          className="card mb-4 itr-section-card"
        >
          <div
            className={`card-header itr-section-header itr-collapsible ${openSections.gross ? "" : "collapsed"}`}
            role="button"
            tabIndex={0}
            aria-expanded={openSections.gross}
            onClick={() => toggleSection("gross")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSection("gross"))}
          >
            <span>Gross Salary</span>
            <i className="ti ti-chevron-down itr-collapse-icon" />
          </div>

          <div
            className={`card-body itr-section-body ${openSections.gross ? "" : "d-none"}`}
          >
            {grossSalary.length > 0 ? (
              grossSalary.map((item, index) => (
                <div className="row mb-3 align-items-center" key={index}>
                  <div className="col-md-6">
                    <span className="itr-item-label">{item.SH_DESCR}</span>
                  </div>

                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        className="form-control"
                        value={Number(item.AMOUNT || 0).toLocaleString()}
                        readOnly
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
          className="card itr-section-card"
        >
          <div
            className={`card-header itr-section-header itr-collapsible ${openSections.other ? "" : "collapsed"}`}
            role="button"
            tabIndex={0}
            aria-expanded={openSections.other}
            onClick={() => toggleSection("other")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSection("other"))}
          >
            <span>Other Income (Section 24)</span>
            <i className="ti ti-chevron-down itr-collapse-icon" />
          </div>

          <div
            className={`card-body itr-section-body ${openSections.other ? "" : "d-none"}`}
          >
            {otherIncome.length > 0 ? (
              <>
                {otherIncome.map((item, index) => (
                  <div className="row mb-3 align-items-center" key={index}>
                    <div className="col-md-5">
                      <span className="itr-item-label">{item.ITAX_DESC}</span>
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
                          className="itr-attachment-link"
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
                      className="btn btn-primary"
                      onClick={handleSaveOtherIncome}
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
