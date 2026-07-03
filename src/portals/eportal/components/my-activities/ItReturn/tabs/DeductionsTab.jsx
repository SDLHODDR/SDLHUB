import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";

import {
  saveDeductions,
  getDeductionData,
}  from "../../../../services/itReturnService";

import {
  notifySuccess,
  notifyError,
} from "../../../../../../services/alertService";

const DeductionsTab = ({ onDataSaved, editable }) => {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRefs = React.useRef({});

  const [financialYear, setFinancialYear] = useState("");
  const [empCode, setEmpCode] = useState("");

  const isEditable = Boolean(editable);

  // PREVENT DUPLICATE API CALLS
  const hasFetched = useRef(false);

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
     FETCH DEDUCTIONS
  ========================================= */

  const fetchDeductions = async () => {
    try {
      setLoading(true);

      const res = await getDeductionData();

      if (res?.status && Array.isArray(res.data)) {
        const formattedData = [];

        setFinancialYear(res.financial_year || "");
        setEmpCode(res.emp_code || "");

        res.data.forEach((section) => {
          section.records.forEach((item) => {
            formattedData.push({
              ...item,
              sub_section: section.section_name,
            });
          });
        });

        setDeductions(formattedData);
      } else {
        setDeductions([]);
      }
    } catch (error) {
      console.error("Error fetching deductions:", error);
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     ATTACHMENT URL
  ========================================= */

  const getAttachmentUrl = (fileName) => {
    if (!fileName) return "#";

    return `/assets/img/incometax/${financialYear}/${empCode}/${encodeURIComponent(
      fileName
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

  /* =========================================
     FILE CHANGE
  ========================================= */

  const isPdf = (file) => {
    return (
      file?.type === "application/pdf" ||
      file?.name?.toLowerCase().endsWith(".pdf")
    );
  };

  const handleFileChange = (itaxId, file) => {
    if (file && file.type !== "application/pdf") {
      notifyError("Only PDF files are allowed");

      // Clear DOM input box
      if (fileInputRefs.current[itaxId]) {
        fileInputRefs.current[itaxId].value = "";
      }

      return;
    }

    const updated = deductions.map((item) =>
      item.ITAX_ID === itaxId
        ? { ...item, file }
        : item
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
        if (item.file && !isPdf(item.file)) {
          notifyError("Only PDF files are allowed");
          return;
        }
      }

      const formData = new FormData();

      deductions.forEach((item) => {
        formData.append(
          `DEDN[${item.ITAX_ID}]`,
          item.AMOUNT || ""
        );

        if (item.file) {
          formData.append(
            `DEDN_DOC[${item.ITAX_ID}]`,
            item.file
          );
        }
      });

      await saveDeductions(formData);

      // REFRESH DATA FROM DB
      await fetchDeductions();

      notifySuccess("Deductions saved successfully");

      onDataSaved?.();
    } catch (error) {
      console.error("Save deductions error:", error);
      notifyError("Failed to save deductions");
    }
  };

  const groupedData = useMemo(
    () => groupBySection(),
    [deductions]
  );

  if (loading) {
    return <div>Loading deductions...</div>;
  }

  return (

  <> 
    {!editable && (
    <div className="alert alert-warning mb-3">
        IT Return editing is allowed only on configured dates.
    </div>
  )}

    <div>
      {Object.keys(groupedData).map(
        (section, sectionIndex) => (
          <div
            className="card mb-4 border-0 shadow-sm"
            key={sectionIndex}
            style={{
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {/* Section Header */}
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
              {section}
            </div>

            <div
              className="card-body"
              style={{
                background: "#f8fafc",
                padding: "20px",
              }}
            >
              {groupedData[section].map((item) => (
                <div
                  className="row align-items-center mb-3"
                  key={`${item.ITAX_ID}-${item.originalIndex}`}
                >
                  {/* Description */}
                  <div className="col-md-6">
                    <label
                      className="mb-0"
                      style={{
                        fontWeight: 500,
                        color: "#4b5c74",
                      }}
                    >
                      {item.ITAX_DESC}

                      {item.LIMIT ? (
                        <small
                          className="ms-2"
                          style={{
                            color: "#8b96a8",
                            fontWeight: 500,
                          }}
                        >
                          ₹{" "}
                          {Number(
                            item.LIMIT
                          ).toLocaleString()}
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
                          deductions.find(
                            (d) =>
                              d.ITAX_ID === item.ITAX_ID
                          )?.AMOUNT || ""
                        }
                        onChange={(e) =>
                          handleAmountChange(
                            item.ITAX_ID,
                            e.target.value
                          )
                        }
                        style={{
                          border: "1px solid #d7dee8",
                          borderRadius: "6px",
                          height: "42px",
                        }}
                      />

                      <input
                        type="file"
                        className="form-control"
                        accept="application/pdf"
                        ref={(el) =>
                          (fileInputRefs.current[
                            item.ITAX_ID
                          ] = el)
                        }
                        onChange={(e) =>
                          handleFileChange(
                            item.ITAX_ID,
                            e.target.files?.[0] || null
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

                  {/* View Attachment */}
                  <div className="col-md-1 text-center">
                    {item.ATTACHMENTS ? (
                      <a
                        href={getAttachmentUrl(
                          item.ATTACHMENTS
                        )}
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
            </div>
          </div>
        )
      )}

      {/* Buttons */}
       {isEditable && (
      <div className="text-center mt-4">
        <button
          className="btn me-2"
          onClick={handleSave}
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

        <button
          className="btn"
          onClick={fetchDeductions}
          style={{
            background: "#092c4c",
            color: "#fff",
            fontWeight: "600",
            padding: "10px 30px",
            borderRadius: "6px",
            border: "none",
          }}
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