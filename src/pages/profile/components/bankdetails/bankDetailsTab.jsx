import { useState } from "react";

import { saveBankDetails } from "../../../../services/profile/profileService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../../../services/alertService";

/* =========================================================
   RENDER PENDING BANK DETAILS IN POPUP (Clean Card Format)
========================================================= */

const renderPendingBankDetailsHtml = (message, pendingData) => {
  if (!pendingData || Object.keys(pendingData).length === 0) {
    return `<div style="font-size: 0.95rem; color: #4b5563; line-height: 1.5;">${message}</div>`;
  }

  const fields = [
    { label: "Bank Name", value: pendingData.bank_name },
    { label: "Branch", value: pendingData.bank_branch },
    { label: "IFSC Code", value: pendingData.bank_ifsc },
    { label: "Account Number", value: pendingData.bank_acno },
    { label: "Bank Nominee", value: pendingData.bank_nominee },
  ];

  const detailRows = fields
    .filter((f) => Boolean(f.value))
    .map(
      (f) => `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 7px 12px; font-weight: 500; color: #64748b; width: 40%;">${f.label}</td>
        <td style="padding: 7px 12px; font-weight: 600; color: #1e293b;">${f.value}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="text-align: left; font-size: 0.9rem;">
      <p style="color: #475569; margin-bottom: 14px; text-align: center; line-height: 1.5;">
        ${message}
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #f1f5f9; padding: 8px 12px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.04em; border-bottom: 1px solid #e2e8f0;">
          Pending Bank Request Details
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
          <tbody>
            ${detailRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

const bankDetailsTab = ({ profile }) => {
  /* =========================================================
     PROFILE / EMPLOYEE
  ========================================================= */

  const emp = profile?.employee || {};

  /* =========================================================
     STATE
  ========================================================= */

  const [showBankForm, setShowBankForm] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  const [bankForm, setBankForm] = useState({
    bank_name: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_acno: "",
    bank_nominee: "",
  });

  const [originalBankForm, setOriginalBankForm] = useState({
    bank_name: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_acno: "",
    bank_nominee: "",
  });

  /* INLINE VALIDATION STATES */
  const [bankErrors, setBankErrors] = useState({
    bank_name: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_acno: "",
    bank_nominee: "",
  });

  const [bankValidated, setBankValidated] = useState({
    bank_name: false,
    bank_branch: false,
    bank_ifsc: false,
    bank_acno: false,
    bank_nominee: false,
  });

  /* =========================================================
     NORMALIZATION HELPERS
  ========================================================= */

  const normalizeBankValue = (value) => {
    return String(value ?? "")
      .trim()
      .replace(/\s+/g, " ");
  };

  const normalizeBankName = (value) => {
    return normalizeBankValue(value).toUpperCase();
  };

  const normalizeBankBranch = (value) => {
    return normalizeBankValue(value).toUpperCase();
  };

  const normalizeBankIfsc = (value) => {
    return String(value ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  };

  const normalizeBankAccount = (value) => {
    return String(value ?? "")
      .trim()
      .replace(/\D/g, "");
  };

  const normalizeBankNominee = (value) => {
    return normalizeBankValue(value);
  };

  /* =========================================================
     INLINE VALIDATION LOGIC
  ========================================================= */

  const validateBankField = (field, value) => {
    const val = String(value ?? "").trim();
    let error = "";

    switch (field) {
      case "bank_name":
        if (!val) {
          error = "Please enter Bank Name.";
        }
        break;

      case "bank_branch":
        if (!val) {
          error = "Please enter Bank Branch.";
        }
        break;

      case "bank_ifsc":
        if (!val) {
          error = "Please enter IFSC.";
        } else if (!/^[A-Z0-9]+$/.test(val)) {
          error = "Please enter a valid IFSC (letters and digits only).";
        } else if (val.length !== 11) {
          error = "IFSC must be exactly 11 characters.";
        }
        break;

      case "bank_acno":
        if (!val) {
          error = "Please enter Account Number.";
        } else if (!/^\d+$/.test(val)) {
          error = "Account Number should contain digits only.";
        } else if (val.length < 6) {
          error = "Account Number should be at least 6 digits.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateBankForm = (formValues = bankForm) => {
    const errors = {
      bank_name: validateBankField("bank_name", formValues.bank_name),
      bank_branch: validateBankField("bank_branch", formValues.bank_branch),
      bank_ifsc: validateBankField("bank_ifsc", formValues.bank_ifsc),
      bank_acno: validateBankField("bank_acno", formValues.bank_acno),
      bank_nominee: "",
    };

    setBankValidated({
      bank_name: true,
      bank_branch: true,
      bank_ifsc: true,
      bank_acno: true,
      bank_nominee: false,
    });

    setBankErrors(errors);

    return !Object.values(errors).some(Boolean);
  };

  /* =========================================================
     EDIT BANK
  ========================================================= */

  const handleEditBank = () => {
    const currentBank = {
      bank_name: normalizeBankName(emp?.BANK_NAME),
      bank_branch: normalizeBankBranch(emp?.AC_BRANCH_NAME),
      bank_ifsc: normalizeBankIfsc(emp?.AC_IFSC_NO),
      bank_acno: normalizeBankAccount(emp?.BANK_ACCT),
      bank_nominee: normalizeBankNominee(emp?.BANK_NOMINEE),
    };

    setBankForm(currentBank);
    setOriginalBankForm(currentBank);

    setBankErrors({
      bank_name: "",
      bank_branch: "",
      bank_ifsc: "",
      bank_acno: "",
      bank_nominee: "",
    });

    setBankValidated({
      bank_name: false,
      bank_branch: false,
      bank_ifsc: false,
      bank_acno: false,
      bank_nominee: false,
    });

    setShowBankForm(true);
  };

  /* =========================================================
     BANK INPUT CHANGE
  ========================================================= */

  const handleBankInputChange = (field, value) => {
    let processedValue = value;

    if (field === "bank_ifsc") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    } else if (field === "bank_acno") {
      processedValue = value.replace(/\D/g, "").slice(0, 30);
    }

    setBankForm((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    setBankValidated((prev) => ({
      ...prev,
      [field]: false,
    }));

    setBankErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleBankBlur = (field) => {
    const error = validateBankField(field, bankForm[field]);
    setBankValidated((prev) => ({ ...prev, [field]: true }));
    setBankErrors((prev) => ({ ...prev, [field]: error }));
  };

  /* =========================================================
     SAVE BANK DETAILS
  ========================================================= */

  const handleSaveBank = async () => {
    /* =======================================================
       INLINE FORM VALIDATION
    ======================================================= */

    const isValid = validateBankForm();
    if (!isValid) return;

    /* =======================================================
       NORMALIZE FORM VALUES
    ======================================================= */

    const currentBank = {
      bank_name: normalizeBankName(bankForm.bank_name),
      bank_branch: normalizeBankBranch(bankForm.bank_branch),
      bank_ifsc: normalizeBankIfsc(bankForm.bank_ifsc),
      bank_acno: normalizeBankAccount(bankForm.bank_acno),
      bank_nominee: normalizeBankNominee(bankForm.bank_nominee),
    };

    /* =======================================================
       CHECK CHANGES
    ======================================================= */

    const originalBank = {
      bank_name: normalizeBankName(originalBankForm.bank_name),
      bank_branch: normalizeBankBranch(originalBankForm.bank_branch),
      bank_ifsc: normalizeBankIfsc(originalBankForm.bank_ifsc),
      bank_acno: normalizeBankAccount(originalBankForm.bank_acno),
      bank_nominee: normalizeBankNominee(originalBankForm.bank_nominee),
    };

    const hasChanges =
      currentBank.bank_name !== originalBank.bank_name ||
      currentBank.bank_branch !== originalBank.bank_branch ||
      currentBank.bank_ifsc !== originalBank.bank_ifsc ||
      currentBank.bank_acno !== originalBank.bank_acno ||
      currentBank.bank_nominee !== originalBank.bank_nominee;

    if (!hasChanges) {
      notifyWarning("No changes found in bank details.");
      return;
    }

    /* =======================================================
       START SUBMIT
    ======================================================= */

    setBankSaving(true);

    try {
      const payload = {
        bank_name: currentBank.bank_name,
        bank_branch: currentBank.bank_branch,
        bank_ifsc: currentBank.bank_ifsc,
        bank_acno: currentBank.bank_acno,
        bank_nominee: currentBank.bank_nominee,
      };

      const res = await saveBankDetails(payload);

      if (res?.status) {
        setShowBankForm(false);
        notifySuccess(
          res?.message ||
            "Bank details update request submitted successfully for authorization."
        );
        return;
      }

      notifyError(
        res?.message || "Unable to submit bank details update request."
      );
    } catch (error) {
      console.error("BANK UPDATE ERROR:", error);

      const responseData = error?.response?.data || error?.data;
      const apiMessage =
        responseData?.message ||
        error?.message ||
        "Unable to submit bank details update request.";

      if (error?.response?.status === 409 || error?.status === 409) {
        const pendingDetails = responseData?.data?.pending_data;
        notifyWarning(
          renderPendingBankDetailsHtml(apiMessage, pendingDetails)
        );
      } else {
        notifyError(apiMessage);
      }
    } finally {
      setBankSaving(false);
    }
  };

  /* =========================================================
     INLINE HELPER COMPONENTS & CLASSES
  ========================================================= */

  const getBankInputClass = (field) => {
    if (!bankValidated[field]) return "form-control";
    if (bankErrors[field]) return "form-control is-invalid";
    return "form-control is-valid";
  };

  const FieldError = ({ message }) => {
    if (!message) return null;
    return (
      <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
        <i className="ti ti-alert-circle me-1"></i>
        {message}
      </div>
    );
  };

  const ValidTick = ({ field }) => {
    if (!bankValidated[field] || bankErrors[field]) return null;
    return (
      <span
        className="text-success ms-2"
        style={{ fontSize: "18px", fontWeight: "bold" }}
      >
        ✓
      </span>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-1">Bank & Other Details</h6>
          <small className="text-muted">
            Bank detail changes require authorization.
          </small>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleEditBank}
        >
          <i className="ti ti-edit me-1"></i>
          Update
        </button>
      </div>

      {/* =====================================================
          DETAILS TABLE
      ===================================================== */}

      <div className="table-responsive">
        <table className="table table-nowrap mb-0 table-sm">
          <tbody>
            <tr>
              <td style={{ width: "220px" }}>
                <strong>Bank Name:</strong>
              </td>
              <td>{emp?.BANK_NAME || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>Account Number:</strong>
              </td>
              <td>{emp?.BANK_ACCT || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>IFSC:</strong>
              </td>
              <td>{emp?.AC_IFSC_NO || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>Branch:</strong>
              </td>
              <td>{emp?.AC_BRANCH_NAME || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>Bank Nominee:</strong>
              </td>
              <td>{emp?.BANK_NOMINEE || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>Pan Number:</strong>
              </td>
              <td>{emp?.IT_NO || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>Aadhaar Number:</strong>
              </td>
              <td>{emp?.AADHAR_NO || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>PF (UAN):</strong>
              </td>
              <td>{emp?.UAN_NO || "Not Given"}</td>
            </tr>

            <tr>
              <td>
                <strong>ESI Number:</strong>
              </td>
              <td>{emp?.ESIC_NO || "NA"}</td>
            </tr>

            <tr>
              <td>
                <strong>Working Site:</strong>
              </td>
              <td>{emp?.WORK_SITE || "Not Given"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* =====================================================
          BANK UPDATE MODAL
      ===================================================== */}

      {showBankForm && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* =============================================
                  MODAL HEADER
              ============================================= */}

              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Update Bank Details</h5>
                  <small className="text-muted">
                    Changes will be sent for authorization.
                  </small>
                </div>

                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={() => {
                    if (!bankSaving) {
                      setShowBankForm(false);
                    }
                  }}
                  disabled={bankSaving}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {/* =============================================
                  MODAL BODY
              ============================================= */}

              <div className="modal-body">
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <i className="ti ti-info-circle me-2"></i>
                  <span>
                    Your current bank details will remain unchanged until the
                    request is authorized.
                  </span>
                </div>

                <div className="row g-3">
                  {/* BANK NAME */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Bank Name <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className={getBankInputClass("bank_name")}
                        name="bank_name"
                        value={bankForm.bank_name}
                        onChange={(e) =>
                          handleBankInputChange("bank_name", e.target.value)
                        }
                        onBlur={() => handleBankBlur("bank_name")}
                        placeholder="Enter Bank Name"
                        maxLength={100}
                        autoComplete="off"
                        disabled={bankSaving}
                      />
                      <ValidTick field="bank_name" />
                    </div>
                    <FieldError message={bankErrors.bank_name} />
                  </div>

                  {/* BRANCH */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Bank Branch <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className={getBankInputClass("bank_branch")}
                        name="bank_branch"
                        value={bankForm.bank_branch}
                        onChange={(e) =>
                          handleBankInputChange("bank_branch", e.target.value)
                        }
                        onBlur={() => handleBankBlur("bank_branch")}
                        placeholder="Enter Bank Branch"
                        maxLength={100}
                        autoComplete="off"
                        disabled={bankSaving}
                      />
                      <ValidTick field="bank_branch" />
                    </div>
                    <FieldError message={bankErrors.bank_branch} />
                  </div>

                  {/* IFSC */}
                  <div className="col-md-6">
                    <label className="form-label">
                      IFSC <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className={`${getBankInputClass("bank_ifsc")} text-uppercase`}
                        name="bank_ifsc"
                        value={bankForm.bank_ifsc}
                        onChange={(e) =>
                          handleBankInputChange("bank_ifsc", e.target.value)
                        }
                        onBlur={() => handleBankBlur("bank_ifsc")}
                        placeholder="Enter IFSC"
                        maxLength={11}
                        autoComplete="off"
                        disabled={bankSaving}
                      />
                      <ValidTick field="bank_ifsc" />
                    </div>
                    <FieldError message={bankErrors.bank_ifsc} />
                  </div>

                  {/* ACCOUNT NUMBER */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Account Number <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className={getBankInputClass("bank_acno")}
                        name="bank_acno"
                        value={bankForm.bank_acno}
                        onChange={(e) =>
                          handleBankInputChange("bank_acno", e.target.value)
                        }
                        onBlur={() => handleBankBlur("bank_acno")}
                        placeholder="Enter Account Number"
                        maxLength={30}
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={bankSaving}
                      />
                      <ValidTick field="bank_acno" />
                    </div>
                    <FieldError message={bankErrors.bank_acno} />
                  </div>

                  {/* NOMINEE (OPTIONAL) */}
                  <div className="col-md-6">
                    <label className="form-label">Bank Nominee</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className="form-control"
                        name="bank_nominee"
                        value={bankForm.bank_nominee}
                        onChange={(e) =>
                          handleBankInputChange("bank_nominee", e.target.value)
                        }
                        placeholder="Enter Bank Nominee (Optional)"
                        maxLength={100}
                        autoComplete="off"
                        disabled={bankSaving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =============================================
                  MODAL FOOTER
              ============================================= */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleSaveBank}
                  disabled={bankSaving}
                >
                  {bankSaving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-check me-1"></i>
                      Update
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBankForm(false)}
                  disabled={bankSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default bankDetailsTab;