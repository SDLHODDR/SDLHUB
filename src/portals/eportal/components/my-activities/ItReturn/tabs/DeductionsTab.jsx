import React, { useEffect, useState, useMemo, useRef } from "react";

import {
  saveDeductions,
  getDeductionData,
} from "../../../../services/itReturnService";

import {
  notifySuccess,
  notifyError,
} from "../../../../../../shared/services/alertService";

import { ITR_MESSAGES } from "../../../../constants/itrMessages";
import EportalPageLoader from "../../../loader/EportalPageLoader";
import { handleError } from "../../../../../../shared/services/errorHandler";
import { isPdfFile } from "../../../../../../shared/utils/fileUtils";

const DeductionsTab = ({ onDataSaved, editable }) => {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(false);
  // Sections fold on their header; until clicked, only the first one is open.
  const [openSections, setOpenSections] = useState({});
  const isSectionOpen = (section, index) => openSections[section] ?? index === 0;
  const toggleSection = (section, index) =>
    setOpenSections((prev) => ({ ...prev, [section]: !(prev[section] ?? index === 0) }));

  const fileInputRefs = React.useRef({});

  const [financialYear, setFinancialYear] = useState("");
  const [empCode, setEmpCode] = useState("");

  const isEditable = Boolean(editable);

  // PREVENT DUPLICATE API CALLS
  const hasFetched = useRef(false);

  /* =========================================
     FETCH DEDUCTIONS
  ========================================= */

  const fetchDeductions = async () => {
    try {
      setLoading(true);

      const res = await getDeductionData();

      if (res?.status) {
        const {
          financial_year = "",
          emp_code = "",
          deductions = [],
        } = res.data || {};

        setFinancialYear(financial_year);
        setEmpCode(emp_code);

        const formattedData = [];

        deductions.forEach((section) => {
          (section.records || []).forEach((item) => {
            formattedData.push({
              ...item,

              // section information
              sub_section: section.section_name,

              // normalize field names for the UI
              id: item.ITAX_ID,
              description: item.ITAX_DESC,
              limit: item.LIMIT,
              amount: item.AMOUNT,
              attachments: item.ATTACHMENTS,
            });
          });
        });

        setDeductions(formattedData);
      } else {
        setFinancialYear("");
        setEmpCode("");
        setDeductions([]);
      }
    } catch (error) {
      handleError(error, { context: "Load deductions", fallback: "Unable to load deductions." });

      setFinancialYear("");
      setEmpCode("");
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    // Prevent StrictMode duplicate execution
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchDeductions();
  }, []);

  /* =========================================
     ATTACHMENT URL
  ========================================= */

  const getAttachmentUrl = (fileName) => {
    if (!fileName) return "#";

    return `/assets/img/incometax/${financialYear}/${empCode}/${encodeURIComponent(
      fileName,
    )}?t=${Date.now()}`;
  };

  /* =========================================
     AMOUNT CHANGE
  ========================================= */

  const handleAmountChange = (itaxId, value) => {
    const updated = deductions.map((item) => {
      if (item.ITAX_ID === itaxId) {
        return {
          ...item,
          AMOUNT: value,
        };
      }
      return item;
    });

    const pairs = [
      [21, 93],
      [8, 94],
      [43, 44],
    ];

    const currentId = Number(itaxId);
    const oppositeIdsToClear = new Set();

    pairs.forEach(([a, b]) => {
      if (currentId === a) oppositeIdsToClear.add(b);

      if (currentId === b) oppositeIdsToClear.add(a);
    });

    const finalUpdated = updated.map((item) => {
      if (oppositeIdsToClear.has(Number(item.ITAX_ID))) {
        return {
          ...item,
          AMOUNT: "",
        };
      }
      return item;
    });

    setDeductions(finalUpdated);
  };

  const handleFileChange = (itaxId, file) => {
    if (file && file.type !== "application/pdf") {
      notifyError(ITR_MESSAGES.ONLY_PDF_ALLOWED);

      // Clear DOM input box
      if (fileInputRefs.current[itaxId]) {
        fileInputRefs.current[itaxId].value = "";
      }

      return;
    }

    const updated = deductions.map((item) =>
      item.ITAX_ID === itaxId ? { ...item, file } : item,
    );

    setDeductions(updated);
  };

  /* =========================================
     GROUP BY SECTION
  ========================================= */

  const groupBySection = () => {
    return deductions.reduce((acc, item, originalIndex) => {
      const section = item.sub_section || "Other";

      if (!acc[section]) {
        acc[section] = [];
      }

      acc[section].push({
        ...item,
        originalIndex,
      });

      return acc;
    }, {});
  };

  /* =========================================
     SAVE
  ========================================= */

  const handleSave = async () => {
    try {
      for (const item of deductions) {
        if (item.file && !isPdfFile(item.file)) {
          notifyError("Only PDF files are allowed");
          return;
        }
      }

      const formData = new FormData();

      deductions.forEach((item) => {
        formData.append(`DEDN[${item.ITAX_ID}]`, item.AMOUNT || "");

        if (item.file) {
          formData.append(`DEDN_DOC[${item.ITAX_ID}]`, item.file);
        }
      });

      await saveDeductions(formData);

      // REFRESH DATA FROM DB
      await fetchDeductions();

      notifySuccess(ITR_MESSAGES.DEDUCTIONS_SAVED);

      onDataSaved?.();
    } catch (error) {
      console.error(ITR_MESSAGES.DEDUCTIONS_SAVED_FAILED, error);
      notifyError(ITR_MESSAGES.DEDUCTIONS_SAVED_FAILED);
    }
  };

  const groupedData = useMemo(() => groupBySection(), [deductions]);

  if (loading) {
    return <EportalPageLoader />;
  }

  return (
    <>
      {!editable && (
        <div className="alert alert-warning py-2 mb-3 itr-notice"><i className="fas fa-lock me-2" />{ITR_MESSAGES.ITR_EDIT}</div>
      )}

      <div>
        {Object.keys(groupedData).map((section, sectionIndex) => (
          <div
            className="card mb-4 itr-section-card"
            key={sectionIndex}
          >
            {/* Section Header */}
            <div
              className={`card-header itr-section-header itr-collapsible ${isSectionOpen(section, sectionIndex) ? "" : "collapsed"}`}
              role="button"
              tabIndex={0}
              aria-expanded={isSectionOpen(section, sectionIndex)}
              onClick={() => toggleSection(section, sectionIndex)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSection(section, sectionIndex))}
            >
              <span>{section}</span>
              <i className="ti ti-chevron-down itr-collapse-icon" />
            </div>

            <div
              className={`card-body itr-section-body ${isSectionOpen(section, sectionIndex) ? "" : "d-none"}`}
            >
              {groupedData[section].map((item) => (
                <div
                  className="row align-items-center mb-3"
                  key={`${item.ITAX_ID}-${item.originalIndex}`}
                >
                  {/* Description */}
                  <div className="col-md-6">
                    <label className="mb-0 itr-item-label">
                      {item.ITAX_DESC}

                      {item.LIMIT ? (
                        <small className="ms-2 itr-item-limit">
                          ₹ {Number(item.LIMIT).toLocaleString()}
                        </small>
                      ) : null}
                    </label>
                  </div>

                  {/* Amount + File */}
                  <div className="col-md-5">
                    <div className="d-flex gap-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Amount"
                        value={
                          deductions.find((d) => d.ITAX_ID === item.ITAX_ID)
                            ?.AMOUNT || ""
                        }
                        onChange={(e) =>
                          handleAmountChange(item.ITAX_ID, e.target.value)
                        }
                      />

                      <input
                        type="file"
                        className="form-control"
                        accept="application/pdf"
                        ref={(el) => (fileInputRefs.current[item.ITAX_ID] = el)}
                        onChange={(e) =>
                          handleFileChange(
                            item.ITAX_ID,
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* View Attachment */}
                  <div className="col-md-1 text-center">
                    {item.ATTACHMENTS ? (
                      <a
                        href={getAttachmentUrl(item.ATTACHMENTS)}
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
            </div>
          </div>
        ))}

        {/* Buttons */}
        {isEditable && (
          <div className="text-center mt-4">
            <button
              className="btn btn-primary me-2"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="btn btn-secondary"
              onClick={fetchDeductions}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DeductionsTab;
