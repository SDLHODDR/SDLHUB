import { useState } from "react";

import { saveBankDetails } from "../../../../services/profile/profileService";

import {
  notifySuccess,
  notifyError,
} from "../../../../services/alertService";

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

    setShowBankForm(true);
  };

  /* =========================================================
     BANK INPUT CHANGE
  ========================================================= */

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;

    setBankForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE BANK DETAILS
  ========================================================= */

  const handleSaveBank = async () => {
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
       REQUIRED VALIDATION
    ======================================================= */

    if (!currentBank.bank_name) {
      notifyError("Please enter Bank Name.");
      return;
    }

    if (!currentBank.bank_branch) {
      notifyError("Please enter Bank Branch.");
      return;
    }

    if (!currentBank.bank_ifsc) {
      notifyError("Please enter IFSC.");
      return;
    }

    if (!currentBank.bank_acno) {
      notifyError("Please enter Account Number.");
      return;
    }

    /* =======================================================
       IFSC VALIDATION
    ======================================================= */

    if (!/^[A-Z0-9]+$/.test(currentBank.bank_ifsc)) {
      notifyError("Please enter a valid IFSC.");
      return;
    }

    /* =======================================================
       IFSC LENGTH VALIDATION
    ======================================================= */

    if (currentBank.bank_ifsc.length !== 11) {
      notifyError("IFSC must be 11 characters.");
      return;
    }

    /* =======================================================
       ACCOUNT NUMBER VALIDATION
    ======================================================= */

    if (!/^\d+$/.test(currentBank.bank_acno)) {
      notifyError("Account Number should contain digits only.");
      return;
    }

    /* =======================================================
       CHECK CHANGES
    ======================================================= */

    const originalBank = {
      bank_name: normalizeBankName(
        originalBankForm.bank_name
      ),

      bank_branch: normalizeBankBranch(
        originalBankForm.bank_branch
      ),

      bank_ifsc: normalizeBankIfsc(
        originalBankForm.bank_ifsc
      ),

      bank_acno: normalizeBankAccount(
        originalBankForm.bank_acno
      ),

      bank_nominee: normalizeBankNominee(
        originalBankForm.bank_nominee
      ),
    };

    const hasChanges =
      currentBank.bank_name !== originalBank.bank_name ||
      currentBank.bank_branch !== originalBank.bank_branch ||
      currentBank.bank_ifsc !== originalBank.bank_ifsc ||
      currentBank.bank_acno !== originalBank.bank_acno ||
      currentBank.bank_nominee !== originalBank.bank_nominee;

    if (!hasChanges) {
      notifyError(
        "No changes found in bank details."
      );

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

  console.log("BANK UPDATE PAYLOAD:", payload);

  const res = await saveBankDetails(payload);

  console.log("BANK UPDATE RESPONSE:", res);

  if (res?.status) {
    setShowBankForm(false);

    notifySuccess(
      res?.message ||
        "Bank details update request submitted successfully for authorization."
    );

    return;
  }

  notifyError(
    res?.message ||
      "Unable to submit bank details update request."
  );

} catch (error) {

  console.error("BANK UPDATE ERROR:", error);

  const apiMessage =
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unable to submit bank details update request.";

  notifyError(apiMessage);

} finally {

  setBankSaving(false);
}
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
          <h6 className="mb-1">
            Bank & Other Details
          </h6>

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

              <td>
                {emp?.BANK_NAME || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Account Number:</strong>
              </td>

              <td>
                {emp?.BANK_ACCT || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>IFSC:</strong>
              </td>

              <td>
                {emp?.AC_IFSC_NO || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Branch:</strong>
              </td>

              <td>
                {emp?.AC_BRANCH_NAME || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Bank Nominee:</strong>
              </td>

              <td>
                {emp?.BANK_NOMINEE || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Pan Number:</strong>
              </td>

              <td>
                {emp?.IT_NO || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Aadhaar Number:</strong>
              </td>

              <td>
                {emp?.AADHAR_NO || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>PF (UAN):</strong>
              </td>

              <td>
                {emp?.UAN_NO || "Not Given"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>ESI Number:</strong>
              </td>

              <td>
                {emp?.ESIC_NO || "NA"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Working Site:</strong>
              </td>

              <td>
                {emp?.WORK_SITE || "Not Given"}
              </td>
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
                  <h5 className="modal-title mb-1">
                    Update Bank Details
                  </h5>

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
                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>

              {/* =============================================
                  MODAL BODY
              ============================================= */}

              <div className="modal-body">

                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <i className="ti ti-info-circle me-2"></i>

                  <span>
                    Your current bank details will remain
                    unchanged until the request is authorized.
                  </span>
                </div>

                <div className="row g-3">

                  {/* =========================================
                      BANK NAME
                  ========================================= */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Bank Name
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="bank_name"
                      value={bankForm.bank_name}
                      onChange={handleBankInputChange}
                      placeholder="Enter Bank Name"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>

                  {/* =========================================
                      BRANCH
                  ========================================= */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Bank Branch
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="bank_branch"
                      value={bankForm.bank_branch}
                      onChange={handleBankInputChange}
                      placeholder="Enter Bank Branch"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </div>

                  {/* =========================================
                      IFSC
                  ========================================= */}

                  <div className="col-md-6">
                    <label className="form-label">
                      IFSC
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control text-uppercase"
                      name="bank_ifsc"
                      value={bankForm.bank_ifsc}
                      onChange={(e) => {
                        const value =
                          e.target.value
                            .toUpperCase()
                            .replace(
                              /[^A-Z0-9]/g,
                              ""
                            )
                            .slice(0, 11);

                        setBankForm((prev) => ({
                          ...prev,
                          bank_ifsc: value,
                        }));
                      }}
                      placeholder="Enter IFSC"
                      maxLength={11}
                      autoComplete="off"
                    />
                  </div>

                  {/* =========================================
                      ACCOUNT NUMBER
                  ========================================= */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Account Number
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="bank_acno"
                      value={bankForm.bank_acno}
                      onChange={(e) => {
                        const value =
                          e.target.value
                            .replace(/\D/g, "");

                        setBankForm((prev) => ({
                          ...prev,
                          bank_acno: value,
                        }));
                      }}
                      placeholder="Enter Account Number"
                      maxLength={50}
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>

                  {/* =========================================
                      NOMINEE
                  ========================================= */}

                  <div className="col-md-6">
                    <label className="form-label">
                      Bank Nominee
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="bank_nominee"
                      value={bankForm.bank_nominee}
                      onChange={handleBankInputChange}
                      placeholder="Enter Bank Nominee"
                      maxLength={100}
                      autoComplete="off"
                    />
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