import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

import {
  getTenureLetterDetails,
  generateTenureLetterReference,
  closeTenurePrintTask,
} from "../../../hrms/services/tenureChangeService";
import "../../assets/css/tenureChange.css";

const TenureChangeLetterModal = ({
  config,
  show,
  record,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [staffType, setStaffType] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatingRef, setGeneratingRef] = useState(false);

  const empCode =
    record?.TRAN_CODE ||
    record?.REC_ID ||
    record?.EMP_CODE ||
    record?.EMP_CODE_FOR ||
    "";
  const taskId = record?.TASK_ID || "";
  const tenureChangeId = record?.TENURE_CHG_ID || "";

  useEffect(() => {
    if (show) {
      if (empCode) {
        fetchDetails();
      } else {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Employee code (TRAN_CODE) is missing from the record.",
        });
      }
    } else {
      setDetails(null);
      setStaffType("");
      setPreviewUrl("");
      setShowPreviewModal(false);
    }
  }, [show, empCode]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getTenureLetterDetails({
        empCode,
        tenureChangeId,
        taskId,
      });

      const resData = response?.data?.data ? response.data : response;

      if (resData && (resData.status === true || resData.success === true)) {
        const data = resData.data;
        setDetails(data);

        if (data?.etype_id) {
          setStaffType(mapEtypeIdToMode(data.etype_id));
        }

        if (data.salary_approved === false || data.int_sal === 0) {
          Swal.fire({
            title: "Salary Approve!",
            text: "Salary Approval pending at EPP system. Please get it approved, to print tenure change letter.",
            icon: "warning",
            confirmButtonColor: "#d33",
            confirmButtonText: "Close",
            allowOutsideClick: false,
          });
        }
      } else {
        Swal.fire(
          "Error",
          resData?.message || "Failed to load employee details.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error fetching tenure letter details:", err);
      Swal.fire("Error", "Error connecting to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const mapEtypeIdToMode = (etypeId) => {
    switch (String(etypeId)) {
      case "1":
        return "P";
      case "6":
        return "E";
      case "2":
        return "C";
      case "5":
        return "Pro";
      default:
        return "Prob";
    }
  };

  const resolveTemplateUrl = (selectedType, code) => {
    let script = "confirmation_letter_revised.php";
    if (selectedType === "E" || selectedType === "6") {
      script = "extension_letter_trainee.php";
    } else if (selectedType === "C" || selectedType === "2") {
      script = "extension_letter_contract.php";
    } else if (selectedType === "Pro" || selectedType === "5") {
      script = "extension_letter_probation.php";
    } else if (selectedType === "Prob") {
      script = "probation_letter.php";
    }

    return `reports/pdfReport/${script}?EMP_CODE=${code}`;
  };

  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePreviewTemplate = async () => {
    if (!staffType) {
      Swal.fire({
        icon: "info",
        title: "Please Select",
        text: "Please select a letter template first.",
      });
      return;
    }

    let script = "confirmation_letter_revised.php";
    if (staffType === "E") script = "extension_letter_trainee.php";
    else if (staffType === "C") script = "extension_letter_contract.php";
    else if (staffType === "Pro") script = "extension_letter_probation.php";
    else if (staffType === "Prob") script = "probation_letter.php";

    const url = `${import.meta.env.VITE_BASE_URL}/hrms/reports/pdfReport/${script}?EMP_CODE=${encodeURIComponent(empCode)}`;

    setPdfLoading(true);
    setShowPreviewModal(true);

    try {
      const response = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });

      // Revoke prior blob if exists to avoid memory leak
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl.split("#")[0]);
      }

      const file = new Blob([response.data], { type: "application/pdf" });
      const rawUrl = URL.createObjectURL(file);

      // Instruct PDF viewer to fit to page width and close the left thumbnail pane
      setPdfBlobUrl(`${rawUrl}#toolbar=1&navpanes=0&zoom=page-width`);
    } catch (error) {
      console.error("PDF Preview Error:", error);
      Swal.fire("Error", "Could not load the letter preview from server.", "error");
      setShowPreviewModal(false);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateRefCode = async () => {
    setGeneratingRef(true);
    try {
      const response = await generateTenureLetterReference({
        empCode,
        tenureChangeId: details?.tenure_chg_id || tenureChangeId,
      });

      const resData = response?.data?.data ? response.data : response;

      if (resData && (resData.status === true || resData.success === true)) {
        Swal.fire({
          title: "Reference Code generated Successfully!",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
        });

        setShowPreviewModal(false);
        fetchDetails();
        if (onSuccess) onSuccess();
      } else {
        Swal.fire(
          "Error",
          resData?.message || "Failed to generate Reference Code.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error generating reference code:", err);
      // Read the actual error message from backend response
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Server error while generating reference code.";

      Swal.fire({
        icon: "error",
        title: "Reference Generation Failed",
        html: `<div style="text-align:left; font-size:13px; max-height:200px; overflow:auto;">
                 <b>Details:</b> ${serverMessage}
               </div>`,
      });
    } finally {
      setGeneratingRef(false);
    }
  };

  const handleCloseTask = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to close this tenure print task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Close Task",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await closeTenurePrintTask({
            empCode,
            tenureChangeId: details?.tenure_chg_id || tenureChangeId,
            taskId,
          });

          if (
            res?.data &&
            (res.data.status === true || res.data.status === "success")
          ) {
            Swal.fire("Success", "Task closed successfully.", "success");
            onClose();
            if (onSuccess) onSuccess();
          } else {
            Swal.fire(
              "Error",
              res?.data?.message || "Failed to close task.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error closing tenure print task:", error);
          Swal.fire("Error", "Server error while closing task.", "error");
        }
      }
    });
  };

  if (!show) return null;

  return (
    <>
      {/* Primary Modal: Compact 3-Column Layout */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          zIndex: 1050,
        }}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          role="document"
          style={{ maxWidth: "92%", width: "92%" }}
        >
          <div className="modal-content border-0 shadow-lg tenure-compact-modal">
            {/* Header */}
            <div className="modal-header py-2 px-4 d-flex justify-content-between align-items-center border-bottom bg-white">
              <h5 className="modal-title font-weight-bold text-dark m-0">
                Print Tenure Change Letter
              </h5>
              <button
                type="button"
                className="close"
                onClick={onClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body px-4 py-3 bg-white">
              {loading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border text-primary spinner-border-sm"
                    role="status"
                  />
                  <span className="ms-2 text-muted fw-semibold small">
                    Loading employee details...
                  </span>
                </div>
              ) : details ? (
                <>
                  <div className="row g-2 tenure-legacy-grid">
                    <div className="col-md-4">
                      <span className="grid-label">Employee : </span>
                      <span className="emp-highlighted-name">
                        {details.emp_code} - {details.emp_name}
                      </span>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Date Of Joining : </span>
                      <strong className="grid-val">{details.doj || "-"}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Tenure Due Date : </span>
                      <strong className="grid-val text-dark">{details.tenure_due_date || "-"}</strong>
                    </div>

                    <div className="col-md-4">
                      <span className="grid-label">Employee Type : </span>
                      <strong className="grid-val text-uppercase">{details.emp_type || "-"}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Designation : </span>
                      <strong className="grid-val">{details.designation || "-"}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Department : </span>
                      <strong className="grid-val">{details.department || "-"}</strong>
                    </div>

                    <div className="col-md-4">
                      <span className="grid-label">Employee Period : </span>
                      <strong className="grid-val">{details.emp_period ?? "0"}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Current CTC : </span>
                      <strong className="grid-val">₹ {Number(details.curr_ctc || 0).toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">CTC Effective Date : </span>
                      <strong className="grid-val">{details.ctc_eff_from || "-"}</strong>
                    </div>

                    <div className="col-md-4">
                      <span className="grid-label">Proposed CTC : </span>
                      <strong className="grid-val">₹ {Number(details.prop_ctc || 0).toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Location : </span>
                      <strong className="grid-val">{details.location || "-"}</strong>
                    </div>
                    <div className="col-md-4">
                      <span className="grid-label">Remarks : </span>
                      <strong className="grid-val">{details.remarks || "-"}</strong>
                    </div>
                  </div>

                  {!details.doc_ref ? (
                    <div className="row align-items-center g-2 mt-3 pt-3 border-top">
                      <div className="col-md-4 col-sm-6">
                        <select
                          id="STAFF_TYPE"
                          className="form-select form-control custom-select-sm"
                          value={staffType}
                          onChange={(e) => setStaffType(e.target.value)}
                        >
                          <option value="">Please Select</option>
                          {details.template_options ? (
                            Object.entries(details.template_options).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="P">Permanent</option>
                              <option value="E">Trainee Extension</option>
                              <option value="C">Contract Extension</option>
                              <option value="Pro">Probation Extension</option>
                              <option value="Prob">Probation</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-warning px-3 py-1 fw-bold text-dark legacy-preview-btn"
                          onClick={handlePreviewTemplate}
                        >
                          Preview Template
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-success-subtle text-success border px-2 py-1">
                          Reference Code: {details.doc_ref}
                        </span>
                        <button
                          className="btn btn-outline-info btn-sm px-3"
                          type="button"
                          onClick={handleCloseTask}
                        >
                          <i className="fas fa-print me-1"></i> Close Task
                        </button>
                      </div>
                      <div style={{ height: "460px" }} className="border rounded overflow-hidden">
                        <iframe
                          title="Letter Document"
                          className="w-100 h-100 border-0"
                          src={resolveTemplateUrl(staffType || details.etype_id, empCode)}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="alert alert-warning text-center py-2 m-0 small">
                  Unable to load employee information.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer py-2 px-4 bg-light border-top d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary btn-sm px-4 fw-semibold"
                style={{ backgroundColor: "#152e4d", borderColor: "#152e4d" }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged PDF Preview Modal (98vw Width, 96vh Height) */}
      {showPreviewModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(10, 15, 29, 0.8)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered m-auto"
            role="document"
            style={{
              maxWidth: "98vw",
              width: "98vw",
              height: "96vh",
              margin: "2vh auto",
            }}
          >
            <div
              className="modal-content shadow-2xl border-0 rounded-3 overflow-hidden d-flex flex-column"
              style={{ height: "96vh" }}
            >
              {/* Header */}
              <div className="modal-header py-2 px-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-shrink-0">
                <h6 className="modal-title font-weight-bold text-dark m-0 fs-6">
                  Letter Preview — {details?.emp_name || "Employee"} ({empCode})
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl.split("#")[0]);
                    setPdfBlobUrl("");
                    setShowPreviewModal(false);
                  }}
                />
              </div>

              {/* Body: Occupies remaining vertical height */}
              <div
                className="modal-body p-0 flex-grow-1"
                style={{
                  background: "#525659",
                  overflow: "hidden",
                }}
              >
                {pdfLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100 text-white">
                    <div className="spinner-border me-2" role="status"></div>
                    <span className="fw-semibold">Rendering Letter Preview...</span>
                  </div>
                ) : (
                  pdfBlobUrl && (
                    <iframe
                      title="Letter Document"
                      src={pdfBlobUrl}
                      className="w-100 h-100 border-0 d-block"
                      style={{ minHeight: "100%" }}
                    />
                  )
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer py-2 px-3 bg-light border-top d-flex justify-content-between align-items-center flex-shrink-0">
                <span className="text-muted small">
                  Click <strong>Generate Reference Code</strong> to finalize reference numbering.
                </span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-warning btn-sm px-3 fw-bold text-dark"
                    disabled={generatingRef || pdfLoading}
                    onClick={handleGenerateRefCode}
                  >
                    {generatingRef ? "Generating..." : "Generate Reference Code"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => {
                      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl.split("#")[0]);
                      setPdfBlobUrl("");
                      setShowPreviewModal(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenureChangeLetterModal;