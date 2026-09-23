import { useState } from "react";

import {
  sendPersonalDetailsOtp,
  verifyPersonalDetailsOtp,
  savePersonalDetails,
  saveAddressDetails,
} from "../../../../services/profile/profileService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../../../services/alertService";

/* =========================================================
   PERSONAL DETAILS TAB
========================================================= */

const PersonalDetailsTab = ({ profile, onProfileUpdated }) => {
  const employee = profile?.employee || {};

  /* =======================================================
     MODALS
  ======================================================= */

  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPendingAddressModal, setShowPendingAddressModal] = useState(false);
  const [pendingAddressRequest, setPendingAddressRequest] = useState(null);

  /* =======================================================
     CONTACT FORM & MULTI-STEP STATE
     contactStep: 'edit' -> 'auth'
  ======================================================= */

  const [contactStep, setContactStep] = useState("edit");

  const [contactForm, setContactForm] = useState({
    mobile: employee?.CELL || "",
    personalEmail: employee?.PER_EMAIL || "",
    maritalStatus: employee?.M_STATUS ?? "",
    otp: "",
  });

  const [contactErrors, setContactErrors] = useState({
    mobile: "",
    personalEmail: "",
    maritalStatus: "",
    otp: "",
  });

  const [contactValidated, setContactValidated] = useState({
    mobile: false,
    personalEmail: false,
    maritalStatus: false,
    otp: false,
  });

  const [requestId, setRequestId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  /* =======================================================
     ADDRESS FORM
  ======================================================= */

  const [addressForm, setAddressForm] = useState({
    address: employee?.ADDRESS || "",
    city: employee?.CITY || "",
    state: employee?.STATE || "",
    pincode: employee?.PINCODE || "",

    permnt_address: employee?.PERMNT_ADDRESS || "",
    permnt_city: employee?.PERMNT_CITY || "",
    permnt_state: employee?.PERMNT_STATE || "",
    permnt_pincode: employee?.PERMNT_PINCODE || "",

    sameAsCurrent: false,
    address_proof: null,
  });

  const [addressErrors, setAddressErrors] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    permnt_address: "",
    permnt_city: "",
    permnt_state: "",
    permnt_pincode: "",
    address_proof: "",
  });

  const [addressValidated, setAddressValidated] = useState({
    address: false,
    city: false,
    state: false,
    pincode: false,
    permnt_address: false,
    permnt_city: false,
    permnt_state: false,
    permnt_pincode: false,
    address_proof: false,
  });

  const [addressLoading, setAddressLoading] = useState(false);

  /* =======================================================
     DISPLAY HELPERS
  ======================================================= */

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "—";
    }
    return value;
  };

  const getFullName = () => {
    return (
      [employee?.FNAME, employee?.MNAME, employee?.LNAME]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        )
        .join(" ") || "—"
    );
  };

  const getMaritalStatus = (value) => {
    switch (String(value)) {
      case "1":
        return "Married";
      case "0":
        return "Single";
      case "2":
        return "Divorced";
      case "3":
        return "Widowed";
      default:
        return displayValue(value);
    }
  };

  const getCurrentAddress = () => {
    const values = [
      employee?.ADDRESS,
      employee?.CITY,
      employee?.STATE,
      employee?.PINCODE,
    ].filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== ""
    );
    return values.length ? values.join(", ") : "—";
  };

  const getPermanentAddress = () => {
    const values = [
      employee?.PERMNT_ADDRESS,
      employee?.PERMNT_CITY,
      employee?.PERMNT_STATE,
      employee?.PERMNT_PINCODE,
    ].filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== ""
    );
    return values.length ? values.join(", ") : "—";
  };

  /* =======================================================
     OPEN CONTACT MODAL
  ======================================================= */

  const openContactModal = () => {
    setContactForm({
      mobile: employee?.CELL || "",
      personalEmail: employee?.PER_EMAIL || "",
      maritalStatus: employee?.M_STATUS ?? "",
      otp: "",
    });

    setContactErrors({
      mobile: "",
      personalEmail: "",
      maritalStatus: "",
      otp: "",
    });

    setContactValidated({
      mobile: false,
      personalEmail: false,
      maritalStatus: false,
      otp: false,
    });

    setContactStep("edit");
    setRequestId("");
    setOtpSent(false);
    setOtpVerified(false);

    setShowContactModal(true);
  };

  /* =======================================================
     OPEN ADDRESS MODAL
  ======================================================= */

  const openAddressModal = () => {
    setAddressForm({
      address: employee?.ADDRESS || "",
      city: employee?.CITY || "",
      state: employee?.STATE || "",
      pincode: employee?.PINCODE || "",

      permnt_address: employee?.PERMNT_ADDRESS || "",
      permnt_city: employee?.PERMNT_CITY || "",
      permnt_state: employee?.PERMNT_STATE || "",
      permnt_pincode: employee?.PERMNT_PINCODE || "",

      sameAsCurrent: false,
      address_proof: null,
    });

    setAddressErrors({
      address: "",
      city: "",
      state: "",
      pincode: "",
      permnt_address: "",
      permnt_city: "",
      permnt_state: "",
      permnt_pincode: "",
      address_proof: "",
    });

    setAddressValidated({
      address: false,
      city: false,
      state: false,
      pincode: false,
      permnt_address: false,
      permnt_city: false,
      permnt_state: false,
      permnt_pincode: false,
      address_proof: false,
    });

    setShowAddressModal(true);
  };

  /* =======================================================
     CONTACT FIELD VALIDATION
  ======================================================= */

  const validateContactField = (field, value) => {
    const fieldValue = String(value ?? "").trim();
    let error = "";

    switch (field) {
      case "mobile":
        if (!fieldValue) {
          error = "Mobile number is required.";
        } else if (!/^[0-9]{10}$/.test(fieldValue)) {
          error = "Please enter a valid 10 digit mobile number.";
        }
        break;

      case "personalEmail":
        if (!fieldValue) {
          error = "Personal email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
          error = "Please enter a valid email address.";
        }
        break;

      case "maritalStatus":
        if (!["0", "1", "2", "3"].includes(String(value))) {
          error = "Please select marital status.";
        }
        break;

      case "otp":
        if (!fieldValue) {
          error = "OTP is required.";
        } else if (!/^[0-9]{5}$/.test(fieldValue)) {
          error = "Please enter a valid 5 digit OTP.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateContactForm = () => {
    const errors = {
      mobile: validateContactField("mobile", contactForm.mobile),
      personalEmail: validateContactField("personalEmail", contactForm.personalEmail),
      maritalStatus: validateContactField("maritalStatus", contactForm.maritalStatus),
      otp: "",
    };

    setContactValidated((prev) => ({
      ...prev,
      mobile: true,
      personalEmail: true,
      maritalStatus: true,
    }));

    setContactErrors((prev) => ({
      ...prev,
      mobile: errors.mobile,
      personalEmail: errors.personalEmail,
      maritalStatus: errors.maritalStatus,
    }));

    return !(errors.mobile || errors.personalEmail || errors.maritalStatus);
  };

  /* =======================================================
     STEP 1: CONFIRM & CHECK CHANGES (CLICK 'UPDATE')
  ======================================================= */

  const handleConfirmUpdate = () => {
    const isValid = validateContactForm();
    if (!isValid) return;

    const originalCell = String(employee?.CELL || "").trim();
    const originalEmail = String(employee?.PER_EMAIL || "").trim().toLowerCase();
    const originalMStatus = String(employee?.M_STATUS ?? "").trim();

    const newCell = String(contactForm.mobile || "").trim();
    const newEmail = String(contactForm.personalEmail || "").trim().toLowerCase();
    const newMStatus = String(contactForm.maritalStatus ?? "").trim();

    const hasChanges =
      newCell !== originalCell ||
      newEmail !== originalEmail ||
      newMStatus !== originalMStatus;

    if (!hasChanges) {
      notifyWarning("No changes detected in your contact details.");
      return;
    }

    // Move to Authorization (Step 2)
    setContactStep("auth");
  };

  /* =======================================================
     CONTACT CHANGE HANDLER
  ======================================================= */

  const handleContactChange = (field, value) => {
    let newValue = value;

    if (field === "mobile") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (field === "otp") {
      newValue = value.replace(/\D/g, "").slice(0, 5);
    }

    setContactForm((prev) => ({
      ...prev,
      [field]: newValue,
    }));

    setContactValidated((prev) => ({
      ...prev,
      [field]: false,
    }));

    setContactErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    if (otpSent && ["mobile", "personalEmail", "maritalStatus"].includes(field)) {
      setOtpVerified(false);
      setRequestId("");
      setOtpSent(false);

      setContactForm((prev) => ({
        ...prev,
        otp: "",
      }));

      setContactValidated((prev) => ({
        ...prev,
        otp: false,
      }));

      setContactErrors((prev) => ({
        ...prev,
        otp: "",
      }));
    }
  };

  /* =======================================================
     STEP 2: SEND OTP
  ======================================================= */

  const handleSendOTP = async () => {
    setContactLoading(true);

    try {
      const res = await sendPersonalDetailsOtp({
        cell: contactForm.mobile,
        per_email: contactForm.personalEmail,
        m_status: contactForm.maritalStatus,
      });

      if (!res?.status) {
        notifyError(res?.message || "Unable to send OTP.");
        return;
      }

      setRequestId(res?.data?.request_id || res?.data?.ID || "");
      setOtpSent(true);
      setOtpVerified(false);

      setContactValidated((prev) => ({
        ...prev,
        otp: false,
      }));

      setContactErrors((prev) => ({
        ...prev,
        otp: "",
      }));

      notifySuccess(res?.message || "OTP sent successfully to your mobile number.");
    } catch (error) {
      console.error("SEND OTP ERROR:", error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send OTP."
      );
    } finally {
      setContactLoading(false);
    }
  };

  /* =======================================================
     STEP 2: VERIFY OTP
  ======================================================= */

  const handleVerifyOTP = async () => {
    if (!requestId) {
      setContactErrors((prev) => ({
        ...prev,
        otp: "OTP request not found. Please click 'Send OTP' again.",
      }));
      setContactValidated((prev) => ({
        ...prev,
        otp: true,
      }));
      return;
    }

    const otpError = validateContactField("otp", contactForm.otp);

    setContactValidated((prev) => ({
      ...prev,
      otp: true,
    }));

    setContactErrors((prev) => ({
      ...prev,
      otp: otpError,
    }));

    if (otpError) return;

    setContactLoading(true);

    try {
      const res = await verifyPersonalDetailsOtp({
        request_id: requestId,
        otp: contactForm.otp,
      });

      if (!res?.status) {
        setContactErrors((prev) => ({
          ...prev,
          otp: res?.message || "Invalid OTP.",
        }));
        setOtpVerified(false);
        return;
      }

      setOtpVerified(true);
      setContactErrors((prev) => ({
        ...prev,
        otp: "",
      }));

      notifySuccess(res?.message || "OTP verified successfully.");
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);
      setOtpVerified(false);
      setContactErrors((prev) => ({
        ...prev,
        otp:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to verify OTP.",
      }));
    } finally {
      setContactLoading(false);
    }
  };

  /* =======================================================
     STEP 2: FINAL SUBMIT TO MASTER TABLE
  ======================================================= */

  const handleSaveContact = async () => {
    if (!otpVerified) {
      setContactValidated((prev) => ({
        ...prev,
        otp: true,
      }));
      setContactErrors((prev) => ({
        ...prev,
        otp: "Please verify OTP before submitting.",
      }));
      return;
    }

    setContactLoading(true);

    try {
      const res = await savePersonalDetails({
        request_id: requestId,
        cell: contactForm.mobile,
        per_email: contactForm.personalEmail,
        m_status: contactForm.maritalStatus,
      });

      if (!res?.status) {
        notifyError(res?.message || "Unable to update personal details.");
        return;
      }

      notifySuccess(res?.message || "Personal details updated successfully.");
      setShowContactModal(false);

      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (error) {
      console.error("SAVE CONTACT ERROR:", error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update personal details."
      );
    } finally {
      setContactLoading(false);
    }
  };

  /* =======================================================
     ADDRESS HELPERS & VALIDATION
  ======================================================= */

  const validateAddressField = (field, value, form = addressForm) => {
    const fieldValue = String(value ?? "").trim();
    let error = "";

    switch (field) {
      case "address":
        if (!fieldValue) error = "Current address is required.";
        break;
      case "city":
        if (!fieldValue) error = "Current city is required.";
        break;
      case "state":
        if (!fieldValue) error = "Current state is required.";
        break;
      case "pincode":
        if (!fieldValue) {
          error = "Current pincode is required.";
        } else if (!/^[0-9]{6}$/.test(fieldValue)) {
          error = "Please enter a valid 6 digit pincode.";
        }
        break;
      case "permnt_address":
        if (!form.sameAsCurrent && !fieldValue) error = "Permanent address is required.";
        break;
      case "permnt_city":
        if (!form.sameAsCurrent && !fieldValue) error = "Permanent city is required.";
        break;
      case "permnt_state":
        if (!form.sameAsCurrent && !fieldValue) error = "Permanent state is required.";
        break;
      case "permnt_pincode":
        if (!form.sameAsCurrent && !fieldValue) {
          error = "Permanent pincode is required.";
        } else if (!form.sameAsCurrent && !/^[0-9]{6}$/.test(fieldValue)) {
          error = "Please enter a valid 6 digit pincode.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleAddressChange = (field, value) => {
    let newValue = value;
    if (field === "pincode" || field === "permnt_pincode") {
      newValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setAddressForm((prev) => {
      const updated = { ...prev, [field]: newValue };
      if (prev.sameAsCurrent && ["address", "city", "state", "pincode"].includes(field)) {
        updated.permnt_address = field === "address" ? newValue : updated.address;
        updated.permnt_city = field === "city" ? newValue : updated.city;
        updated.permnt_state = field === "state" ? newValue : updated.state;
        updated.permnt_pincode = field === "pincode" ? newValue : updated.pincode;
      }
      return updated;
    });

    setAddressValidated((prev) => ({ ...prev, [field]: false }));
    setAddressErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSameAddress = (checked) => {
    setAddressForm((prev) => ({
      ...prev,
      sameAsCurrent: checked,
      ...(checked
        ? {
            permnt_address: prev.address,
            permnt_city: prev.city,
            permnt_state: prev.state,
            permnt_pincode: prev.pincode,
          }
        : {}),
    }));

    setAddressValidated((prev) => ({
      ...prev,
      permnt_address: false,
      permnt_city: false,
      permnt_state: false,
      permnt_pincode: false,
    }));

    setAddressErrors((prev) => ({
      ...prev,
      permnt_address: "",
      permnt_city: "",
      permnt_state: "",
      permnt_pincode: "",
    }));
  };

  const handleAddressProofChange = (event) => {
    const file = event.target.files?.[0] || null;
    let error = "";

    if (!file) {
      error = "Please upload address proof.";
    } else {
      const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(extension)) {
        error = "Only PDF, JPG, JPEG or PNG files are allowed.";
      } else if (file.size > 5 * 1024 * 1024) {
        error = "File size must not exceed 5 MB.";
      }
    }

    setAddressForm((prev) => ({ ...prev, address_proof: error ? null : file }));
    setAddressValidated((prev) => ({ ...prev, address_proof: true }));
    setAddressErrors((prev) => ({ ...prev, address_proof: error }));
    if (error) event.target.value = "";
  };

  const validateAddressForm = () => {
    const errors = {
      address: validateAddressField("address", addressForm.address, addressForm),
      city: validateAddressField("city", addressForm.city, addressForm),
      state: validateAddressField("state", addressForm.state, addressForm),
      pincode: validateAddressField("pincode", addressForm.pincode, addressForm),
      permnt_address: validateAddressField("permnt_address", addressForm.permnt_address, addressForm),
      permnt_city: validateAddressField("permnt_city", addressForm.permnt_city, addressForm),
      permnt_state: validateAddressField("permnt_state", addressForm.permnt_state, addressForm),
      permnt_pincode: validateAddressField("permnt_pincode", addressForm.permnt_pincode, addressForm),
      address_proof: addressForm.address_proof ? "" : "Please upload address proof.",
    };

    setAddressValidated({
      address: true,
      city: true,
      state: true,
      pincode: true,
      permnt_address: true,
      permnt_city: true,
      permnt_state: true,
      permnt_pincode: true,
      address_proof: true,
    });

    setAddressErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmitAddress = async () => {
    const valid = validateAddressForm();
    if (!valid) return;

    setAddressLoading(true);

    try {
      const response = await saveAddressDetails({
        address: addressForm.address,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        permnt_address: addressForm.permnt_address,
        permnt_city: addressForm.permnt_city,
        permnt_state: addressForm.permnt_state,
        permnt_pincode: addressForm.permnt_pincode,
        address_proof: addressForm.address_proof,
      });

      const apiResponse =
        response?.data && typeof response.data === "object" ? response.data : response;

      if (apiResponse?.status === false && apiResponse?.data?.request_id) {
        setPendingAddressRequest({ ...apiResponse.data });
        setShowAddressModal(false);
        setShowPendingAddressModal(true);
        return;
      }

      if (apiResponse?.status === false) {
        notifyError(apiResponse?.message || "Unable to submit address change request.");
        return;
      }

      notifySuccess(apiResponse?.message || "Address change request submitted for authorisation.");
      setShowAddressModal(false);

      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (error) {
      console.error("ADDRESS API ERROR:", error);
      const errorData = error?.response?.data || {};

      if (errorData?.data?.request_id) {
        setPendingAddressRequest({ ...errorData.data });
        setShowAddressModal(false);
        setShowPendingAddressModal(true);
        return;
      }

      notifyError(errorData?.message || error?.message || "Unable to submit address change request.");
    } finally {
      setAddressLoading(false);
    }
  };

  /* =======================================================
     INPUT CLASS HELPERS
  ======================================================= */

  const getContactInputClass = (field) => {
    if (!contactValidated[field]) return "form-control";
    if (contactErrors[field]) return "form-control is-invalid";
    return "form-control is-valid";
  };

  const getContactSelectClass = (field) => {
    if (!contactValidated[field]) return "form-select";
    if (contactErrors[field]) return "form-select is-invalid";
    return "form-select is-valid";
  };

  const getAddressInputClass = (field) => {
    if (!addressValidated[field]) return "form-control";
    if (addressErrors[field]) return "form-control is-invalid";
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

  const ValidTick = ({ field, errors, validated }) => {
    if (!validated[field] || errors[field]) return null;
    return (
      <span className="text-success ms-2" style={{ fontSize: "18px", fontWeight: "bold" }}>
        ✓
      </span>
    );
  };

  const DetailItem = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "col-12 mb-2" : "col-xl-6 col-lg-6 col-md-6 col-12 mb-2"}>
      <div className="d-flex align-items-start">
        <div className="text-muted fw-medium" style={{ minWidth: "135px", fontSize: "13px" }}>
          {label}
        </div>
        <div className="fw-semibold text-dark" style={{ fontSize: "13px", lineHeight: "1.45", wordBreak: "break-word" }}>
          {displayValue(value)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ===================================================
           PERSONAL INFORMATION
      =================================================== */}

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold">Personal Information</h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={openContactModal}
          >
            <i className="ti ti-edit me-1"></i>
            Edit Contact Details
          </button>
        </div>

        <hr className="mt-0 mb-3" />

        <div className="row">
          <DetailItem label="Full Name:" value={getFullName()} />
          <DetailItem label="Date Of Birth:" value={employee?.DOB} />
          <DetailItem label="Location:" value={employee?.CITY} />
          <DetailItem
            label="Marital Status:"
            value={getMaritalStatus(employee?.M_STATUS)}
          />
          <DetailItem label="Blood Group:" value={employee?.BLOOD_GRP} />
        </div>
      </div>

      {/* ===================================================
           ADDRESS
      =================================================== */}

      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold">Address</h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={openAddressModal}
          >
            <i className="ti ti-edit me-1"></i>
            Edit Address
          </button>
        </div>

        <hr className="mt-0 mb-3" />

        <div className="row">
          <DetailItem label="Current Address:" value={getCurrentAddress()} fullWidth />
          <DetailItem label="Permanent Address:" value={getPermanentAddress()} fullWidth />
        </div>
      </div>

      {/* ===================================================
           CONTACT DETAILS MODAL (MULTI-STEP)
      =================================================== */}

      {showContactModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* HEADER */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">
                    {contactStep === "edit"
                      ? "Update Contact Details"
                      : "Authorize Contact Update"}
                  </h5>
                  <small className="text-muted">
                    {contactStep === "edit"
                      ? "Enter your updated contact information below."
                      : "Verify with OTP to finalize changes in your profile."}
                  </small>
                </div>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowContactModal(false)}
                  disabled={contactLoading}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {/* BODY */}
              <div className="modal-body">
                {/* STEP 1: EDIT FORM */}
                {contactStep === "edit" && (
                  <>
                    {/* MOBILE */}
                    <div className="mb-3">
                      <label className="form-label">
                        Mobile No. <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className={getContactInputClass("mobile")}
                          value={contactForm.mobile}
                          maxLength={10}
                          inputMode="numeric"
                          onChange={(e) => handleContactChange("mobile", e.target.value)}
                        />
                        <ValidTick
                          field="mobile"
                          errors={contactErrors}
                          validated={contactValidated}
                        />
                      </div>
                      <FieldError message={contactErrors.mobile} />
                    </div>

                    {/* PERSONAL EMAIL */}
                    <div className="mb-3">
                      <label className="form-label">
                        Personal Email <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="email"
                          className={getContactInputClass("personalEmail")}
                          value={contactForm.personalEmail}
                          onChange={(e) => handleContactChange("personalEmail", e.target.value)}
                        />
                        <ValidTick
                          field="personalEmail"
                          errors={contactErrors}
                          validated={contactValidated}
                        />
                      </div>
                      <FieldError message={contactErrors.personalEmail} />
                    </div>

                    {/* MARITAL STATUS */}
                    <div className="mb-3">
                      <label className="form-label">
                        Marital Status <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="d-flex align-items-center">
                        <select
                          className={getContactSelectClass("maritalStatus")}
                          value={contactForm.maritalStatus}
                          onChange={(e) => handleContactChange("maritalStatus", e.target.value)}
                        >
                          <option value="">Select Marital Status</option>
                          <option value="0">Single</option>
                          <option value="1">Married</option>
                          <option value="2">Divorced</option>
                          <option value="3">Widowed</option>
                        </select>
                        <ValidTick
                          field="maritalStatus"
                          errors={contactErrors}
                          validated={contactValidated}
                        />
                      </div>
                      <FieldError message={contactErrors.maritalStatus} />
                    </div>
                  </>
                )}

                {/* STEP 2: AUTHORIZATION (OTP) */}
                {contactStep === "auth" && (
                  <>
                    <div className="alert alert-info py-2 mb-3">
                      <div className="fw-semibold mb-1">
                        <i className="ti ti-shield-check me-1"></i> Confirm Your Updates:
                      </div>
                      <ul className="mb-0 ps-3" style={{ fontSize: "13px" }}>
                        <li>
                          <strong>Mobile:</strong> {contactForm.mobile}
                        </li>
                        <li>
                          <strong>Email:</strong> {contactForm.personalEmail}
                        </li>
                        <li>
                          <strong>Marital Status:</strong> {getMaritalStatus(contactForm.maritalStatus)}
                        </li>
                      </ul>
                    </div>

                    {!otpSent ? (
                      <div className="text-center py-3">
                        <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                          Click <strong>"Send OTP"</strong> to receive a 5-digit verification code on your mobile number (<strong>{contactForm.mobile}</strong>).
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSendOTP}
                          disabled={contactLoading}
                        >
                          {contactLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-send me-1"></i> Send OTP
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label">
                          Enter 5-Digit OTP <span className="text-danger ms-1">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={getContactInputClass("otp")}
                            value={contactForm.otp}
                            maxLength={5}
                            inputMode="numeric"
                            placeholder="Enter 5 digit OTP"
                            disabled={otpVerified}
                            onChange={(e) => handleContactChange("otp", e.target.value)}
                          />
                          <button
                            type="button"
                            className={`btn ${otpVerified ? "btn-success" : "btn-outline-success"}`}
                            onClick={handleVerifyOTP}
                            disabled={contactLoading || otpVerified}
                          >
                            {contactLoading && !otpVerified ? "Verifying..." : otpVerified ? "Verified ✓" : "Verify OTP"}
                          </button>
                        </div>
                        <FieldError message={contactErrors.otp} />

                        {otpVerified ? (
                          <div className="text-success mt-2 fw-medium" style={{ fontSize: "13px" }}>
                            <i className="ti ti-circle-check me-1"></i> OTP verified successfully. Click <strong>Submit</strong> to save.
                          </div>
                        ) : (
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">Didn't receive code?</small>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-decoration-none"
                              onClick={handleSendOTP}
                              disabled={contactLoading}
                            >
                              Resend OTP
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                {contactStep === "edit" ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleConfirmUpdate}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowContactModal(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {otpSent && otpVerified && (
                      <button
                        type="button"
                        className="btn btn-success me-2"
                        onClick={handleSaveContact}
                        disabled={contactLoading}
                      >
                        {contactLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (contactStep === "auth") {
                          setContactStep("edit");
                          setOtpSent(false);
                          setOtpVerified(false);
                          setRequestId("");
                        } else {
                          setShowContactModal(false);
                        }
                      }}
                      disabled={contactLoading}
                    >
                      {contactStep === "auth" ? "Back to Edit" : "Cancel"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
           ADDRESS PENDING & EDIT MODALS
      =================================================== */}

      {showPendingAddressModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">Address Change Request Already Exists</h5>
                  <small className="text-muted">
                    Your previous address change request is still pending for authorisation.
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPendingAddressModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="alert alert-warning d-flex align-items-start mb-3">
                  <i className="ti ti-alert-triangle me-2 mt-1" style={{ fontSize: "22px" }}></i>
                  <div>
                    <div className="fw-semibold">Address update request already submitted</div>
                    <div style={{ fontSize: "14px" }}>
                      You cannot submit another address change request until the existing request is authorised or closed.
                    </div>
                  </div>
                </div>

                {pendingAddressRequest && (
                  <>
                    <div className="border rounded p-3 mb-4">
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <div className="text-muted" style={{ fontSize: "12px" }}>Request ID</div>
                          <div className="fw-semibold">{displayValue(pendingAddressRequest.request_id)}</div>
                        </div>
                        <div className="col-md-4 mb-2">
                          <div className="text-muted" style={{ fontSize: "12px" }}>Status</div>
                          <div>
                            <span className="badge bg-warning text-dark">
                              {pendingAddressRequest.status === "N"
                                ? "New - Pending Authorisation"
                                : pendingAddressRequest.status === "T"
                                  ? "Transit - Pending Authorisation"
                                  : displayValue(pendingAddressRequest.status)}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4 mb-2">
                          <div className="text-muted" style={{ fontSize: "12px" }}>Requested On</div>
                          <div className="fw-semibold">{displayValue(pendingAddressRequest.requested_on)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-semibold mb-2">
                        <i className="ti ti-map-pin me-1"></i> Previously Requested Current Address
                      </h6>
                      <div className="border rounded p-3">
                        <div className="row">
                          <div className="col-12 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>Address</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_address?.address)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>City</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_address?.city)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>State</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_address?.state)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>Pincode</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_address?.pincode)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="ti ti-home me-1"></i> Previously Requested Permanent Address
                      </h6>
                      <div className="border rounded p-3">
                        <div className="row">
                          <div className="col-12 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>Address</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_permanent_address?.address)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>City</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_permanent_address?.city)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>State</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_permanent_address?.state)}</div>
                          </div>
                          <div className="col-md-4 mb-2">
                            <div className="text-muted" style={{ fontSize: "12px" }}>Pincode</div>
                            <div className="fw-semibold">{displayValue(pendingAddressRequest?.new_permanent_address?.pincode)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {pendingAddressRequest?.document?.name && (
                      <div className="mt-3">
                        <h6 className="fw-semibold mb-2">
                          <i className="ti ti-file-check me-1"></i> Address Proof Submitted
                        </h6>
                        <div className="border rounded p-2 d-flex align-items-center" style={{ backgroundColor: "#f8f9fa" }}>
                          <i className="ti ti-file me-2" style={{ fontSize: "20px" }}></i>
                          <span>{pendingAddressRequest?.document?.name}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPendingAddressModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">Update Address</h5>
                  <small className="text-muted">
                    Address changes require authorisation and address proof.
                  </small>
                </div>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowAddressModal(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="modal-body">
                <h6 className="fw-semibold mb-2">Current Address</h6>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Address <span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      className={getAddressInputClass("address")}
                      rows="3"
                      value={addressForm.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                    />
                    <FieldError message={addressErrors.address} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      City <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("city")}
                      value={addressForm.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                    />
                    <FieldError message={addressErrors.city} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      State <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("state")}
                      value={addressForm.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                    />
                    <FieldError message={addressErrors.state} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Pincode <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("pincode")}
                      value={addressForm.pincode}
                      maxLength={6}
                      inputMode="numeric"
                      onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    />
                    <FieldError message={addressErrors.pincode} />
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="sameAddress"
                    checked={addressForm.sameAsCurrent}
                    onChange={(e) => handleSameAddress(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="sameAddress">
                    Permanent address is same as current address
                  </label>
                </div>

                <h6 className="fw-semibold mb-2">Permanent Address</h6>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Address <span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      className={getAddressInputClass("permnt_address")}
                      rows="3"
                      value={addressForm.permnt_address}
                      disabled={addressForm.sameAsCurrent}
                      onChange={(e) => handleAddressChange("permnt_address", e.target.value)}
                    />
                    <FieldError message={addressErrors.permnt_address} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      City <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("permnt_city")}
                      value={addressForm.permnt_city}
                      disabled={addressForm.sameAsCurrent}
                      onChange={(e) => handleAddressChange("permnt_city", e.target.value)}
                    />
                    <FieldError message={addressErrors.permnt_city} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      State <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("permnt_state")}
                      value={addressForm.permnt_state}
                      disabled={addressForm.sameAsCurrent}
                      onChange={(e) => handleAddressChange("permnt_state", e.target.value)}
                    />
                    <FieldError message={addressErrors.permnt_state} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Pincode <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={getAddressInputClass("permnt_pincode")}
                      value={addressForm.permnt_pincode}
                      maxLength={6}
                      disabled={addressForm.sameAsCurrent}
                      inputMode="numeric"
                      onChange={(e) => handleAddressChange("permnt_pincode", e.target.value)}
                    />
                    <FieldError message={addressErrors.permnt_pincode} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Address Proof <span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="file"
                    className={
                      addressValidated.address_proof
                        ? addressErrors.address_proof
                          ? "form-control is-invalid"
                          : "form-control is-valid"
                        : "form-control"
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAddressProofChange}
                  />
                  <small className="text-muted">
                    Upload address proof in PDF, JPG or PNG format. Maximum size: 5 MB.
                  </small>
                  <FieldError message={addressErrors.address_proof} />
                  {addressForm.address_proof && !addressErrors.address_proof && (
                    <div className="text-success mt-1" style={{ fontSize: "12px" }}>
                      <i className="ti ti-file-check me-1"></i>
                      {addressForm.address_proof.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleSubmitAddress}
                  disabled={addressLoading}
                >
                  {addressLoading ? "Submitting..." : "Send for Authorisation"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddressModal(false)}
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

export default PersonalDetailsTab;